import React from 'react';

const NoteList = ({ notes, onEdit, onDelete }) => {
  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No notes yet</h3>
        <p>Create your first note to get started!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <div key={note.id} className="note-card">
          <div className="note-header">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-actions">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => onEdit(note)}
                title="Edit note"
              >
                Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(note.id)}
                title="Delete note"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="note-content">
            <p>{truncateContent(note.content)}</p>
          </div>
          
          <div className="note-footer">
            <small className="note-date">
              {formatDate(note.updated_at)}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;