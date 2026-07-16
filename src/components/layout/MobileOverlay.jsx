function MobileOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <button
      aria-label="Cerrar navegación"
      className="gs-mobile-overlay"
      onClick={onClose}
      type="button"
    />
  );
}

export default MobileOverlay;
