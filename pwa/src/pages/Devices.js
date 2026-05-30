import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useDevices } from "../store/devices";
const KIND_ICON = { laptop: "💻", server: "🖥️" };
export default function Devices() {
    const { devices, remove, select } = useDevices();
    return (_jsxs("div", { className: "screen", children: [_jsxs("div", { style: { paddingTop: 8, marginBottom: 32 }, children: [_jsx("div", { className: "wordmark", children: "\u26A1 Phone Remote" }), _jsx("h1", { children: "Devices" })] }), devices.length === 0 ? (_jsxs("div", { className: "card", style: { textAlign: "center", padding: "48px 24px" }, children: [_jsx("div", { style: { fontSize: 44, marginBottom: 16 }, children: "\uD83D\uDCE1" }), _jsxs("p", { style: { color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }, children: ["No devices paired yet.", _jsx("br", {}), "Add one to get started."] })] })) : (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: devices.map((d) => (_jsxs("div", { className: "device-card", children: [_jsx("div", { className: "device-icon", children: KIND_ICON[d.kind] ?? "📱" }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 3 }, children: d.name }), _jsxs("div", { className: "mono", style: { fontSize: 11, color: "var(--muted)" }, children: [d.kind, " \u00B7 ", d.hostname, ":", d.port] })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [_jsx(Link, { to: "/control", onClick: () => select(d.id), style: {
                                        padding: "9px 14px",
                                        background: "var(--accent-dim)",
                                        color: "var(--accent)",
                                        borderRadius: 8,
                                        textDecoration: "none",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        border: "1px solid rgba(0,212,255,0.2)",
                                    }, children: "Open" }), _jsx("button", { onClick: () => remove(d.id), style: {
                                        padding: "9px 12px",
                                        background: "var(--danger-dim)",
                                        color: "var(--danger)",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        border: "1px solid rgba(255,68,85,0.2)",
                                    }, children: "\u2715" })] })] }, d.id))) })), _jsx("div", { style: { marginTop: "auto", paddingTop: 24 }, children: _jsx(Link, { to: "/pair", style: { textDecoration: "none" }, children: _jsx("button", { className: "btn-primary", children: "+ Add device" }) }) })] }));
}
