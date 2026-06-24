function Modal({ open = false, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/55 p-4">
      <section className="gs-card w-full max-w-[480px] p-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
            {title}
          </h2>
          {onClose ? (
            <button className="gs-btn gs-btn-secondary min-h-9 px-4" type="button" onClick={onClose}>
              Cerrar
            </button>
          ) : null}
        </header>
        <div>{children}</div>
        {footer ? <footer className="mt-6 flex justify-end gap-3">{footer}</footer> : null}
      </section>
    </div>
  );
}

export default Modal;
