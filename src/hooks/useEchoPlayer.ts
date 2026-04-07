import { useCallback, useRef, useState } from "react";
import * as Tone from "tone";
import WaveSurfer from "wavesurfer.js";

export function useEchoPlayer() {
	const [echo, setEcho] = useState(0.2);
	const [isReady, setIsReady] = useState(false);
	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const containerRef = useRef<HTMLElement | null>(null);
	const playerRef = useRef<Tone.Player | null>(null);
	const delayRef = useRef<Tone.FeedbackDelay | null>(null);
	const urlRef = useRef<string | null>(null);

	const attachWaveform = useCallback((el: HTMLElement | null) => {
		containerRef.current = el || null;
		if (!el) return;
		if (wavesurferRef.current) {
			wavesurferRef.current.destroy();
			wavesurferRef.current = null;
		}
		wavesurferRef.current = WaveSurfer.create({
			container: el,
			waveColor: "#cbd5e1",
			progressColor: "#0ea5e9",
			cursorColor: "#94a3b8",
			height: 64,
			barWidth: 2,
			barGap: 2,
			normalize: true,
		});
		if (urlRef.current) {
			wavesurferRef.current.load(urlRef.current);
		}
	}, []);

	const loadFromBlob = useCallback(async (blob: Blob) => {
		setIsReady(false);
		if (playerRef.current) {
			playerRef.current.dispose();
			playerRef.current = null;
		}
		if (delayRef.current) {
			delayRef.current.dispose();
			delayRef.current = null;
		}
		if (urlRef.current) {
			URL.revokeObjectURL(urlRef.current);
			urlRef.current = null;
		}
		const url = URL.createObjectURL(blob);
		urlRef.current = url;
		delayRef.current = new Tone.FeedbackDelay({
			delayTime: Math.max(0, Math.min(0.45, echo * 0.45)),
			feedback: Math.max(0, Math.min(0.7, echo * 0.7)),
		}).toDestination();
		const player = new Tone.Player({ autostart: false }).connect(delayRef.current);
		await player.load(url);
		playerRef.current = player;
		if (wavesurferRef.current) {
			wavesurferRef.current.load(url);
		}
		setIsReady(true);
	}, [echo]);

	const play = useCallback(async () => {
		if (!playerRef.current || !delayRef.current || !isReady) return;
		await Tone.start();
		delayRef.current.set({
			delayTime: Math.max(0, Math.min(0.45, echo * 0.45)),
			feedback: Math.max(0, Math.min(0.7, echo * 0.7)),
		});
		playerRef.current.stop();
		playerRef.current.start(0);
		if (wavesurferRef.current && urlRef.current) {
			wavesurferRef.current.seekTo(0);
			wavesurferRef.current.play();
		}
	}, [echo, isReady]);

	return { echo, setEcho, loadFromBlob, play, attachWaveform, isReady };
}

