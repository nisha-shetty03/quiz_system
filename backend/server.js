const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    if (users.length === 0) return res.status(401).json({ error: 'User not found' });
    
    const user = users[0];
    if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Users Route
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, role, createdAt FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quizzes Routes
app.get('/api/quizzes', async (req, res) => {
  try {
    const [quizzes] = await db.execute('SELECT * FROM quizzes ORDER BY createdAt DESC');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes', async (req, res) => {
  const { title, subject, timeLimit, passMark, status, createdBy } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO quizzes (title, subject, timeLimit, passMark, status, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [title, subject, timeLimit, passMark, status || 'draft', createdBy]
    );
    res.status(201).json({ id: result.insertId, title, subject, timeLimit, passMark, status: status || 'draft', createdBy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quizzes/:id', async (req, res) => {
  const { title, subject, timeLimit, passMark, status } = req.body;
  try {
    await db.execute(
      'UPDATE quizzes SET title = ?, subject = ?, timeLimit = ?, passMark = ?, status = ? WHERE id = ?',
      [title, subject, timeLimit, passMark, status || 'draft', req.params.id]
    );
    res.json({ id: parseInt(req.params.id), title, subject, timeLimit, passMark, status: status || 'draft' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Questions Routes
app.get('/api/quizzes/:id/questions', async (req, res) => {
  try {
    const [questions] = await db.execute('SELECT * FROM questions WHERE quizId = ?', [req.params.id]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions', async (req, res) => {
  const { quizId, type, questionText, options, correctAnswer, explanation } = req.body;
  console.log("Length:",explanation?.length);
  if (explanation && explanation.length > 500) {
  return res.status(400).json({
    error: "Explanation cannot exceed 500 characters"
  });
}
  try {
    const [result] = await db.execute(
      'INSERT INTO questions (quizId, type, questionText, options, correctAnswer, explanation) VALUES (?, ?, ?, ?, ?, ?)',
      [quizId, type, questionText, JSON.stringify(options || []), correctAnswer, explanation]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  const { type, questionText, options, correctAnswer, explanation } = req.body;
  if (explanation && explanation.length > 500) {
  return res.status(400).json({
    error: "Explanation cannot exceed 500 characters"
  });
}
  try {
    await db.execute(
      'UPDATE questions SET type = ?, questionText = ?, options = ?, correctAnswer = ?, explanation = ? WHERE id = ?',
      [type, questionText, JSON.stringify(options || []), correctAnswer, explanation, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attempts Routes
app.post('/api/attempts', async (req, res) => {
  const { quizId, studentId, answers, score, timeTaken, passed } = req.body;

  try {

    // Check if student already attempted this quiz
    const [existing] = await db.execute(
      'SELECT id FROM attempts WHERE quizId = ? AND studentId = ?',
      [quizId, studentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'You have already attempted this quiz'
      });
    }

    const [result] = await db.execute(
      'INSERT INTO attempts (quizId, studentId, answers, score, timeTaken, passed) VALUES (?, ?, ?, ?, ?, ?)',
      [quizId, studentId, JSON.stringify(answers), score, timeTaken, passed]
    );

    res.status(201).json({
      id: result.insertId,
      ...req.body
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [leaderboard] = await db.execute(`
      SELECT u.id, u.name, COUNT(a.id) as quizzesTaken, ROUND(AVG(a.score), 1) as averageScore 
      FROM users u 
      JOIN attempts a ON u.id = a.studentId 
      WHERE u.role = 'student' 
      GROUP BY u.id 
      ORDER BY averageScore DESC
    `);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
