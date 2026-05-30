import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pair } from "../api/client";
import { useDevices } from "../store/devices";
export default function Pair() {
    const nav = useNavigate();
    const add = useDevices((s) => s.add);
    const [hostname, setHostname] = useState("");
    const [port, setPort] = useState(8765);
    const [kind, setKind] = useState("laptop");
    const [name, setName] = useState("");
    const [pin, setPin] = useState("");
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            const res = await pair(hostname, port, pin, name || kind);
            add({ id: res.device_id, name: name || kind, hostname, port, kind, token: res.token });
            nav("/");
        }
        catch (e) {
            setErr(e?.body?.error ?? `Pair failed (${e?.status ?? "?"})`);
        }
        finally {
            setBusy(false);
        }
    }
    return (_jsxs("div", { className: "screen", children: [_jsx(Link, { to: "/", className: "back", children: "\u2190 Devices" }), _jsxs("div", { style: { marginBottom: 28, marginTop: 8 }, children: [_jsx("h1", { children: "Add Device" }), _jsx("p", { style: { color: "var(--muted)", marginTop: 8, fontSize: 14, lineHeight: 1.6 }, children: "Enter the IP and PIN shown on the agent" })] }), _jsxs("form", { onSubmit: onSubmit, style: { display: "flex", flexDirection: "column", gap: 14 }, children: [_jsxs("div", { className: "form-field", children: [_jsx("span", { className: "form-label", children: "IP Address" }), _jsx("input", { placeholder: "192.168.0.121", value: hostname, onChange: (e) => setHostname(e.target.value), required: true, autoCapitalize: "none", autoCorrect: "off", inputMode: "url" })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [_jsxs("div", { className: "form-field", children: [_jsx("span", { className: "form-label", children: "Port" }), _jsx("input", { type: "number", value: port, onChange: (e) => setPort(+e.target.value) })] }), _jsxs("div", { className: "form-field", children: [_jsx("span", { className: "form-label", children: "Type" }), _jsxs("select", { value: kind, onChange: (e) => setKind(e.target.value), children: [_jsx("option", { value: "laptop", children: "Laptop" }), _jsx("option", { value: "server", children: "Server" })] })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("span", { className: "form-label", children: "Device name" }), _jsx("input", { placeholder: "My Laptop", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: "form-field", children: [_jsx("span", { className: "form-label", children: "PIN" }), _jsx("input", { placeholder: "000000", value: pin, onChange: (e) => setPin(e.target.value), inputMode: "numeric", maxLength: 6, required: true, style: {
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: 28,
                                    letterSpacing: "0.35em",
                                    textAlign: "center",
                                    padding: "16px",
                                } })] }), err && (_jsx("div", { style: {
                            background: "var(--danger-dim)",
                            border: "1px solid rgba(255,68,85,0.25)",
                            borderRadius: "var(--r-sm)",
                            padding: "12px 14px",
                            color: "var(--danger)",
                            fontSize: 13,
                            lineHeight: 1.5,
                        }, children: err })), _jsx("button", { className: "btn-primary", type: "submit", disabled: busy, style: { marginTop: 4 }, children: busy ? "Connecting…" : "Pair Device" })] })] }));
}
