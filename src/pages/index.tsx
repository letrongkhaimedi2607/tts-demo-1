import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useTts } from "@/hooks/useTts";
import { useEchoPlayer } from "@/hooks/useEchoPlayer";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { text, setText, gender, setGender, isLoading, remaining, disabled, handleGenerate, lastBlob } = useTts();
  const { echo, setEcho, loadFromBlob, play } = useEchoPlayer();

  useEffect(() => {
    if (!lastBlob) return;
    void loadFromBlob(lastBlob);
  }, [lastBlob, loadFromBlob]);

  return (
    <>
      <Head>
        <title>JA TTS Demo</title>
        <meta name="description" content="Japanese TTS demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <h1>日本語テキストを音声に変換</h1>
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 8, width: "100%", maxWidth: 520 }}>
            <label htmlFor="tts-text">テキストを入力（50文字以内）</label>
            <textarea
              id="tts-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              placeholder="例: ようこそ！祭りを楽しもう！"
              rows={7}
              style={{ padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ddd", resize: "none" }}
            />
            <div style={{ fontSize: 12, color: remaining < 0 ? "#c00" : "#666" }}>
              あと {remaining} 文字
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />{" "}
                女声
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />{" "}
                男声
              </label>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
              <label htmlFor="echo-range">エコー</label>
              <input
                id="echo-range"
                type="range"
                min={0}
                max={100}
                value={Math.round(echo * 100)}
                onChange={(e) => setEcho(Number(e.target.value) / 100)}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!lastBlob) return;
                  await play();
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: '#000',
                  color: '#fff',
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                再生
              </button>
            </div>
            <button
              type="submit"
              disabled={disabled}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: 'white',
                color: 'black',
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: 16,
              }}
            >
              {isLoading ? "生成中..." : "音声を生成"}
            </button>
            
          </form>
        </main>
      </div>
    </>
  );
}
