import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { useSelectedDevice } from "../store/devices";
export default function Media() {
    const d = useSelectedDevice();
    if (!d || d.kind !== "laptop")
        return _jsx(Navigate, { to: "/" });
    const post = (path, body) => request(d, path, { method: "POST", body: body ? JSON.stringify(body) : undefined }).catch(() => { });
    const key = (k) => request(d, "/api/keyboard/key", { method: "POST", body: JSON.stringify({ key: k }) }).catch(() => { });
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", className: "back", children: "\u2190 Back" }), _jsx("h1", { style: { marginBottom: 36, marginTop: 8 }, children: "Media" }), _jsx("div", { className: "section-label", children: "Playback" }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 10, marginBottom: 32 }, children: [_jsx("button", { className: "btn-icon", style: { height: 72 }, onClick: () => key("left"), children: _jsx("span", { style: { fontSize: 26 }, children: "\u23EE" }) }), _jsx("button", { className: "btn-icon btn-accent-icon", style: { height: 72 }, onClick: () => post("/api/media/playpause"), children: _jsx("span", { style: { fontSize: 32 }, children: "\u23EF" }) }), _jsx("button", { className: "btn-icon", style: { height: 72 }, onClick: () => key("right"), children: _jsx("span", { style: { fontSize: 26 }, children: "\u23ED" }) })] }), _jsx("div", { className: "section-label", children: "Volume" }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }, children: [_jsx("button", { className: "btn-icon", style: { height: 64 }, onClick: () => post("/api/media/volume", { action: "down" }), children: _jsx("span", { style: { fontSize: 22 }, children: "\uD83D\uDD09" }) }), _jsx("button", { className: "btn-icon", style: { height: 64 }, onClick: () => post("/api/media/volume", { action: "mute" }), children: _jsx("span", { style: { fontSize: 22 }, children: "\uD83D\uDD07" }) }), _jsx("button", { className: "btn-icon", style: { height: 64 }, onClick: () => post("/api/media/volume", { action: "up" }), children: _jsx("span", { style: { fontSize: 22 }, children: "\uD83D\uDD0A" }) })] })] }));
}
