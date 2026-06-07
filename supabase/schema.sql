-- =============================================================================
--  Guess the Number — Database schema, security model, and game logic
-- =============================================================================
--  Run this entire file once in the Supabase SQL Editor (Dashboard -> SQL).
--
--  PRIVACY & SECURITY MODEL
--  --------------------------------------------------------------------------
--  1. Secrets live in their own table `player_secrets`, with RLS enabled and
--     SELECT revoked from client roles -> no client can ever read a secret
--     directly. A player can fetch ONLY THEIR OWN secret (and only if they
--     didn't choose to keep it hidden) via reveal_my_secret().
--  2. The opponent's exact guesses and results are NEVER sent to the client.
--     RLS on `guesses` only exposes a player's OWN rows. The opponent's
--     activity is available only as a masked count via get_opponent_progress().
--  3. `player_secrets` and `guesses` are NOT in the Realtime publication, so
--     no secret or guess row is ever broadcast. Realtime only carries `rooms`
--     and `players` (no sensitive data), which signal the client to re-fetch.
--  4. All writes go through audited SECURITY DEFINER RPCs that validate turn
--     order, digit length and room state server-side. The database computes
--     every higher/lower/correct comparison; no client hint is ever trusted.
-- =============================================================================

-- ----------------------------------------------------------------------------
--  Clean slate (safe to re-run)
-- ----------------------------------------------------------------------------
drop function if exists public.create_room(text) cascade;
drop function if exists public.join_room(text, text) cascade;
drop function if exists public.set_digits(text, int) cascade;
drop function if exists public.set_room_settings(text, int, int, boolean, boolean, boolean, boolean) cascade;
drop function if exists public.skip_turn(text) cascade;
drop function if exists public.get_hint(text, int) cascade;
drop function if exists public.submit_secret(text, text) cascade;
drop function if exists public.submit_random_secret(text, boolean) cascade;
drop function if exists public.reveal_my_secret(text) cascade;
drop function if exists public.get_opponent_progress(text) cascade;
drop function if exists public.make_guess(text, text) cascade;
drop function if exists public.rematch(text) cascade;
drop function if exists public.leave_room(text) cascade;
drop function if exists public.is_room_member(text) cascade;
drop function if exists public.my_player_id(text) cascade;
drop function if exists public._store_secret(text, text, boolean) cascade;
drop function if exists public._gen_room_code() cascade;

drop table if exists public.guesses cascade;
drop table if exists public.player_secrets cascade;
drop table if exists public.players cascade;
drop table if exists public.rooms cascade;

-- ----------------------------------------------------------------------------
--  Tables
-- ----------------------------------------------------------------------------

create table public.rooms (
  id            text primary key,
  status        text not null default 'waiting'
                check (status in ('waiting', 'setup', 'playing', 'finished')),
  digits        int  not null default 4 check (digits between 3 and 6),
  turn_seconds  int  not null default 0,      -- 0 = unlimited; else 15/30/60
  allow_random  boolean not null default true,-- random secret allowed
  allow_hidden  boolean not null default true,-- hidden random secret allowed
  allow_hints   boolean not null default false,
  allow_tracker boolean not null default true,-- range tracker allowed
  turn          uuid,
  winner        uuid,
  turn_deadline timestamptz,                  -- when the current turn auto-skips
  started_at    timestamptz,                  -- when play (guessing) began
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- A player belongs to exactly one room. NEVER stores a secret.
create table public.players (
  id            uuid primary key default gen_random_uuid(),
  room_id       text not null references public.rooms(id) on delete cascade,
  user_id       uuid not null,                  -- auth.uid() (anonymous sign-in)
  name          text not null,
  is_host       boolean not null default false, -- host is "Player 1"
  has_submitted boolean not null default false,
  secret_hidden boolean not null default false, -- true => player chose to play blind
  joined_at     timestamptz not null default now(),
  unique (room_id, user_id)
);

-- Secrets are isolated here. RLS on + SELECT revoked => unreadable by clients.
create table public.player_secrets (
  room_id    text not null references public.rooms(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  secret     text not null check (secret ~ '^[0-9]{3,6}$'),
  primary key (room_id, player_id)
);

-- Every guess and the server-computed result. RLS exposes only your own rows.
create table public.guesses (
  id          bigint generated always as identity primary key,
  room_id     text not null references public.rooms(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  guess       text not null check (guess ~ '^[0-9]{3,6}$'),
  result      text not null check (result in ('higher', 'lower', 'correct')),
  created_at  timestamptz not null default now()
);

create index guesses_room_idx on public.guesses (room_id, created_at);
create index players_room_idx on public.players (room_id);

-- ----------------------------------------------------------------------------
--  Row Level Security
-- ----------------------------------------------------------------------------
alter table public.rooms          enable row level security;
alter table public.players        enable row level security;
alter table public.player_secrets enable row level security;  -- no policies => locked
alter table public.guesses        enable row level security;

-- SECURITY DEFINER helpers (bypass RLS to avoid recursion).
create function public.is_room_member(p_room text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.players where room_id = p_room and user_id = auth.uid()
  );
$$;

create function public.my_player_id(p_room text)
returns uuid language sql security definer stable set search_path = public as $$
  select id from public.players where room_id = p_room and user_id = auth.uid();
$$;

-- Members may read their room and the players in it.
create policy "members read room" on public.rooms
  for select using (public.is_room_member(id));

create policy "members read players" on public.players
  for select using (public.is_room_member(room_id));

-- Players may read ONLY THEIR OWN guesses. Opponent guesses are never exposed.
create policy "players read own guesses" on public.guesses
  for select using (player_id = public.my_player_id(room_id));

-- ----------------------------------------------------------------------------
--  Explicit table privileges (defense in depth)
-- ----------------------------------------------------------------------------
grant select on public.rooms    to anon, authenticated;
grant select on public.players  to anon, authenticated;
grant select on public.guesses  to anon, authenticated;  -- RLS still limits to own rows
revoke all on public.player_secrets from anon, authenticated;

-- ----------------------------------------------------------------------------
--  Realtime: rooms and players ONLY (no secrets, no guesses are broadcast).
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Make sure guesses/secrets are NOT in the publication (idempotent).
do $$
begin
  if exists (select 1 from pg_publication_tables
             where pubname='supabase_realtime' and schemaname='public' and tablename='guesses') then
    alter publication supabase_realtime drop table public.guesses;
  end if;
  if exists (select 1 from pg_publication_tables
             where pubname='supabase_realtime' and schemaname='public' and tablename='player_secrets') then
    alter publication supabase_realtime drop table public.player_secrets;
  end if;
end $$;

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter table public.rooms    replica identity full;
alter table public.players  replica identity full;

-- ----------------------------------------------------------------------------
--  Game logic (all SECURITY DEFINER, all validating server-side)
-- ----------------------------------------------------------------------------

create function public._gen_room_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text; i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.rooms where id = code);
  end loop;
  return code;
end;
$$;

create function public.create_room(p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_name text := nullif(btrim(p_name), '');
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if v_name is null then raise exception 'Name is required'; end if;
  v_code := public._gen_room_code();
  insert into public.rooms (id, status, digits) values (v_code, 'waiting', 4);
  insert into public.players (room_id, user_id, name, is_host)
    values (v_code, auth.uid(), left(v_name, 20), true);
  return v_code;
end;
$$;

create function public.join_room(p_code text, p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_name text := nullif(btrim(p_name), '');
  v_status text; v_count int; v_already boolean;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if v_name is null then raise exception 'Name is required'; end if;

  select status into v_status from public.rooms where id = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;

  select exists (
    select 1 from public.players where room_id = v_code and user_id = auth.uid()
  ) into v_already;
  if v_already then return v_code; end if;

  select count(*) into v_count from public.players where room_id = v_code;
  if v_count >= 2 then raise exception 'Room is full'; end if;
  if v_status = 'finished' then raise exception 'This game has already finished'; end if;

  insert into public.players (room_id, user_id, name, is_host)
    values (v_code, auth.uid(), left(v_name, 20), false);

  update public.rooms set status = 'setup', updated_at = now()
    where id = v_code and status = 'waiting';
  return v_code;
end;
$$;

create function public.set_digits(p_code text, p_digits int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_me public.players%rowtype; v_status text; v_submitted int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_digits is null or p_digits < 3 or p_digits > 6 then
    raise exception 'Digits must be between 3 and 6'; end if;

  select status into v_status from public.rooms where id = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;
  if v_status <> 'setup' then raise exception 'Digit length can only be changed during setup'; end if;

  select * into v_me from public.players where room_id = v_code and user_id = auth.uid();
  if v_me.id is null then raise exception 'You are not in this room'; end if;
  if not v_me.is_host then raise exception 'Only the host can change the digit length'; end if;

  select count(*) into v_submitted from public.players
    where room_id = v_code and has_submitted = true;
  if v_submitted > 0 then
    raise exception 'Cannot change length after a number has been locked in'; end if;

  update public.rooms set digits = p_digits, updated_at = now() where id = v_code;
end;
$$;

-- Internal: store a secret and, if both players are ready, start play.
create function public._store_secret(p_code text, p_secret text, p_hidden boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_player public.players%rowtype; v_status text; v_submitted int; v_host uuid;
begin
  select status into v_status from public.rooms where id = p_code for update;
  if v_status is null then raise exception 'Room not found'; end if;
  if v_status <> 'setup' then raise exception 'Secrets can only be set during setup'; end if;

  select * into v_player from public.players where room_id = p_code and user_id = auth.uid();
  if v_player.id is null then raise exception 'You are not in this room'; end if;
  if v_player.has_submitted then raise exception 'You have already locked your number'; end if;

  insert into public.player_secrets (room_id, player_id, secret)
    values (p_code, v_player.id, p_secret)
    on conflict (room_id, player_id) do update set secret = excluded.secret;

  update public.players set has_submitted = true, secret_hidden = p_hidden
    where id = v_player.id;

  select count(*) into v_submitted from public.players
    where room_id = p_code and has_submitted = true;
  if v_submitted = 2 then
    select id into v_host from public.players where room_id = p_code and is_host = true;
    update public.rooms r set status = 'playing', turn = v_host, updated_at = now(),
      started_at = now(),
      turn_deadline = case when r.turn_seconds > 0
                           then now() + make_interval(secs => r.turn_seconds) else null end
      where r.id = p_code;
  end if;
end;
$$;

-- Manually submit your own secret (you typed it, so you know it).
create function public.submit_secret(p_code text, p_secret text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_digits int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select digits into v_digits from public.rooms where id = v_code;
  if v_digits is null then raise exception 'Room not found'; end if;
  if p_secret is null or p_secret !~ ('^[0-9]{' || v_digits || '}$') then
    raise exception 'Secret must be exactly % digits', v_digits; end if;
  perform public._store_secret(v_code, p_secret, false);
end;
$$;

-- Generate a random secret of the room's digit length and submit it.
-- Range follows the digit length (e.g. 4 digits = 1000-9999, no leading zeros).
-- If p_reveal is false the player plays blind; the value is returned only when revealed.
create function public.submit_random_secret(p_code text, p_reveal boolean)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_digits int;
  v_min bigint; v_max bigint; v_secret text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select digits into v_digits from public.rooms where id = v_code;
  if v_digits is null then raise exception 'Room not found'; end if;

  v_min := power(10, v_digits - 1)::bigint;        -- 100 / 1000 / 10000 / 100000
  v_max := power(10, v_digits)::bigint - 1;        -- 999 / 9999 / 99999 / 999999
  v_secret := (v_min + floor(random() * (v_max - v_min + 1)))::bigint::text;

  perform public._store_secret(v_code, v_secret, not coalesce(p_reveal, false));

  if coalesce(p_reveal, false) then
    return v_secret;
  else
    return null;
  end if;
end;
$$;

-- Return the caller's OWN secret, only if they did not choose to keep it hidden.
-- Never returns the opponent's secret.
create function public.reveal_my_secret(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_secret text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select ps.secret into v_secret
    from public.player_secrets ps
    join public.players p on p.id = ps.player_id
    where p.room_id = v_code and p.user_id = auth.uid() and p.secret_hidden = false;
  return v_secret;  -- null if hidden or not submitted
end;
$$;

-- Masked opponent activity: how many guesses the opponent has made. Nothing else.
create function public.get_opponent_progress(p_code text)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_me uuid; v_n int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  v_me := public.my_player_id(v_code);
  if v_me is null then return 0; end if;
  select count(*) into v_n from public.guesses
    where room_id = v_code and player_id <> v_me;
  return coalesce(v_n, 0);
end;
$$;

-- Make a guess. The DB compares and returns 'higher' | 'lower' | 'correct'.
create function public.make_guess(p_code text, p_guess text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_room public.rooms%rowtype; v_me public.players%rowtype;
  v_opponent_id uuid; v_secret text; v_result text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select * into v_room from public.rooms where id = v_code for update;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if v_room.status <> 'playing' then raise exception 'The game is not in progress'; end if;
  if p_guess is null or p_guess !~ ('^[0-9]{' || v_room.digits || '}$') then
    raise exception 'Guess must be exactly % digits', v_room.digits; end if;

  select * into v_me from public.players where room_id = v_code and user_id = auth.uid();
  if v_me.id is null then raise exception 'You are not in this room'; end if;
  if v_room.turn is distinct from v_me.id then raise exception 'It is not your turn'; end if;

  select id into v_opponent_id from public.players
    where room_id = v_code and id <> v_me.id limit 1;
  if v_opponent_id is null then raise exception 'Opponent has left the room'; end if;

  select secret into v_secret from public.player_secrets
    where room_id = v_code and player_id = v_opponent_id;
  if v_secret is null then raise exception 'Opponent has no secret set'; end if;

  if p_guess::int = v_secret::int then v_result := 'correct';
  elsif v_secret::int > p_guess::int then v_result := 'higher';
  else v_result := 'lower';
  end if;

  insert into public.guesses (room_id, player_id, guess, result)
    values (v_code, v_me.id, p_guess, v_result);

  if v_result = 'correct' then
    update public.rooms set status = 'finished', winner = v_me.id, turn = null,
      turn_deadline = null, updated_at = now()
      where id = v_code;
  else
    update public.rooms r set turn = v_opponent_id, updated_at = now(),
      turn_deadline = case when r.turn_seconds > 0
                           then now() + make_interval(secs => r.turn_seconds) else null end
      where r.id = v_code;
  end if;
  return v_result;
end;
$$;

-- RESET / rematch: clears secrets, guesses, results, hidden state, winner;
-- keeps the same two players; returns to setup (digit length preserved).
create function public.rematch(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_count int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not public.is_room_member(v_code) then raise exception 'You are not in this room'; end if;

  select count(*) into v_count from public.players where room_id = v_code;
  if v_count < 2 then raise exception 'Need two players for a rematch'; end if;

  delete from public.guesses where room_id = v_code;
  delete from public.player_secrets where room_id = v_code;
  update public.players set has_submitted = false, secret_hidden = false where room_id = v_code;
  update public.rooms set status = 'setup', turn = null, winner = null,
    turn_deadline = null, started_at = null, updated_at = now()
    where id = v_code;
end;
$$;

-- Host configures the round (during setup, before anyone has locked a number).
create function public.set_room_settings(
  p_code text, p_digits int, p_turn_seconds int,
  p_allow_random boolean, p_allow_hidden boolean,
  p_allow_hints boolean, p_allow_tracker boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_me public.players%rowtype; v_status text; v_submitted int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_digits < 3 or p_digits > 6 then raise exception 'Digits must be 3-6'; end if;
  if p_turn_seconds not in (0,15,30,60) then raise exception 'Bad turn timer'; end if;

  select status into v_status from public.rooms where id = v_code for update;
  if v_status is null then raise exception 'Room not found'; end if;
  if v_status <> 'setup' then raise exception 'Settings can only change during setup'; end if;

  select * into v_me from public.players where room_id = v_code and user_id = auth.uid();
  if v_me.id is null then raise exception 'You are not in this room'; end if;
  if not v_me.is_host then raise exception 'Only the host can change settings'; end if;

  select count(*) into v_submitted from public.players
    where room_id = v_code and has_submitted = true;
  if v_submitted > 0 then raise exception 'Cannot change settings after a number is locked in'; end if;

  update public.rooms set
    digits = p_digits, turn_seconds = p_turn_seconds,
    allow_random = p_allow_random, allow_hidden = p_allow_hidden,
    allow_hints = p_allow_hints, allow_tracker = p_allow_tracker,
    updated_at = now()
    where id = v_code;
end;
$$;

-- Pass/skip the current turn. The current player may pass; either player may
-- advance the game once the turn timer has expired.
create function public.skip_turn(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_room public.rooms%rowtype; v_me uuid; v_opponent_id uuid; v_expired boolean;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into v_room from public.rooms where id = v_code for update;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if v_room.status <> 'playing' then return; end if;

  v_me := public.my_player_id(v_code);
  if v_me is null then raise exception 'You are not in this room'; end if;

  v_expired := v_room.turn_deadline is not null and now() > v_room.turn_deadline;
  -- only the player on turn can voluntarily pass; anyone can advance if expired
  if v_room.turn is distinct from v_me and not v_expired then
    raise exception 'It is not your turn';
  end if;

  select id into v_opponent_id from public.players
    where room_id = v_code and id <> v_room.turn limit 1;
  if v_opponent_id is null then return; end if;

  update public.rooms r set turn = v_opponent_id, updated_at = now(),
    turn_deadline = case when r.turn_seconds > 0
                         then now() + make_interval(secs => r.turn_seconds) else null end
    where r.id = v_code;
end;
$$;

-- A hint about the OPPONENT's secret for the caller, without revealing the number.
-- Requires hints to be enabled and at least one prior guess. p_index rotates the
-- hint type (0=half, 1=parity, 2+=first digit).
create function public.get_hint(p_code text, p_index int)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code));
  v_room public.rooms%rowtype; v_me uuid; v_opp uuid;
  v_secret int; v_low bigint; v_high bigint; v_mid bigint; v_guesses int;
  g record;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into v_room from public.rooms where id = v_code;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if not v_room.allow_hints then raise exception 'Hints are disabled in this room'; end if;

  v_me := public.my_player_id(v_code);
  if v_me is null then raise exception 'You are not in this room'; end if;

  select count(*) into v_guesses from public.guesses where room_id = v_code and player_id = v_me;
  if v_guesses < 1 then raise exception 'Make a guess before asking for a hint'; end if;

  select id into v_opp from public.players where room_id = v_code and id <> v_me limit 1;
  select secret::int into v_secret from public.player_secrets
    where room_id = v_code and player_id = v_opp;
  if v_secret is null then raise exception 'No opponent secret'; end if;

  -- current feasible range from the caller's own guesses
  v_low := power(10, v_room.digits - 1)::bigint;
  v_high := power(10, v_room.digits)::bigint - 1;
  for g in select guess, result from public.guesses
           where room_id = v_code and player_id = v_me loop
    if g.result = 'higher' then v_low := greatest(v_low, g.guess::bigint + 1);
    elsif g.result = 'lower' then v_high := least(v_high, g.guess::bigint - 1);
    end if;
  end loop;
  v_mid := (v_low + v_high) / 2;

  if p_index <= 0 then
    if v_secret <= v_mid then
      return 'It''s in the LOWER half (' || v_low || '–' || v_mid || ') / Нижня половина';
    else
      return 'It''s in the UPPER half (' || (v_mid + 1) || '–' || v_high || ') / Верхня половина';
    end if;
  elsif p_index = 1 then
    if v_secret % 2 = 0 then return 'The number is EVEN / Число ПАРНЕ';
    else return 'The number is ODD / Число НЕПАРНЕ'; end if;
  else
    return 'The first digit is ' || left(v_secret::text, 1) || ' / Перша цифра: ' || left(v_secret::text, 1);
  end if;
end;
$$;

create function public.leave_room(p_code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(btrim(p_code)); v_remaining int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  delete from public.players where room_id = v_code and user_id = auth.uid();
  select count(*) into v_remaining from public.players where room_id = v_code;
  if v_remaining = 0 then
    delete from public.rooms where id = v_code;
  else
    update public.rooms
      set status = case when status in ('playing', 'setup') then 'setup' else status end,
          turn = null, updated_at = now()
      where id = v_code;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
--  Permissions
-- ----------------------------------------------------------------------------
grant execute on function public.create_room(text)                  to anon, authenticated;
grant execute on function public.join_room(text, text)              to anon, authenticated;
grant execute on function public.set_digits(text, int)              to anon, authenticated;
grant execute on function public.set_room_settings(text, int, int, boolean, boolean, boolean, boolean) to anon, authenticated;
grant execute on function public.skip_turn(text)                    to anon, authenticated;
grant execute on function public.get_hint(text, int)                to anon, authenticated;
grant execute on function public.submit_secret(text, text)          to anon, authenticated;
grant execute on function public.submit_random_secret(text, boolean) to anon, authenticated;
grant execute on function public.reveal_my_secret(text)             to anon, authenticated;
grant execute on function public.get_opponent_progress(text)        to anon, authenticated;
grant execute on function public.make_guess(text, text)             to anon, authenticated;
grant execute on function public.rematch(text)                      to anon, authenticated;
grant execute on function public.leave_room(text)                   to anon, authenticated;
grant execute on function public.is_room_member(text)               to anon, authenticated;
grant execute on function public.my_player_id(text)                 to anon, authenticated;

-- Internal helpers are not granted to clients.
revoke all on function public._gen_room_code() from anon, authenticated;
revoke all on function public._store_secret(text, text, boolean) from anon, authenticated;

-- =============================================================================
--  End of schema
-- =============================================================================
