import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { useSelectedDevice } from "../store/devices";

export default function Media() {
  const d = useSelectedDevice();
  if (!d || d.kind !== "laptop") return <Navigate to="/" />;
  const post = (path: string, body?: object) =>
    request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }).catch(() => {});
  const btn = { padding: 16, background: "var(--card)", color: "var(--fg)", border: 0, borderRadius: 8, fontSize: 18 };
  return (
    <div className="screen">
      <Link to="/control">← Back</Link>
      <h1>Media</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <button style={btn} onClick={() => post("/api/media/prev")}>⏮</button>
        <button style={btn} onClick={() => post("/api/media/playpause")}>⏯</button>
        <button style={btn} onClick={() => post("/api/media/next")}>⏭</button>
      </div>
      <h3 style={{ marginTop: 24 }}>Volume</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <button style={btn} onClick={() => post("/api/media/volume", { action: "down" })}>−</button>
        <button style={btn} onClick={() => post("/api/media/volume", { action: "mute" })}>Mute</button>
        <button style={btn} onClick={() => post("/api/media/volume", { action: "up" })}>+</button>
      </div>
    </div>
  );
}
