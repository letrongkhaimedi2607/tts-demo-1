import type { NextApiRequest, NextApiResponse } from "next";

type ErrorResponse = {
	error: string;
};

const PROVIDER = process.env.TTS_PROVIDER || "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TTS_MODEL = process.env.TTS_MODEL || "gpt-4o-mini-tts";
const TTS_MODEL_MALE_VOICE = process.env.TTS_MODEL_MALE_VOICE || "alloy";
const TTS_MODEL_FEMALE_VOICE = process.env.TTS_MODEL_FEMALE_VOICE || "nova";

function mapGenderToVoice(gender: string): string {
	const normalized = (gender || "").toLowerCase();
	if (normalized === "female" || normalized === "f") return TTS_MODEL_FEMALE_VOICE;
	return TTS_MODEL_MALE_VOICE;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ErrorResponse | undefined>) {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		return res.status(405).json({ error: "Method Not Allowed" });
	}

	try {
		const { text, gender } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
		if (typeof text !== "string" || text.trim().length === 0) {
			return res.status(400).json({ error: "Missing text" });
		}
		const trimmed = text.trim();
		if (trimmed.length > 50) {
			return res.status(400).json({ error: "Text must be 50 characters or fewer" });
		}

		if (PROVIDER !== "openai") {
			return res.status(500).json({ error: "Only OpenAI provider is implemented in this demo" });
		}
		if (!OPENAI_API_KEY) {
			return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server" });
		}

		const voice = mapGenderToVoice(gender);
		const stylePrompt =
			"Voice Affect: Energetic and animated; dynamic with variations in pitch and tone.\n" +
			"Tone: Excited and enthusiastic, conveying an upbeat and thrilling atmosphere.\n" +
			"Pacing: Rapid delivery when describing the game or the key moments (e.g., \"an overtime thriller,\" \"pull off an unbelievable win\") to convey the intensity and build excitement.\n" +
			"Slightly slower during dramatic pauses to let key points sink in.\n" +
			"Emotion: Intensely focused, and excited. Giving off positive energy.\n" +
			"Personality: Relatable and engaging.\n" +
			"Pauses: Short, purposeful pauses after key moments in the game.\n";
		const input = `${trimmed}`;

		const openaiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: TTS_MODEL,
				voice,
				input,
				format: "mp3",
				speed: 1.05,
                prompt: stylePrompt,
				// language hints may be ignored, but include for clarity
				// some server versions accept "language" or "voice_optimization"
				language: "ja-JP",
			}),
		});

		if (!openaiResponse.ok) {
			const errText = await openaiResponse.text().catch(() => "");
			return res.status(502).json({ error: `TTS provider error: ${openaiResponse.status} ${errText}` });
		}

		// OpenAI returns audio bytes for audio/speech endpoint when format=mp3
		const arrayBuffer = await openaiResponse.arrayBuffer();
		res.setHeader("Content-Type", "audio/mpeg");
		res.setHeader("Cache-Control", "no-store");
		res.status(200).send(Buffer.from(arrayBuffer) as any);
		return;
	} catch (error: any) {
		return res.status(500).json({ error: error?.message || "Unexpected server error" });
	}
}

