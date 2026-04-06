import { useMemo, useRef, useState } from "react";

export type TtsGender = "male" | "female";

export function useTts(defaultText = "", defaultGender: TtsGender = "female") {
	const [text, setText] = useState(defaultText);
	const [gender, setGender] = useState<TtsGender>(defaultGender);
	const [isLoading, setIsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const remaining = useMemo(() => 50 - text.trim().length, [text]);
	const disabled = useMemo(() => {
		const len = text.trim().length;
		return len === 0 || len > 50 || isLoading;
	}, [text, isLoading]);

	async function handleGenerate(e?: React.FormEvent) {
		if (e && typeof e.preventDefault === "function") e.preventDefault();
		if (disabled) return;
		setIsLoading(true);
		try {
			const resp = await fetch("/api/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, gender }),
			});
			if (!resp.ok) {
				const err = await resp.json().catch(() => null);
				alert(err?.error || "音声の生成に失敗しました");
				return;
			}
			const blob = await resp.blob();
			const url = URL.createObjectURL(blob);
			if (!audioRef.current) {
				audioRef.current = new Audio();
			}
			audioRef.current.src = url;
			await audioRef.current.play();
		} finally {
			setIsLoading(false);
		}
	}

	return {
		text,
		setText,
		gender,
		setGender,
		isLoading,
		remaining,
		disabled,
		handleGenerate,
	};
}

