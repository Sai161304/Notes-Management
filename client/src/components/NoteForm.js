import React, { useState, useEffect } from 'react';

const NoteForm = ({ note, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || ''
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter note title..."
          required
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your note content here..."
          rows={8}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {note ? 'Update Note' : 'Create Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;