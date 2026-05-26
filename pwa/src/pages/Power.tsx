import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { ConfirmModal } from "../components/ConfirmModal";
import { useSelectedDevice } from "../store/devices";

export default function Power() {
  const d = useSelectedDevice();
  const [confirm, setConfirm] = useState<null | (() => void)>(null);
  const [confirmLabel, setConfirmLabel] = useState("");
  const [updateJob, setUpdateJob] = useState<{ id: string; status: string; log: string } | null>(null);

  if (!d) return <Navigate to="/" />;

  const post = (path: string, body?: object) =>
    request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

  const ask = (label: string, fn: () => void) => {
    setConfirmLabel(label);
    setConfirm(() => () => { setConfirm(null); fn(); });
  };

  const startUpdate = async () => {
    const res = await post("/api/system/update") as { job_id: string; status: string };
    setUpdateJob({ id: res.job_id, status: res.status, log: "" });
  };

  useEffect(() => {
    if (!updateJob || updateJob.status === "completed" || updateJob.status === "failed") return;
    const t = setInterval(async () => {
      const r = await request<{ status: string; log_tail: string }>(d, `/api/system/update/${updateJob.id}`);
      setUpdateJob({ id: updateJob.id, status: r.status, log: r.log_tail });
    }, 2000);
    return () => clearInterval(t);
  }, [updateJob, d]);

  const btn = { padding: 14, background: "var(--card)", color: "var(--fg)", border: 0, borderRadius: 8, fontSize: 16 };

  return (
    <div className="screen">
      <Link to="/control">← Back</Link>
      <h1>Power</h1>
      {d.kind === "laptop" && (
        <div style={{ display: "grid", gap: 8 }}>
          <button style={btn} onClick={() => ask("Shutdown laptop?", () => post("/api/power/shutdown", { delay_seconds: 5 }))}>Shutdown</button>
          <button style={btn} onClick={() => post("/api/power/sleep")}>Sleep</button>
          <button style={btn} onClick={() => post("/api/power/lock")}>Lock</button>
        </div>
      )}
      {d.kind === "server" && (
        <div style={{ display: "grid", gap: 8 }}>
          <button style={btn} onClick={() => ask("Shutdown server?", () => post("/api/power/shutdown", { delay_seconds: 30 }))}>Shutdown</button>
          <button style={btn} onClick={() => ask("Run apt update + upgrade?", startUpdate)}>System update</button>
          {updateJob && (
            <div style={{ background: "var(--card)", padding: 8, borderRadius: 8 }}>
              <div>Job {updateJob.id}: <b>{updateJob.status}</b></div>
              <pre style={{ maxHeight: 200, overflow: "auto", whiteSpace: "pre-wrap", fontSize: 12 }}>{updateJob.log}</pre>
            </div>
          )}
        </div>
      )}
      {confirm && (
        <ConfirmModal
          title="Are you sure?"
          message={confirmLabel}
          confirmLabel="Yes"
          onConfirm={confirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
