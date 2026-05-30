import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate } from "react-router-dom";
import { useSelectedDevice } from "../store/devices";
const LAPTOP_TILES = [
    { to: "/trackpad", icon: "🖱️", label: "Trackpad" },
    { to: "/keyboard", icon: "⌨️", label: "Keyboard" },
    { to: "/media", icon: "🎵", label: "Media" },
    { to: "/power", icon: "⚡", label: "Power" },
];
const SERVER_TILES = [
    { to: "/power", icon: "⚡", label: "Power" },
];
export default function Control() {
    const d = useSelectedDevice();
    if (!d)
        return _jsx(Navigate, { to: "/" });
    const tiles = d.kind === "laptop" ? LAPTOP_TILES : SERVER_TILES;
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/", className: "back", children: "\u2190 Devices" }), _jsxs("div", { style: { marginBottom: 28, marginTop: 8 }, children: [_jsx("div", { className: "mono", style: { fontSize: 10, color: "var(--accent)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }, children: d.kind }), _jsx("h1", { children: d.name }), _jsxs("div", { className: "mono", style: { fontSize: 11, color: "var(--muted)", marginTop: 5 }, children: [d.hostname, ":", d.port] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: tiles.map((t) => (_jsxs(Link, { to: t.to, className: "tile", children: [_jsx("span", { style: { fontSize: 26 }, children: t.icon }), _jsx("span", { style: { fontWeight: 700, fontSize: 16 }, children: t.label })] }, t.to))) })] }));
}
