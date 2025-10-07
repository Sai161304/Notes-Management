const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

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
  
  // Create users and notes tables if they don't exist
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `;

  db.serialize(() => {
    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table ready');
      }
    });
    db.run(createNotesTable, (err) => {
      if (err) {
        console.error('Error creating notes table:', err);
      } else {
        console.log('Notes table ready');
      }
    });

    // Ensure notes.user_id column exists (for older DBs)
    db.all("PRAGMA table_info('notes')", [], (err, rows) => {
      if (err) {
        console.error('Error checking notes table schema:', err);
        return;
      }
      const hasUserId = rows.some((r) => r.name === 'user_id');
      if (!hasUserId) {
        db.run('ALTER TABLE notes ADD COLUMN user_id INTEGER', (alterErr) => {
          if (alterErr) {
            console.error('Error adding user_id to notes:', alterErr);
          } else {
            console.log('Added user_id column to notes');
          }
        });
      }
    });

    // Ensure users.name column exists (for older DBs)
    db.all("PRAGMA table_info('users')", [], (err, rows) => {
      if (err) {
        console.error('Error checking users table schema:', err);
        return;
      }
      const hasName = rows.some((r) => r.name === 'name');
      if (!hasName) {
        db.run('ALTER TABLE users ADD COLUMN name TEXT', (alterErr) => {
          if (alterErr) {
            console.error('Error adding name to users:', alterErr);
          } else {
            console.log('Added name column to users');
          }
        });
      }
    });
  });
});

// Auth helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = { id: payload.id, email: payload.email };
    next();
  });
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Name, email, password, and confirm password are required' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const trimmedName = String(name).trim();
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertQuery = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
    db.run(insertQuery, [trimmedName, normalizedEmail, passwordHash], function(err) {
      if (err) {
        if (String(err.message).includes('UNIQUE')) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Failed to register' });
      }
      const user = { id: this.lastID, name: trimmedName, email: normalizedEmail };
      const token = generateToken(user);
      res.status(201).json({ user, token });
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const findQuery = 'SELECT * FROM users WHERE email = ?';
  db.get(findQuery, [normalizedEmail], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to login' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  });
});

// GET all notes (user scoped)
app.get('/api/notes', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC';
  db.all(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(results);
  });
});

// GET single note by ID (user scoped)
app.get('/api/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM notes WHERE id = ? AND user_id = ?';
  db.get(query, [id, req.user.id], (err, result) => {
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

// POST create new note (user scoped)
app.post('/api/notes', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = 'INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)';
  db.run(query, [title.trim(), content || '', req.user.id], function(err) {
    if (err) {
      console.error('Error creating note:', err);
      return res.status(500).json({ error: 'Failed to create note' });
    }
    
    // Return the created note
    const newNoteQuery = 'SELECT * FROM notes WHERE id = ? AND user_id = ?';
    db.get(newNoteQuery, [this.lastID, req.user.id], (err, result) => {
      if (err) {
        console.error('Error fetching created note:', err);
        return res.status(500).json({ error: 'Failed to fetch created note' });
      }
      res.status(201).json(result);
    });
  });
});

// PUT update note (user scoped)
app.put('/api/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = 'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
  db.run(query, [title.trim(), content || '', id, req.user.id], function(err) {
    if (err) {
      console.error('Error updating note:', err);
      return res.status(500).json({ error: 'Failed to update note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Return the updated note
    const updatedNoteQuery = 'SELECT * FROM notes WHERE id = ? AND user_id = ?';
    db.get(updatedNoteQuery, [id, req.user.id], (err, result) => {
      if (err) {
        console.error('Error fetching updated note:', err);
        return res.status(500).json({ error: 'Failed to fetch updated note' });
      }
      res.json(result);
    });
  });
});

// DELETE note (user scoped)
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
  
  db.run(query, [id, req.user.id], function(err) {
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

