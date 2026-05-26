import { Link, Navigate } from "react-router-dom";
import { useSelectedDevice } from "../store/devices";

export default function Control() {
  const d = useSelectedDevice();
  if (!d) return <Navigate to="/" />;
  return (
    <div className="screen">
      <h1>{d.name}</h1>
      <p style={{ color: "var(--muted)" }}>{d.kind} · {d.hostname}:{d.port}</p>
      <nav style={{ display: "grid", gap: 8 }}>
        {d.kind === "laptop" && <>
          <Link to="/trackpad">Trackpad</Link>
          <Link to="/keyboard">Keyboard</Link>
          <Link to="/media">Media</Link>
        </>}
        <Link to="/power">Power</Link>
        <Link to="/">← Back to devices</Link>
      </nav>
    </div>
  );
}
