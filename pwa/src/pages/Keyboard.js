import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { request } from "../api/client";
import { ShortcutGrid } from "../components/ShortcutGrid";
import { useSelectedDevice } from "../store/devices";
export default function Keyboard() {
    const d = useSelectedDevice();
    const [text, setText] = useState("");
    if (!d || d.kind !== "laptop")
        return _jsx(Navigate, { to: "/" });
    const send = async () => {
        if (!text)
            return;
        await request(d, "/api/keyboard/text", { method: "POST", body: JSON.stringify({ text }) }).catch(() => { });
        setText("");
    };
    const key = (k) => request(d, "/api/keyboard/key", { method: "POST", body: JSON.stringify({ key: k }) }).catch(() => { });
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", className: "back", children: "\u2190 Back" }), _jsx("h1", { style: { marginBottom: 24, marginTop: 8 }, children: "Keyboard" }), _jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 4, placeholder: "Type text to send\u2026", style: { marginBottom: 10 } }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }, children: [_jsx("button", { className: "btn-card", onClick: send, children: "Send \u2191" }), _jsx("button", { className: "btn-card", onClick: () => key("enter"), style: { color: "var(--accent)", borderColor: "rgba(0,212,255,0.25)" }, children: "Enter \u21B5" })] }), _jsx("div", { className: "section-label", children: "Shortcuts" }), _jsx(ShortcutGrid, { device: d })] }));
}
