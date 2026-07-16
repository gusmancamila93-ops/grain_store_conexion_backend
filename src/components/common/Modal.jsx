import { X } from "lucide-react";

function Modal({ open = false, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div className="gs-modal-overlay">
      <section className="gs-card gs-modal-panel">
        <header className="gs-modal-header">
          <h2 className="gs-modal-title">
            {title}
          </h2>
          {onClose ? (
            <button className="gs-modal-close" type="button" onClick={onClose} aria-label="Cerrar modal">
              <X size={18} />
            </button>
          ) : null}
        </header>
        <div className="gs-modal-body">{children}</div>
        {footer ? <footer className="gs-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}

export default Modal;
