type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div style={{ background: "var(--card)", padding: 16, borderRadius: 10, minWidth: 260 }}>
        <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
        <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={{ background: "var(--danger)", color: "white", border: 0, padding: "6px 12px", borderRadius: 6 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
