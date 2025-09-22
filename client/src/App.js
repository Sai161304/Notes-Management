import React, { useState, useEffect } from 'react';
import './App.css';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import NoteModal from './components/NoteModal';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new note
  const createNote = async (noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create note');
      }

      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
      console.error('Error creating note:', err);
    }
  };

  // Update existing note
  const updateNote = async (id, noteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
      setShowModal(false);
      setEditingNote(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating note:', err);
    }
  };

  // Delete note
  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting note:', err);
    }
  };

  // Handle edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = (noteData) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
    } else {
      createNote(noteData);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  // Load notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Notes Manager</h1>
        <p>Organize your thoughts and ideas</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="notes-container">
          <div className="notes-header">
            <h2>Your Notes</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Add New Note
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading notes...</div>
          ) : (
            <NoteList 
              notes={notes} 
              onEdit={handleEditNote}
              onDelete={deleteNote}
            />
          )}
        </div>

        {showModal && (
          <NoteModal
            note={editingNote}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </main>
    </div>
  );
}

export default App;