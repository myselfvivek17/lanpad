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

  const statusColor =
    updateJob?.status === "completed" ? "var(--success)" :
    updateJob?.status === "failed"    ? "var(--danger)"  :
    "var(--accent)";

  return (
    <div className="screen">
      <Link to="/control" className="back">← Back</Link>
      <h1 style={{ marginBottom: 28, marginTop: 8 }}>Power</h1>

      {d.kind === "laptop" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="btn-danger"
            onClick={() => ask("Shutdown laptop?", () => post("/api/power/shutdown", { delay_seconds: 5 }))}
          >
            ⏻&ensp;Shutdown
          </button>
          <button className="btn-card" onClick={() => post("/api/power/sleep")}>
            🌙&ensp;Sleep
          </button>
          <button className="btn-card" onClick={() => post("/api/power/lock")}>
            🔒&ensp;Lock
          </button>
        </div>
      )}

      {d.kind === "server" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="btn-danger"
            onClick={() => ask("Shutdown server?", () => post("/api/power/shutdown", { delay_seconds: 30 }))}
          >
            ⏻&ensp;Shutdown
          </button>
          <button
            className="btn-card"
            onClick={() => ask("Run apt update + upgrade?", startUpdate)}
          >
            ↻&ensp;System Update
          </button>

          {updateJob && (
            <div className="card" style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span
                  className="status-dot"
                  style={{
                    background: statusColor,
                    boxShadow: `0 0 8px ${statusColor}`,
                    animation: updateJob.status === "running" ? "pulse 1.4s ease infinite" : "none",
                  }}
                />
                <span className="mono" style={{ fontSize: 11, color: statusColor, letterSpacing: "0.1em" }}>
                  {updateJob.status}
                </span>
              </div>
              <pre style={{
                maxHeight: 180,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                fontSize: 11,
                fontFamily: "'Space Mono', monospace",
                color: "var(--muted)",
                lineHeight: 1.7,
              }}>
                {updateJob.log}
              </pre>
            </div>
          )}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Confirm action"
          message={confirmLabel}
          confirmLabel="Yes, proceed"
          onConfirm={confirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
