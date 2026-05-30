import { useState } from "react";
import { Link } from "react-router-dom";
import { TrackpadSurface } from "../components/TrackpadSurface";
import { useSelectedDevice, useDevices } from "../store/devices";

export default function Trackpad() {
  const d = useSelectedDevice();
  const remove = useDevices((s) => s.remove);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [sens, setSens] = useState(1.5);

  if (!d || d.kind !== "laptop") {
    return (
      <div className="screen">
        <p style={{ color: "var(--muted)" }}>No laptop selected.</p>
        <Link to="/" className="back">← Back</Link>
      </div>
    );
  }

  const statusColor = status === "open" ? "var(--success)" : status === "connecting" ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)" }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <Link to="/control" className="back" style={{ margin: 0 }}>← Back</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            className="status-dot"
            style={{
              background: statusColor,
              boxShadow: status === "open" ? `0 0 6px var(--success)` : "none",
            }}
          />
          <span className="mono" style={{ fontSize: 10, color: statusColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {status}
          </span>
        </div>
      </div>

      {/* Trackpad surface */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <TrackpadSurface
          device={d}
          sensitivity={sens}
          onStatus={setStatus}
          onAuthFail={() => remove(d.id)}
        />
      </div>

      {/* Sensitivity bar */}
      <div style={{
        padding: "10px 16px 14px",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            SENS {sens.toFixed(1)}×
          </span>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.1}
            value={sens}
            onChange={(e) => setSens(+e.target.value)}
            style={{
              flex: 1,
              height: 4,
              accentColor: "var(--accent)",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
