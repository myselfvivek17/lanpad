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
        return _jsxs("div", { className: "screen", children: [_jsx("p", { children: "No laptop selected." }), _jsx(Link, { to: "/", children: "Back" })] });
    }
    return (_jsxs("div", { className: "screen", style: { display: "flex", flexDirection: "column", height: "100dvh", padding: 8 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px" }, children: [_jsx(Link, { to: "/control", children: "\u2190 Back" }), _jsx("span", { style: { color: status === "open" ? "var(--accent)" : "var(--danger)" }, children: status })] }), _jsx(TrackpadSurface, { device: d, sensitivity: sens, onStatus: setStatus, onAuthFail: () => remove(d.id) }), _jsxs("div", { style: { padding: 8 }, children: ["Sensitivity: ", sens.toFixed(1), "\u00D7", _jsx("input", { type: "range", min: 0.5, max: 3.0, step: 0.1, value: sens, onChange: (e) => setSens(+e.target.value), style: { width: "100%" } })] })] }));
}
