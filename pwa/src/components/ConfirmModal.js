import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
    return (_jsx("div", { style: {
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }, children: _jsxs("div", { style: { background: "var(--card)", padding: 16, borderRadius: 10, minWidth: 260 }, children: [_jsx("h3", { style: { margin: "0 0 8px" }, children: title }), _jsx("p", { style: { color: "var(--muted)", margin: "0 0 16px" }, children: message }), _jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [_jsx("button", { onClick: onCancel, children: "Cancel" }), _jsx("button", { onClick: onConfirm, style: { background: "var(--danger)", color: "white", border: 0, padding: "6px 12px", borderRadius: 6 }, children: confirmLabel })] })] }) }));
}
