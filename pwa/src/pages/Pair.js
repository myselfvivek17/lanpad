import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pair } from "../api/client";
import { useDevices } from "../store/devices";
export default function Pair() {
    const nav = useNavigate();
    const add = useDevices((s) => s.add);
    const [hostname, setHostname] = useState("laptop.local");
    const [port, setPort] = useState(8765);
    const [kind, setKind] = useState("laptop");
    const [name, setName] = useState("phone");
    const [pin, setPin] = useState("");
    const [err, setErr] = useState(null);
    const [busy, setBusy] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setBusy(true);
        try {
            const res = await pair(hostname, port, pin, name);
            add({
                id: res.device_id,
                name,
                hostname,
                port,
                kind,
                token: res.token,
            });
            nav("/");
        }
        catch (e) {
            setErr(e?.body?.error ?? `Pair failed (${e?.status ?? "?"})`);
        }
        finally {
            setBusy(false);
        }
    }
    return (_jsxs("form", { className: "screen", onSubmit: onSubmit, children: [_jsx("h1", { children: "Add device" }), _jsxs("label", { children: ["Hostname", _jsx("input", { value: hostname, onChange: (e) => setHostname(e.target.value) })] }), _jsxs("label", { children: ["Port", _jsx("input", { type: "number", value: port, onChange: (e) => setPort(+e.target.value) })] }), _jsxs("label", { children: ["Kind", _jsxs("select", { value: kind, onChange: (e) => setKind(e.target.value), children: [_jsx("option", { value: "laptop", children: "laptop" }), _jsx("option", { value: "server", children: "server" })] })] }), _jsxs("label", { children: ["Device name", _jsx("input", { value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("label", { children: ["PIN", _jsx("input", { value: pin, onChange: (e) => setPin(e.target.value), inputMode: "numeric" })] }), err && _jsx("p", { style: { color: "var(--danger)" }, children: err }), _jsx("button", { type: "submit", disabled: busy, children: busy ? "Pairing…" : "Pair" })] }));
}
