import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useDevices } from "../store/devices";
export default function Devices() {
    const { devices, remove, select } = useDevices();
    return (_jsxs("div", { className: "screen", children: [_jsx("h1", { children: "Devices" }), devices.length === 0 && _jsx("p", { children: "No devices paired yet." }), _jsx("ul", { style: { listStyle: "none", padding: 0 }, children: devices.map((d) => (_jsx("li", { style: { marginBottom: 12, padding: 12, background: "var(--card)", borderRadius: 8 }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600 }, children: d.name }), _jsxs("div", { style: { color: "var(--muted)", fontSize: 13 }, children: [d.kind, " \u00B7 ", d.hostname, ":", d.port] })] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx(Link, { to: "/control", onClick: () => select(d.id), children: "Open" }), _jsx("button", { onClick: () => remove(d.id), style: { color: "var(--danger)", background: "none", border: 0 }, children: "Remove" })] })] }) }, d.id))) }), _jsx(Link, { to: "/pair", children: "+ Add device" })] }));
}
