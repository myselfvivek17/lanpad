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
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/control", children: "\u2190 Back" }), _jsx("h1", { children: "Keyboard" }), _jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 3, style: { width: "100%" } }), _jsx("button", { onClick: send, children: "Send text" }), _jsx("h3", { style: { marginTop: 16 }, children: "Shortcuts" }), _jsx(ShortcutGrid, { device: d })] }));
}
