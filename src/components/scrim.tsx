export function Scrim({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      className="fixed inset-0 z-20 cursor-default bg-transparent"
      onClick={onClose}
    />
  );
}
