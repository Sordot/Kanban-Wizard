import React, { useEffect } from "react";

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, children, confirmText = "Confirm", variant = 'Danger' }) {

    //listen for escape key to close modal and enter key to confirm
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, onConfirm]);

    if (!isOpen) return null;

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    }



    return (
        <div className="modal-overlay" onMouseDown={handleOverlayClick}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                {message && <p className="modal-message">{message}</p>}

                {/* This allows us to put an input field here for renaming */}
                {children}

                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
                    <button className={`modal-btn ${variant === 'confirm' ? 'confirm-green' : 'delete-red'}`} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    )
}