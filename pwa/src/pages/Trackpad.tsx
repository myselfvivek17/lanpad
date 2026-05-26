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
    return <div className="screen"><p>No laptop selected.</p><Link to="/">Back</Link></div>;
  }

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", height: "100dvh", padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px" }}>
        <Link to="/control">← Back</Link>
        <span style={{ color: status === "open" ? "var(--accent)" : "var(--danger)" }}>{status}</span>
      </div>
      <TrackpadSurface
        device={d}
        sensitivity={sens}
        onStatus={setStatus}
        onAuthFail={() => remove(d.id)}
      />
      <div style={{ padding: 8 }}>
        Sensitivity: {sens.toFixed(1)}×
        <input
          type="range" min={0.5} max={3.0} step={0.1}
          value={sens}
          onChange={(e) => setSens(+e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
