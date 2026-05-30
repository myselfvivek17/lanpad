import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { useSelectedDevice } from "../store/devices";

export default function Media() {
  const d = useSelectedDevice();
  if (!d || d.kind !== "laptop") return <Navigate to="/" />;

  const post = (path: string, body?: object) =>
    request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }).catch(() => {});
  const key = (k: string) =>
    request(d, "/api/keyboard/key", { method: "POST", body: JSON.stringify({ key: k }) }).catch(() => {});

  return (
    <div className="screen">
      <Link to="/control" className="back">← Back</Link>
      <h1 style={{ marginBottom: 36, marginTop: 8 }}>Media</h1>

      <div className="section-label">Playback</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 10, marginBottom: 32 }}>
        <button className="btn-icon" style={{ height: 72 }} onClick={() => key("left")}>
          <span style={{ fontSize: 26 }}>⏮</span>
        </button>
        <button className="btn-icon btn-accent-icon" style={{ height: 72 }} onClick={() => post("/api/media/playpause")}>
          <span style={{ fontSize: 32 }}>⏯</span>
        </button>
        <button className="btn-icon" style={{ height: 72 }} onClick={() => key("right")}>
          <span style={{ fontSize: 26 }}>⏭</span>
        </button>
      </div>

      <div className="section-label">Volume</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <button className="btn-icon" style={{ height: 64 }} onClick={() => post("/api/media/volume", { action: "down" })}>
          <span style={{ fontSize: 22 }}>🔉</span>
        </button>
        <button className="btn-icon" style={{ height: 64 }} onClick={() => post("/api/media/volume", { action: "mute" })}>
          <span style={{ fontSize: 22 }}>🔇</span>
        </button>
        <button className="btn-icon" style={{ height: 64 }} onClick={() => post("/api/media/volume", { action: "up" })}>
          <span style={{ fontSize: 22 }}>🔊</span>
        </button>
      </div>
    </div>
  );
}
