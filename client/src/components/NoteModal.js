import React from 'react';
import NoteForm from './NoteForm';

const NoteModal = ({ note, onSubmit, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Create New Note'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <NoteForm
            note={note}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteModal;