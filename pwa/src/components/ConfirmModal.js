import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
    return (_jsx("div", { className: "modal-overlay", onClick: onCancel, children: _jsxs("div", { className: "modal-sheet", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "mono", style: { fontSize: 10, color: "var(--accent)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }, children: "Confirm" }), _jsx("h2", { style: { fontSize: 20, fontWeight: 800, marginBottom: 8 }, children: title }), _jsx("p", { style: { color: "var(--muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }, children: message }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [_jsx("button", { onClick: onCancel, style: {
                                padding: "15px",
                                background: "var(--surface)",
                                color: "var(--fg)",
                                borderRadius: "var(--r)",
                                border: "1px solid var(--border)",
                                fontSize: 15,
                            }, children: "Cancel" }), _jsx("button", { onClick: onConfirm, style: {
                                padding: "15px",
                                background: "var(--danger-dim)",
                                color: "var(--danger)",
                                borderRadius: "var(--r)",
                                border: "1px solid rgba(255,68,85,0.3)",
                                fontSize: 15,
                                fontWeight: 700,
                            }, children: confirmLabel })] })] }) }));
}
