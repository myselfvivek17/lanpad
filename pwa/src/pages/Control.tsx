import { Link, Navigate } from "react-router-dom";
import { useSelectedDevice } from "../store/devices";

const LAPTOP_TILES = [
  { to: "/trackpad", icon: "🖱️", label: "Trackpad" },
  { to: "/keyboard", icon: "⌨️", label: "Keyboard" },
  { to: "/media",    icon: "🎵", label: "Media"    },
  { to: "/power",    icon: "⚡", label: "Power"    },
];
const SERVER_TILES = [
  { to: "/power", icon: "⚡", label: "Power" },
];

export default function Control() {
  const d = useSelectedDevice();
  if (!d) return <Navigate to="/" />;
  const tiles = d.kind === "laptop" ? LAPTOP_TILES : SERVER_TILES;

  return (
    <div className="screen">
      <Link to="/" className="back">← Devices</Link>

      <div style={{ marginBottom: 28, marginTop: 8 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
          {d.kind}
        </div>
        <h1>{d.name}</h1>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
          {d.hostname}:{d.port}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="tile">
            <span style={{ fontSize: 26 }}>{t.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
