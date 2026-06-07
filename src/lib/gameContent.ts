// Central content registry. Every mode, difficulty, AI level, ability and
// setting is described here once, then surfaced in info panels, the pre-match
// summary, tooltips and the Help encyclopedia. One source of truth.

export interface InfoEntry {
  id: string;
  name: string;
  emoji: string;
  short: string; // one-line description
  detailed: string; // how it works
  example: string; // example of gameplay
  advantages: string[];
  disadvantages: string[];
  bestFor?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Very hard";
  length?: string; // estimated match length
}

export const MODES: InfoEntry[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "🎯",
    short: "The standard Higher / Lower game.",
    detailed:
      "After every guess you're told whether the secret is HIGHER or LOWER than your guess. Narrow it down until you hit it exactly.",
    example:
      "Secret 4544. You guess 3000 → HIGHER. You guess 6000 → LOWER. You guess 4544 → CORRECT.",
    advantages: ["Simple and intuitive", "Rewards logical narrowing"],
    disadvantages: ["Less surprising once you know the strategy"],
    bestFor: "New players",
    difficulty: "Easy",
    length: "2–5 minutes",
  },
  {
    id: "hotcold",
    name: "Hot & Cold",
    emoji: "🔥",
    short: "Feedback by distance instead of higher/lower.",
    detailed:
      "Instead of HIGHER/LOWER you're told how close you are: 🔥 Very Hot, 🌡 Hot, 🙂 Close, 🥶 Cold, ❄ Very Cold. You feel your way toward the number.",
    example:
      "Secret 4544. Guess 5000 → 🌡 Hot. Guess 4600 → 🔥 Very Hot. Guess 4544 → CORRECT.",
    advantages: ["Fresh, intuitive feel", "Less mechanical than binary search"],
    disadvantages: ["Harder to be perfectly optimal", "No exact range tracker"],
    bestFor: "Players who like a warmer, intuitive game",
    difficulty: "Medium",
    length: "3–6 minutes",
  },
  {
    id: "hardcore",
    name: "Hardcore",
    emoji: "💀",
    short: "No tracker, no hints, no history.",
    detailed:
      "Pure recall. You get HIGHER/LOWER feedback but no range tracker, no hints, and your past guesses aren't listed — you must remember them yourself.",
    example:
      "You guess 500 → HIGHER, then 750 → LOWER… and you have to keep track in your head.",
    advantages: ["Maximum challenge", "Great memory workout"],
    disadvantages: ["Easy to lose track", "Frustrating for beginners"],
    bestFor: "Veterans seeking a challenge",
    difficulty: "Hard",
    length: "3–7 minutes",
  },
  {
    id: "blind",
    name: "Blind",
    emoji: "🙈",
    short: "You can't see your previous guesses.",
    detailed:
      "You still get HIGHER/LOWER after each guess, but the guess history is hidden. Only your latest result is shown.",
    example:
      "Guess 500 → HIGHER (shown). Guess 800 → LOWER (shown). Earlier guesses aren't listed.",
    advantages: ["Tests focus and memory", "Quick and tense"],
    disadvantages: ["No history to review", "Mistakes cost more"],
    bestFor: "Focused players",
    difficulty: "Hard",
    length: "3–6 minutes",
  },
  {
    id: "suddendeath",
    name: "Sudden Death",
    emoji: "⚰️",
    short: "A limited number of guesses — run out and you lose.",
    detailed:
      "You get a tight guess budget (a little more than optimal). Use it wisely: if you run out before cracking the number, you lose.",
    example:
      "4-digit game, 16 guesses allowed. Miss on the 16th and it's game over.",
    advantages: ["High tension", "Every guess matters"],
    disadvantages: ["Punishing", "Less forgiving of mistakes"],
    bestFor: "Thrill seekers",
    difficulty: "Very hard",
    length: "2–4 minutes",
  },
  {
    id: "speedrun",
    name: "Speed Run",
    emoji: "⏱️",
    short: "Beat the target guess count (practice).",
    detailed:
      "Solo challenge: crack the number in as few guesses as possible and try to match optimal play. Your guess count and time are your score.",
    example: "3-digit number — can you win in 10 guesses or fewer?",
    advantages: ["Great for improving", "Clear personal goal"],
    disadvantages: ["No opponent", "Pure optimization"],
    bestFor: "Players chasing records",
    difficulty: "Medium",
    length: "1–3 minutes",
  },
  {
    id: "duel",
    name: "Duel (Multiplayer)",
    emoji: "⚔️",
    short: "Both players guess simultaneously — no turns.",
    detailed:
      "A multiplayer mode where neither player waits for a turn. Submit guesses as fast as you can; first to crack the opponent's number wins. (Coming in the multiplayer wave.)",
    example: "Both players hammer guesses at once — pure speed.",
    advantages: ["Fast-paced", "Exciting"],
    disadvantages: ["Less strategic", "Multiplayer only"],
    bestFor: "Competitive players",
    difficulty: "Medium",
    length: "1–3 minutes",
  },
];

export const DIFFICULTIES: InfoEntry[] = [
  {
    id: "easy",
    name: "Easy",
    emoji: "🟢",
    short: "Range tracker and hints available.",
    detailed:
      "The range tracker shows the remaining possible numbers after each guess, and you can ask for hints. The most forgiving way to learn.",
    example: "Guess 500 → HIGHER → tracker shows 501–999.",
    advantages: ["Beginner friendly", "Teaches optimal play"],
    disadvantages: ["Less challenge"],
    bestFor: "First-time players",
    difficulty: "Easy",
  },
  {
    id: "normal",
    name: "Normal",
    emoji: "🔵",
    short: "Range tracker on, no hints.",
    detailed: "Standard play with the range tracker to guide you, but no hint button.",
    example: "Tracker narrows as you guess; you do the thinking.",
    advantages: ["Balanced", "Still guided"],
    disadvantages: ["No hint safety net"],
    bestFor: "Most players",
    difficulty: "Medium",
  },
  {
    id: "hard",
    name: "Hard",
    emoji: "🟠",
    short: "No tracker, no hints.",
    detailed: "You get HIGHER/LOWER only. Track the range in your head.",
    example: "Guess 500 → HIGHER. No tracker — remember it.",
    advantages: ["Real challenge"],
    disadvantages: ["Easier to misplay"],
    bestFor: "Confident players",
    difficulty: "Hard",
  },
  {
    id: "nightmare",
    name: "Nightmare",
    emoji: "🌑",
    short: "No aids, and stats stay hidden until you win.",
    detailed:
      "No tracker, no hints, and your guess count and timer are hidden during play — you only see how you did at the end.",
    example: "You play in the dark and the result is revealed at the finish.",
    advantages: ["Ultimate test", "Pure instinct"],
    disadvantages: ["Very unforgiving"],
    bestFor: "Experts",
    difficulty: "Very hard",
  },
];

export const AI_LEVELS: InfoEntry[] = [
  {
    id: "rookie",
    name: "Rookie",
    emoji: "🐣",
    short: "Guesses casually and wastes moves.",
    detailed:
      "The computer often guesses randomly and doesn't always use its feedback well. Easy to out-think.",
    example: "It might guess 800 then 200 then 900 without narrowing efficiently.",
    advantages: ["Great for learning to race", "Very beatable"],
    disadvantages: ["Not much of a challenge"],
    bestFor: "Beginners",
    difficulty: "Easy",
    length: "2–4 minutes",
  },
  {
    id: "human",
    name: "Human",
    emoji: "🧑",
    short: "Plays smart but imperfectly, like a person.",
    detailed:
      "Uses HIGHER/LOWER feedback and aims near the middle of the remaining range, but with natural imprecision.",
    example: "Range 500–999 → it guesses around 740 instead of exactly 749.",
    advantages: ["Realistic, fair race"],
    disadvantages: ["Will punish sloppy play"],
    bestFor: "Most players",
    difficulty: "Medium",
    length: "2–4 minutes",
  },
  {
    id: "monster",
    name: "Binary Search Monster",
    emoji: "🤖",
    short: "Always guesses the optimal midpoint.",
    detailed:
      "Plays a perfect binary search every turn. You move first, so you can still win — but only with tight play.",
    example: "Range 1–999 → 500 → 250/750 → … never a wasted guess.",
    advantages: ["Sharpens your optimal play"],
    disadvantages: ["Unforgiving of any waste"],
    bestFor: "Strong players",
    difficulty: "Hard",
    length: "1–3 minutes",
  },
  {
    id: "impossible",
    name: "Impossible",
    emoji: "👹",
    short: "Perfect play — and it moves first.",
    detailed:
      "Optimal binary search AND it takes the first turn, so it always has the tempo edge. You'll need a bit of luck and flawless play.",
    example: "It opens with the perfect midpoint and never errs.",
    advantages: ["The ultimate test"],
    disadvantages: ["Brutally hard to beat"],
    bestFor: "Experts only",
    difficulty: "Very hard",
    length: "1–2 minutes",
  },
];

export const ABILITIES: InfoEntry[] = [
  {
    id: "reveal-range",
    name: "Reveal Range",
    emoji: "📊",
    short: "Show the exact remaining range once.",
    detailed:
      "Reveals the current possible range for the opponent's number, even if the tracker is off. One use per match.",
    example: "Tap it to see 'Possible: 4001–6000', then guess smartly.",
    advantages: ["Huge information boost"],
    disadvantages: ["Only once", "Spent if used early"],
    difficulty: "Easy",
  },
  {
    id: "reveal-digit",
    name: "Reveal Digit",
    emoji: "🔍",
    short: "Reveal one correct digit of the secret.",
    detailed:
      "Shows the value of one position of the opponent's secret number. One use per match.",
    example: "Reveals 'first digit = 4' — narrows things fast.",
    advantages: ["Big shortcut"],
    disadvantages: ["Only one digit", "One use"],
    difficulty: "Easy",
  },
  {
    id: "freeze",
    name: "Freeze Opponent",
    emoji: "🧊",
    short: "Make the opponent skip their next turn.",
    detailed:
      "The opponent loses their next turn, giving you a free move to pull ahead. One use per match.",
    example: "Freeze right before they'd likely win to steal tempo.",
    advantages: ["Tempo swing"],
    disadvantages: ["No info gained", "One use"],
    difficulty: "Medium",
  },
  {
    id: "double-turn",
    name: "Double Turn",
    emoji: "⏩",
    short: "Take two guesses in a row.",
    detailed: "Guess twice before the opponent moves. One use per match.",
    example: "Use it when you've narrowed to a few options to close it out.",
    advantages: ["Burst of progress"],
    disadvantages: ["Wasted if used too early", "One use"],
    difficulty: "Medium",
  },
  {
    id: "mirror",
    name: "Mirror Move",
    emoji: "🪞",
    short: "Copy the opponent's last guess (Multiplayer).",
    detailed:
      "Mirrors the opponent's most recent guess as your own. Most useful in real-time multiplayer; arrives with the multiplayer wave.",
    example: "They guess 4500 — you mirror it to match their progress.",
    advantages: ["Neutralizes a lead"],
    disadvantages: ["Situational", "Multiplayer only"],
    difficulty: "Hard",
  },
];

export const SETTINGS: InfoEntry[] = [
  {
    id: "number-length",
    name: "Number Length",
    emoji: "🔢",
    short: "How many digits the secret has (3–6).",
    detailed:
      "More digits = a bigger range and a longer game. 3 = quick, 6 = a marathon.",
    example: "3 digits = 100–999; 6 digits = 100000–999999.",
    advantages: ["Tune game length and difficulty"],
    disadvantages: ["6 digits can be long"],
  },
  {
    id: "turn-timer",
    name: "Turn Timer",
    emoji: "⏱️",
    short: "Seconds allowed per turn (∞/15/30/60).",
    detailed:
      "In multiplayer, each turn has a countdown. Run out and your turn is skipped automatically.",
    example: "30s timer keeps the game brisk.",
    advantages: ["Prevents stalling", "Adds pressure"],
    disadvantages: ["Stressful for some"],
  },
  {
    id: "random-secret",
    name: "Random Secret",
    emoji: "🎲",
    short: "Let the system pick your number (and show you).",
    detailed: "Generates a valid secret of the chosen length and shows it to you.",
    example: "Tap 'Random & show me' to skip choosing.",
    advantages: ["Fast setup", "Fair number"],
    disadvantages: ["Less personal"],
  },
  {
    id: "hidden-random",
    name: "Hidden Random",
    emoji: "🙈",
    short: "Defend a number even you don't know.",
    detailed:
      "The system generates and stores your secret without showing it to you. You play blind on defense; the opponent still can't see it.",
    example: "You attack the opponent while never knowing your own number.",
    advantages: ["Wild, fun twist"],
    disadvantages: ["You can't track your own number"],
    difficulty: "Hard",
  },
  {
    id: "hints",
    name: "Hints",
    emoji: "💡",
    short: "Reveal upper/lower half, odd/even, or a digit.",
    detailed:
      "When enabled, a hint button gives a clue about the secret. In multiplayer the hint is computed on the server so the number is never exposed.",
    example: "Hint: 'It's in the LOWER half' or 'The number is EVEN'.",
    advantages: ["Helpful when stuck"],
    disadvantages: ["Makes the game easier"],
  },
  {
    id: "range-tracker",
    name: "Range Tracker",
    emoji: "📊",
    short: "Shows the remaining possible numbers.",
    detailed: "Auto-updates after each guess to show the feasible range and how many numbers remain.",
    example: "After 500 → HIGHER, shows 501–999 (499 left).",
    advantages: ["Guides optimal play"],
    disadvantages: ["Removes some challenge"],
  },
  {
    id: "abilities",
    name: "Special Abilities",
    emoji: "✨",
    short: "One-use powers like Reveal or Freeze.",
    detailed: "Optional. Each player gets one-use abilities to swing the match. See each ability for details.",
    example: "Use Reveal Range once to leap ahead.",
    advantages: ["Adds depth and comebacks"],
    disadvantages: ["Less pure", "More to learn"],
  },
  {
    id: "couple-mode",
    name: "Couple Mode",
    emoji: "💞",
    short: "Draw a fun real-life challenge after a win.",
    detailed: "When on, the winner gets a light real-life challenge (compliment, coffee, hug…).",
    example: "Winner's pick: 'Buy the next coffee ☕'.",
    advantages: ["Playful for couples & friends"],
    disadvantages: ["Just for fun"],
  },
  {
    id: "alternate-first-move",
    name: "Alternate First Move",
    emoji: "🔄",
    short: "Swap who starts each game (Multiplayer).",
    detailed:
      "Prevents a long-term first-player advantage by alternating who moves first each match. Arrives with the multiplayer wave.",
    example: "Game 1 P1 starts, Game 2 P2 starts, …",
    advantages: ["Fairer series"],
    disadvantages: ["Multiplayer only"],
  },
  {
    id: "themes",
    name: "Themes",
    emoji: "🎨",
    short: "7 visual styles to choose from.",
    detailed: "Dark, Minimal, Cyberpunk, Matrix, Space, Casino, Military. Change anytime in Settings.",
    example: "Switch to Matrix for a green-on-black look.",
    advantages: ["Personalize the vibe"],
    disadvantages: [],
  },
];

export const CATEGORIES: { title: string; items: InfoEntry[] }[] = [
  { title: "Game modes", items: MODES },
  { title: "Single-player difficulty", items: DIFFICULTIES },
  { title: "Computer opponents", items: AI_LEVELS },
  { title: "Special abilities", items: ABILITIES },
  { title: "Settings & features", items: SETTINGS },
];

export const byId = (list: InfoEntry[], id: string): InfoEntry | undefined =>
  list.find((e) => e.id === id);
