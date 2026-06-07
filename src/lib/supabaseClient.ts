"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaces a clear message in the browser console during setup.
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase environment variables. Copy .env.local.example to " +
      ".env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Single shared browser client. We persist the (anonymous) auth session so a
// player keeps the same identity across reloads/reconnects — but NO game
// secret is ever stored client-side.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "gtn-auth",
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
  return client;
}

/**
 * Ensure the visitor has an (anonymous) auth identity. Returns the user id.
 * This id is used by the database to know "who" is making each call so it can
 * enforce turn order and hide the opponent's secret.
 */
export async function ensureSession(): Promise<string> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Could not establish a session");
  return data.user.id;
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
