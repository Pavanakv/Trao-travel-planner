export default function DeleteConfirmModal({ destination, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="stamp-edge bg-paper p-6 max-w-sm w-full">
        <h3 id="delete-modal-title" className="font-display text-lg text-ink mb-2">
          Delete this trip?
        </h3>
        <p className="text-sm text-ink/60 mb-6">
          This will permanently remove {destination} and its entire plan. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm border border-ink/30 text-ink py-2 rounded-sm hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm bg-stamp text-paper py-2 rounded-sm hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
