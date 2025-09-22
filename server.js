const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database Connection
const dbPath = path.join(__dirname, 'notes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  
  // Create notes table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Notes table ready');
    }
  });
});

// Routes

// GET all notes
app.get('/api/notes', (req, res) => {
  const query = 'SELECT * FROM notes ORDER BY updated_at DESC';
  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(results);
  });
});

// GET single note by ID
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM notes WHERE id = ?';
  db.get(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching note:', err);
      return res.status(500).json({ error: 'Failed to fetch note' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(result);
  });
});

// POST create new note
app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';
  db.run(query, [title.trim(), content || ''], function(err) {
    if (err) {
      console.error('Error creating note:', err);
      return res.status(500).json({ error: 'Failed to create note' });
    }
    
    // Return the created note
    const newNoteQuery = 'SELECT * FROM notes WHERE id = ?';
    db.get(newNoteQuery, [this.lastID], (err, result) => {
      if (err) {
        console.error('Error fetching created note:', err);
        return res.status(500).json({ error: 'Failed to fetch created note' });
      }
      res.status(201).json(result);
    });
  });
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = 'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(query, [title.trim(), content || '', id], function(err) {
    if (err) {
      console.error('Error updating note:', err);
      return res.status(500).json({ error: 'Failed to update note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Return the updated note
    const updatedNoteQuery = 'SELECT * FROM notes WHERE id = ?';
    db.get(updatedNoteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error fetching updated note:', err);
        return res.status(500).json({ error: 'Failed to fetch updated note' });
      }
      res.json(result);
    });
  });
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting note:', err);
      return res.status(500).json({ error: 'Failed to delete note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Notes API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

