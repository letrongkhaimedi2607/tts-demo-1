import type { NextApiRequest, NextApiResponse } from "next";
import {
	ELEVENLABS_FEMALE_VOICE_ID,
	ELEVENLABS_MALE_VOICE_ID,
	ELEVENLABS_MODEL_ID,
	JA_REWRITE_MAPPINGS,
} from "@/constants/tts";

type ErrorResponse = {
	error: string;
};

const PROVIDER = process.env.TTS_PROVIDER || "elevenlabs";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const TTS_MODEL_MALE_VOICE = process.env.TTS_MODEL_MALE_VOICE || ELEVENLABS_MALE_VOICE_ID;
const TTS_MODEL_FEMALE_VOICE = process.env.TTS_MODEL_FEMALE_VOICE || ELEVENLABS_FEMALE_VOICE_ID;

function mapGenderToVoice(gender: string): string {
	const normalized = (gender || "").toLowerCase();
	if (normalized === "female" || normalized === "f") return TTS_MODEL_FEMALE_VOICE;
	return TTS_MODEL_MALE_VOICE;
}

function rewriteByRules(text: string): { output: string; matched: boolean } {
	let output = text;
	let matched = false;

	for (const [pattern, replacement] of JA_REWRITE_MAPPINGS) {
		if (pattern.test(output)) {
			output = output.replace(pattern, replacement);
			matched = true;
		}
	}

	if (matched && !/[。！？!?]$/.test(output)) {
		output = `${output}！`;
	}

	return { output, matched };
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

		if (PROVIDER !== "elevenlabs") {
			return res.status(500).json({ error: "Only ElevenLabs provider is implemented in this demo" });
		}
		if (!ELEVENLABS_API_KEY) {
			return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured on the server" });
		}

		const voice = mapGenderToVoice(gender);
		const ruleRewrite = rewriteByRules(trimmed);
		const rewrittenText = ruleRewrite.matched ? ruleRewrite.output : trimmed;
		const input = rewrittenText;

		const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "audio/mpeg",
				"xi-api-key": ELEVENLABS_API_KEY,
			},
			body: JSON.stringify({
				text: input,
				model_id: ELEVENLABS_MODEL_ID,
			}),
		});

		if (!elevenLabsResponse.ok) {
			const errText = await elevenLabsResponse.text().catch(() => "");
			return res.status(502).json({ error: `TTS provider error: ${elevenLabsResponse.status} ${errText}` });
		}

		const arrayBuffer = await elevenLabsResponse.arrayBuffer();
		res.setHeader("Content-Type", "audio/mpeg");
		res.setHeader("Cache-Control", "no-store");
		res.status(200).send(Buffer.from(arrayBuffer) as any);
		return;
	} catch (error: any) {
		return res.status(500).json({ error: error?.message || "Unexpected server error" });
	}
}

