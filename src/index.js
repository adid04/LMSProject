// backend/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres', // replace with your username
  host: 'localhost',
  database: 'library',
  password: 'yourpassword',
  port: 5432,
});

// Get books
app.get('/books', async (req, res) => {
  const search = req.query.search || '';
  try {
    const result = await pool.query(
      'SELECT * FROM books WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1',
      [`%${search.toLowerCase()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrow book
app.post('/borrow', async (req, res) => {
  const { bookId, memberId } = req.body;
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);

  try {
    await pool.query('BEGIN');

    const availability = await pool.query(
      'SELECT CopiesAvailable FROM books WHERE BookID = $1 FOR UPDATE',
      [bookId]
    );
    if (availability.rows[0].copiesavailable < 1) {
      throw new Error('Book not available');
    }

    await pool.query(
      'UPDATE books SET CopiesAvailable = CopiesAvailable - 1 WHERE BookID = $1',
      [bookId]
    );

    await pool.query(
      'INSERT INTO borrowingtransactions (BookID, MemberID, BorrowDate, DueDate) VALUES ($1, $2, $3, $4)',
      [bookId, memberId, now.toISOString().slice(0, 10), due.toISOString().slice(0, 10)]
    );

    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Register member
app.post('/members', async (req, res) => {
  const { name, contactInfo = '', type = 'Standard' } = req.body;
  const today = new Date();
  const expiry = new Date(today);
  expiry.setFullYear(expiry.getFullYear() + 1);

  try {
    const result = await pool.query(
      'INSERT INTO members (Name, ContactInfo, MembershipType, JoinDate, ExpiryDate) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, contactInfo, type, today.toISOString().slice(0, 10), expiry.toISOString().slice(0, 10)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all members
app.get('/members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM members');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Library API running on http://localhost:${port}`);
});

const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'client/build')));

// Fallback for any other routes to React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
