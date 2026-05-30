type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
          Confirm
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "15px",
              background: "var(--surface)",
              color: "var(--fg)",
              borderRadius: "var(--r)",
              border: "1px solid var(--border)",
              fontSize: 15,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "15px",
              background: "var(--danger-dim)",
              color: "var(--danger)",
              borderRadius: "var(--r)",
              border: "1px solid rgba(255,68,85,0.3)",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
