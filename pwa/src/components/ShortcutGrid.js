import { jsx as _jsx } from "react/jsx-runtime";
import { request } from "../api/client";
const SHORTCUTS = [
    { label: "Win+D", keys: ["win", "d"] },
    { label: "Alt+Tab", keys: ["alt", "tab"] },
    { label: "Ctrl+C", keys: ["ctrl", "c"] },
    { label: "Ctrl+V", keys: ["ctrl", "v"] },
    { label: "Ctrl+Z", keys: ["ctrl", "z"] },
    { label: "Ctrl+T", keys: ["ctrl", "t"] },
    { label: "Esc", keys: ["esc"] },
    { label: "F5", keys: ["f5"] },
];
export function ShortcutGrid({ device }) {
    const fire = (keys) => {
        const path = keys.length === 1 ? "/api/keyboard/key" : "/api/keyboard/shortcut";
        const body = keys.length === 1 ? { key: keys[0] } : { keys };
        request(device, path, { method: "POST", body: JSON.stringify(body) }).catch(() => { });
    };
    return (_jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }, children: SHORTCUTS.map((s) => (_jsx("button", { className: "btn-shortcut", onClick: () => fire(s.keys), children: s.label }, s.label))) }));
}
