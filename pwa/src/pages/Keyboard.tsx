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
  return (
    <div className="screen">
      <Link to="/control">← Back</Link>
      <h1>Keyboard</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: "100%" }} />
      <button onClick={send}>Send text</button>
      <h3 style={{ marginTop: 16 }}>Shortcuts</h3>
      <ShortcutGrid device={d} />
    </div>
  );
}
