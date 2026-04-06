export const REWRITE_MODEL = "gpt-4o-mini";
export const REWRITE_SYSTEM_PROMPT =
	"Rewrite the input text to include Japanese exclamations like 'っ', 'ー', and '！' to mimic a high-energy Anime MC";

export const INSTRUCTIONS =
	"You are a Japanese anime-style voice talent for energetic commercials and promos.\n" +
	"Accent: natural standard Japanese.\n" +
	"Pitch: bright and lively; keep naturally higher and sparkling for female voice, and clear energetic brightness for male voice.\n" +
	"Tone: cheerful, sparkling, and emotionally expressive.\n" +
	"Intonation: dramatic anime-like rises and falls, with punchy emphasis on key words.\n" +
	"Pacing: brisk and lively, with short intentional pauses for impact.\n" +
	"Delivery: clear articulation, vibrant resonance, and promotional excitement.\n" +
	"Impression: anime character energy + Japanese advertisement narrator.\n" +
	"Keep it natural Japanese, avoid robotic cadence.";

export const JA_REWRITE_MAPPINGS: Array<[RegExp, string]> = [
	[/すごい/g, "すごーい"],
	[/やばい/g, "やばーい"],
	[/最高だ/g, "最高だー"],
	[/いくぞ/g, "いくぞっ"],
	[/行くぞ/g, "行くぞっ"],
	[/待って/g, "待ってっ"],
	[/頑張れ/g, "頑張れー"],
	[/がんばれ/g, "がんばれー"],
];
