type AlertDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-snappy hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isConfirming ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
