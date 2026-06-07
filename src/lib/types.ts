export type RoomStatus = "waiting" | "setup" | "playing" | "finished";
export type GuessResult = "higher" | "lower" | "correct";

export interface Room {
  id: string;
  status: RoomStatus;
  digits: number; // secret length for the current round (3-6)
  turn_seconds: number; // 0 = unlimited, else 15/30/60
  allow_random: boolean;
  allow_hidden: boolean;
  allow_hints: boolean;
  allow_tracker: boolean;
  turn: string | null;
  winner: string | null;
  turn_deadline: string | null; // ISO timestamp when current turn auto-skips
  started_at: string | null; // when play began (for game duration)
  created_at: string;
  updated_at: string;
}

export interface RoomSettings {
  digits: number;
  turnSeconds: number;
  allowRandom: boolean;
  allowHidden: boolean;
  allowHints: boolean;
  allowTracker: boolean;
}

// NOTE: there is intentionally no `secret` field anywhere on the client.
export interface Player {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  is_host: boolean;
  has_submitted: boolean;
  secret_hidden: boolean; // player chose to play blind (doesn't know own number)
  joined_at: string;
}

export interface Guess {
  id: number;
  room_id: string;
  player_id: string;
  guess: string;
  result: GuessResult;
  created_at: string;
}
