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
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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
    if (token) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [token]);

  const onChangeAuthField = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      // Client-side validation for register
      if (authMode === 'register') {
        if (!authForm.name.trim()) {
          throw new Error('Name is required');
        }
        if (authForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || 'Authentication failed');
        }
        throw new Error('Unexpected non-JSON response');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setError(null);
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNotes([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Notes Manager</h1>
        <p>Organize your thoughts and ideas</p>
        <div style={{ marginTop: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <span>Signed in as {user.name || user.email}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {token ? (
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
        ) : (
          <div className="notes-container" style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="notes-header" style={{ justifyContent: 'center' }}>
              <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
            </div>
            <form className="note-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" value={authForm.name} onChange={onChangeAuthField} required={authMode === 'register'} />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={authForm.email} onChange={onChangeAuthField} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" value={authForm.password} onChange={onChangeAuthField} required />
              </div>
              {authMode === 'register' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={authForm.confirmPassword} onChange={onChangeAuthField} required={authMode === 'register'} />
                </div>
              )}
              <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                  {authMode === 'login' ? 'Create account' : 'Have an account? Login'}
                </button>
                <button type="submit" className="btn btn-primary">{authMode === 'login' ? 'Login' : 'Register'}</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;