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
    const btn = { padding: 14, background: "var(--card)", color: "var(--fg)", border: 0, borderRadius: 8, fontSize: 16 };
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", children: "\u2190 Back" }), _jsx("h1", { children: "Power" }), d.kind === "laptop" && (_jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsx("button", { style: btn, onClick: () => ask("Shutdown laptop?", () => post("/api/power/shutdown", { delay_seconds: 5 })), children: "Shutdown" }), _jsx("button", { style: btn, onClick: () => post("/api/power/sleep"), children: "Sleep" }), _jsx("button", { style: btn, onClick: () => post("/api/power/lock"), children: "Lock" })] })), d.kind === "server" && (_jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsx("button", { style: btn, onClick: () => ask("Shutdown server?", () => post("/api/power/shutdown", { delay_seconds: 30 })), children: "Shutdown" }), _jsx("button", { style: btn, onClick: () => ask("Run apt update + upgrade?", startUpdate), children: "System update" }), updateJob && (_jsxs("div", { style: { background: "var(--card)", padding: 8, borderRadius: 8 }, children: [_jsxs("div", { children: ["Job ", updateJob.id, ": ", _jsx("b", { children: updateJob.status })] }), _jsx("pre", { style: { maxHeight: 200, overflow: "auto", whiteSpace: "pre-wrap", fontSize: 12 }, children: updateJob.log })] }))] })), confirm && (_jsx(ConfirmModal, { title: "Are you sure?", message: confirmLabel, confirmLabel: "Yes", onConfirm: confirm, onCancel: () => setConfirm(null) }))] }));
}
