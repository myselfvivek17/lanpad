import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, Navigate } from "react-router-dom";
import { useSelectedDevice } from "../store/devices";
export default function Control() {
    const d = useSelectedDevice();
    if (!d)
        return _jsx(Navigate, { to: "/" });
    return (_jsxs("div", { className: "screen", children: [_jsx("h1", { children: d.name }), _jsxs("p", { style: { color: "var(--muted)" }, children: [d.kind, " \u00B7 ", d.hostname, ":", d.port] }), _jsxs("nav", { style: { display: "grid", gap: 8 }, children: [d.kind === "laptop" && _jsxs(_Fragment, { children: [_jsx(Link, { to: "/trackpad", children: "Trackpad" }), _jsx(Link, { to: "/keyboard", children: "Keyboard" }), _jsx(Link, { to: "/media", children: "Media" })] }), _jsx(Link, { to: "/power", children: "Power" }), _jsx(Link, { to: "/", children: "\u2190 Back to devices" })] })] }));
}
