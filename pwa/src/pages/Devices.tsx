import { Link } from "react-router-dom";
import { useDevices } from "../store/devices";

export default function Devices() {
  const { devices, remove, select } = useDevices();
  return (
    <div className="screen">
      <h1>Devices</h1>
      {devices.length === 0 && <p>No devices paired yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {devices.map((d) => (
          <li key={d.id} style={{ marginBottom: 12, padding: 12, background: "var(--card)", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{d.kind} · {d.hostname}:{d.port}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/control" onClick={() => select(d.id)}>Open</Link>
                <button onClick={() => remove(d.id)} style={{ color: "var(--danger)", background: "none", border: 0 }}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/pair">+ Add device</Link>
    </div>
  );
}
