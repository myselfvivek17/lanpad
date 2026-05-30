import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pair } from "../api/client";
import { useDevices } from "../store/devices";

export default function Pair() {
  const nav = useNavigate();
  const add = useDevices((s) => s.add);
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState(8765);
  const [kind, setKind] = useState<"laptop" | "server">("laptop");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await pair(hostname, port, pin, name || kind);
      add({ id: res.device_id, name: name || kind, hostname, port, kind, token: res.token });
      nav("/");
    } catch (e: any) {
      setErr(e?.body?.error ?? `Pair failed (${e?.status ?? "?"})`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <Link to="/" className="back">← Devices</Link>

      <div style={{ marginBottom: 28, marginTop: 8 }}>
        <h1>Add Device</h1>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
          Enter the IP and PIN shown on the agent
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-field">
          <span className="form-label">IP Address</span>
          <input
            placeholder="192.168.0.121"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            required
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="url"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-field">
            <span className="form-label">Port</span>
            <input type="number" value={port} onChange={(e) => setPort(+e.target.value)} />
          </div>
          <div className="form-field">
            <span className="form-label">Type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as "laptop" | "server")}>
              <option value="laptop">Laptop</option>
              <option value="server">Server</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">Device name</span>
          <input
            placeholder="My Laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-label">PIN</span>
          <input
            placeholder="000000"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            required
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 28,
              letterSpacing: "0.35em",
              textAlign: "center",
              padding: "16px",
            }}
          />
        </div>

        {err && (
          <div style={{
            background: "var(--danger-dim)",
            border: "1px solid rgba(255,68,85,0.25)",
            borderRadius: "var(--r-sm)",
            padding: "12px 14px",
            color: "var(--danger)",
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            {err}
          </div>
        )}

        <button
          className="btn-primary"
          type="submit"
          disabled={busy}
          style={{ marginTop: 4 }}
        >
          {busy ? "Connecting…" : "Pair Device"}
        </button>
      </form>
    </div>
  );
}
