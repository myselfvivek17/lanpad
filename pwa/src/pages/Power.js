import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { ConfirmModal } from "../components/ConfirmModal";
import { useSelectedDevice } from "../store/devices";
export default function Power() {
    const d = useSelectedDevice();
    const [confirm, setConfirm] = useState(null);
    const [confirmLabel, setConfirmLabel] = useState("");
    const [updateJob, setUpdateJob] = useState(null);
    if (!d)
        return _jsx(Navigate, { to: "/" });
    const post = (path, body) => request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
    const ask = (label, fn) => {
        setConfirmLabel(label);
        setConfirm(() => () => { setConfirm(null); fn(); });
    };
    const startUpdate = async () => {
        const res = await post("/api/system/update");
        setUpdateJob({ id: res.job_id, status: res.status, log: "" });
    };
    useEffect(() => {
        if (!updateJob || updateJob.status === "completed" || updateJob.status === "failed")
            return;
        const t = setInterval(async () => {
            const r = await request(d, `/api/system/update/${updateJob.id}`);
            setUpdateJob({ id: updateJob.id, status: r.status, log: r.log_tail });
        }, 2000);
        return () => clearInterval(t);
    }, [updateJob, d]);
    const statusColor = updateJob?.status === "completed" ? "var(--success)" :
        updateJob?.status === "failed" ? "var(--danger)" :
            "var(--accent)";
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", className: "back", children: "\u2190 Back" }), _jsx("h1", { style: { marginBottom: 28, marginTop: 8 }, children: "Power" }), d.kind === "laptop" && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [_jsx("button", { className: "btn-danger", onClick: () => ask("Shutdown laptop?", () => post("/api/power/shutdown", { delay_seconds: 5 })), children: "\u23FB\u2002Shutdown" }), _jsx("button", { className: "btn-card", onClick: () => post("/api/power/sleep"), children: "\uD83C\uDF19\u2002Sleep" }), _jsx("button", { className: "btn-card", onClick: () => post("/api/power/lock"), children: "\uD83D\uDD12\u2002Lock" })] })), d.kind === "server" && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [_jsx("button", { className: "btn-danger", onClick: () => ask("Shutdown server?", () => post("/api/power/shutdown", { delay_seconds: 30 })), children: "\u23FB\u2002Shutdown" }), _jsx("button", { className: "btn-card", onClick: () => ask("Run apt update + upgrade?", startUpdate), children: "\u21BB\u2002System Update" }), updateJob && (_jsxs("div", { className: "card", style: { marginTop: 4 }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }, children: [_jsx("span", { className: "status-dot", style: {
                                            background: statusColor,
                                            boxShadow: `0 0 8px ${statusColor}`,
                                            animation: updateJob.status === "running" ? "pulse 1.4s ease infinite" : "none",
                                        } }), _jsx("span", { className: "mono", style: { fontSize: 11, color: statusColor, letterSpacing: "0.1em" }, children: updateJob.status })] }), _jsx("pre", { style: {
                                    maxHeight: 180,
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                    fontSize: 11,
                                    fontFamily: "'Space Mono', monospace",
                                    color: "var(--muted)",
                                    lineHeight: 1.7,
                                }, children: updateJob.log })] }))] })), confirm && (_jsx(ConfirmModal, { title: "Confirm action", message: confirmLabel, confirmLabel: "Yes, proceed", onConfirm: confirm, onCancel: () => setConfirm(null) }))] }));
}
