import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pair } from "../api/client";
import { useDevices } from "../store/devices";

export default function Pair() {
  const nav = useNavigate();
  const add = useDevices((s) => s.add);
  const [hostname, setHostname] = useState("laptop.local");
  const [port, setPort] = useState(8765);
  const [kind, setKind] = useState<"laptop" | "server">("laptop");
  const [name, setName] = useState("phone");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await pair(hostname, port, pin, name);
      add({
        id: res.device_id,
        name,
        hostname,
        port,
        kind,
        token: res.token,
      });
      nav("/");
    } catch (e: any) {
      setErr(e?.body?.error ?? `Pair failed (${e?.status ?? "?"})`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="screen" onSubmit={onSubmit}>
      <h1>Add device</h1>
      <label>Hostname<input value={hostname} onChange={(e) => setHostname(e.target.value)} /></label>
      <label>Port<input type="number" value={port} onChange={(e) => setPort(+e.target.value)} /></label>
      <label>Kind
        <select value={kind} onChange={(e) => setKind(e.target.value as "laptop" | "server")}>
          <option value="laptop">laptop</option>
          <option value="server">server</option>
        </select>
      </label>
      <label>Device name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>PIN<input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" /></label>
      {err && <p style={{ color: "var(--danger)" }}>{err}</p>}
      <button type="submit" disabled={busy}>{busy ? "Pairing…" : "Pair"}</button>
    </form>
  );
}
