interface IModal {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: IModal) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="text-text bg-popup rounded-lg p-6 w-3/4 max-w-md shadow-[0_0_15px_5px_rgba(0,0,0,0.3)]">
        {children}
      </div>
    </div>
  );
}

