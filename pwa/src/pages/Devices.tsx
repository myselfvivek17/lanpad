import { Link } from "react-router-dom";
import { useDevices } from "../store/devices";

const KIND_ICON: Record<string, string> = { laptop: "💻", server: "🖥️" };

export default function Devices() {
  const { devices, remove, select } = useDevices();
  return (
    <div className="screen">
      <div style={{ paddingTop: 8, marginBottom: 32 }}>
        <div className="wordmark">⚡ Phone Remote</div>
        <h1>Devices</h1>
      </div>

      {devices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>📡</div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }}>
            No devices paired yet.<br />Add one to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {devices.map((d) => (
            <div key={d.id} className="device-card">
              <div className="device-icon">{KIND_ICON[d.kind] ?? "📱"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{d.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                  {d.kind} · {d.hostname}:{d.port}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link
                  to="/control"
                  onClick={() => select(d.id)}
                  style={{
                    padding: "9px 14px",
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid rgba(0,212,255,0.2)",
                  }}
                >
                  Open
                </Link>
                <button
                  onClick={() => remove(d.id)}
                  style={{
                    padding: "9px 12px",
                    background: "var(--danger-dim)",
                    color: "var(--danger)",
                    borderRadius: 8,
                    fontSize: 13,
                    border: "1px solid rgba(255,68,85,0.2)",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <Link to="/pair" style={{ textDecoration: "none" }}>
          <button className="btn-primary">+ Add device</button>
        </Link>
      </div>
    </div>
  );
}
