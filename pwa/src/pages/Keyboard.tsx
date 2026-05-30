import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { ShortcutGrid } from "../components/ShortcutGrid";
import { useSelectedDevice } from "../store/devices";

export default function Keyboard() {
  const d = useSelectedDevice();
  const [text, setText] = useState("");
  if (!d || d.kind !== "laptop") return <Navigate to="/" />;

  const send = async () => {
    if (!text) return;
    await request(d, "/api/keyboard/text", { method: "POST", body: JSON.stringify({ text }) }).catch(() => {});
    setText("");
  };
  const key = (k: string) =>
    request(d, "/api/keyboard/key", { method: "POST", body: JSON.stringify({ key: k }) }).catch(() => {});

  return (
    <div className="screen">
      <Link to="/control" className="back">← Back</Link>
      <h1 style={{ marginBottom: 24, marginTop: 8 }}>Keyboard</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type text to send…"
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
        <button className="btn-card" onClick={send}>Send ↑</button>
        <button
          className="btn-card"
          onClick={() => key("enter")}
          style={{ color: "var(--accent)", borderColor: "rgba(0,212,255,0.25)" }}
        >
          Enter ↵
        </button>
      </div>

      <div className="section-label">Shortcuts</div>
      <ShortcutGrid device={d} />
    </div>
  );
}
