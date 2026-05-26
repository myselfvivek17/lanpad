import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { useSelectedDevice } from "../store/devices";
export default function Media() {
    const d = useSelectedDevice();
    if (!d || d.kind !== "laptop")
        return _jsx(Navigate, { to: "/" });
    const post = (path, body) => request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }).catch(() => { });
    const btn = { padding: 16, background: "var(--card)", color: "var(--fg)", border: 0, borderRadius: 8, fontSize: 18 };
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", children: "\u2190 Back" }), _jsx("h1", { children: "Media" }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }, children: [_jsx("button", { style: btn, onClick: () => post("/api/media/prev"), children: "\u23EE" }), _jsx("button", { style: btn, onClick: () => post("/api/media/playpause"), children: "\u23EF" }), _jsx("button", { style: btn, onClick: () => post("/api/media/next"), children: "\u23ED" })] }), _jsx("h3", { style: { marginTop: 24 }, children: "Volume" }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }, children: [_jsx("button", { style: btn, onClick: () => post("/api/media/volume", { action: "down" }), children: "\u2212" }), _jsx("button", { style: btn, onClick: () => post("/api/media/volume", { action: "mute" }), children: "Mute" }), _jsx("button", { style: btn, onClick: () => post("/api/media/volume", { action: "up" }), children: "+" })] })] }));
}
