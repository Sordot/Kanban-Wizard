import React from "react";

export default function ConfirmationModal ({isOpen, title, message, onConfirm, onCancel}) {
    if (!isOpen) return null
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
                    <button className="modal-btn delete" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    )
}