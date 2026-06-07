// Couple Mode: fun, light real-life challenges the winner can pick after a win.
// Expandable — add more lines here.
export const COUPLE_CHALLENGES: string[] = [
  "Give a genuine compliment 💬",
  "Buy the next coffee ☕",
  "Give a 10-second hug 🤗",
  "Tell a little secret 🤫",
  "Plan the next date 🗓️",
  "Do the dishes tonight 🍽️",
  "Send a sweet good-morning text tomorrow 🌅",
  "Pick the movie tonight 🎬",
  "Give a shoulder massage 💆",
  "Cook (or order) their favorite meal 🍝",
  "Share one thing you love about them ❤️",
  "Loser makes the bed for a week 🛏️",
];

export function randomChallenge(exclude?: string): string {
  const pool = exclude
    ? COUPLE_CHALLENGES.filter((c) => c !== exclude)
    : COUPLE_CHALLENGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function coupleModeOn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("gtn-couple") === "1";
}
