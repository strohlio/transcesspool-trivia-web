// pages/index.js
import { useEffect, useState } from "react";

const AVATAR_MAP = {
  dan: "/avatars/dan.jpg",
  adam: "/avatars/adam.jpg",
  ariel: "/avatars/ariel.jpg",
  ricci: "/avatars/ricci.jpg",
  shaun: "/avatars/shaun.jpg",
  brad: "/avatars/brad.jpg",
  matty: "/avatars/matty.jpg",
};

const FALLBACK_AVATAR = "/avatars/fallback.jpg";

function normalizeId(raw) {
  const s = raw.toLowerCase();
  if (s.includes("matt")) return "matty";
  if (s.includes("ariel") || s.includes("chels")) return "ariel";
  if (s.includes("adam")) return "adam";
  if (s.includes("shaun")) return "shaun";
  if (s.includes("ricci")) return "ricci";
  if (s.includes("silberg") || s.includes("bird") || s.includes("brad"))
    return "brad";
  if (s.includes("dan")) return "dan";
  return s.replace(/\s+/g, "");
}

function Option({ label, onClick }) {
  const id = normalizeId(label);
  const src = AVATAR_MAP[id] || FALLBACK_AVATAR;
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: "pointer",
      }}
    >
      <img
        src={src}
        alt={label}
        width={48}
        height={48}
        style={{ borderRadius: 12, objectFit: "cover" }}
        onError={(e) => {
          e.currentTarget.src = FALLBACK_AVATAR;
        }}
      />
      <span>{label}</span>
    </button>
  );
}

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loadedFrom, setLoadedFrom] = useState(null); // "auto" | "manual" | null
  const current = questions[idx];

  // AUTO-LOAD from public/ on first render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/transcesspool_trivia_questions_v2.json", {
          cache: "no-store",
        });
        if (!res.ok) return; // don’t blow up if missing while you’re testing
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.questions)) {
          setQuestions(data.questions);
          setIdx(0);
          setScore(0);
          setLoadedFrom("auto");
          // optional: console.log(`Loaded ${data.questions.length} questions (auto)`);
        }
      } catch {
        // ignore — keeps page usable even if file not present yet
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const importQuestions = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        multiple: false,
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      });
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data?.questions)) {
        setQuestions(data.questions);
        setIdx(0);
        setScore(0);
        setLoadedFrom("manual");
      } else {
        alert("That file doesn't look like a questions JSON.");
      }
    } catch (e) {
      // user cancelled or parse error
      if (e?.name !== "AbortError") {
        console.error(e);
        alert("Import failed.");
      }
    }
  };

  const choose = (label) => {
    if (!current) return;
    const correctId = normalizeId(current.answer);
    const pickedId = normalizeId(label);
    if (pickedId === correctId) setScore((s) => s + 1);
    setIdx((i) => i + 1);
  };

  const reset = () => {
    setIdx(0);
    setScore(0);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"',
      }}
    >
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
        TRANScesspool Trivia
      </h1>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ color: "#374151" }}>
          {questions.length > 0
            ? `${questions.length} questions ready`
            : "No questions loaded"}
          {loadedFrom ? ` • ${loadedFrom}` : ""}
        </div>

        <button
          onClick={importQuestions}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            border: 0,
            cursor: "pointer",
          }}
        >
          Import Questions JSON
        </button>
      </div>

      <div style={{ marginTop: 16, color: "#111827" }}>Score: {score}</div>
      <div style={{ float: "right", color: "#4b5563" }}>
        {questions.length > 0 ? `Q ${Math.min(idx + 1, questions.length)} / ${questions.length}` : ""}
      </div>

      <div
        style={{
          clear: "both",
          marginTop: 24,
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "#fafafa",
        }}
      >
        {questions.length === 0 ? (
          <div style={{ color: "#6b7280" }}>
            Drop your JSON in <code>/public/transcesspool_trivia_questions_v2.json</code>{" "}
            (or use Import).
          </div>
        ) : idx >= questions.length ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Game over</h2>
            <div style={{ marginBottom: 16 }}>
              You scored <strong>{score}</strong> / {questions.length}.
            </div>
            <button
              onClick={reset}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: "#2563eb",
                color: "white",
                border: 0,
                cursor: "pointer",
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Who said:</div>
            <div
              style={{
                textAlign: "center",
                fontStyle: "italic",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              “{questions[idx].quote}”
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {questions[idx].options.map((opt) => (
                <Option key={opt} label={opt} onClick={() => choose(opt)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
