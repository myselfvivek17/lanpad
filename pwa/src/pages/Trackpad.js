import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { TrackpadSurface } from "../components/TrackpadSurface";
import { useSelectedDevice, useDevices } from "../store/devices";
export default function Trackpad() {
    const d = useSelectedDevice();
    const remove = useDevices((s) => s.remove);
    const [status, setStatus] = useState("connecting");
    const [sens, setSens] = useState(1.5);
    if (!d || d.kind !== "laptop") {
        return (_jsxs("div", { className: "screen", children: [_jsx("p", { style: { color: "var(--muted)" }, children: "No laptop selected." }), _jsx(Link, { to: "/", className: "back", children: "\u2190 Back" })] }));
    }
    const statusColor = status === "open" ? "var(--success)" : status === "connecting" ? "var(--warning)" : "var(--danger)";
    return (_jsxs("div", { style: { display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)" }, children: [_jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    flexShrink: 0,
                }, children: [_jsx(Link, { to: "/control", className: "back", style: { margin: 0 }, children: "\u2190 Back" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [_jsx("span", { className: "status-dot", style: {
                                    background: statusColor,
                                    boxShadow: status === "open" ? `0 0 6px var(--success)` : "none",
                                } }), _jsx("span", { className: "mono", style: { fontSize: 10, color: statusColor, letterSpacing: "0.1em", textTransform: "uppercase" }, children: status })] })] }), _jsx("div", { style: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }, children: _jsx(TrackpadSurface, { device: d, sensitivity: sens, onStatus: setStatus, onAuthFail: () => remove(d.id) }) }), _jsx("div", { style: {
                    padding: "10px 16px 14px",
                    borderTop: "1px solid var(--border)",
                    flexShrink: 0,
                    background: "var(--surface)",
                }, children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [_jsxs("span", { className: "mono", style: { fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", whiteSpace: "nowrap" }, children: ["SENS ", sens.toFixed(1), "\u00D7"] }), _jsx("input", { type: "range", min: 0.5, max: 3.0, step: 0.1, value: sens, onChange: (e) => setSens(+e.target.value), style: {
                                flex: 1,
                                height: 4,
                                accentColor: "var(--accent)",
                                background: "transparent",
                                border: "none",
                                padding: 0,
                            } })] }) })] }));
}
