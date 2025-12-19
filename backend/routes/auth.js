const express = require('express');
const router = express.Router();

// Registration page
router.get('/register', (req, res) => {
  const msg = req.query.msg || null;
  res.render('registration', { message: msg, error: null });
});

// Alias: some views link to /registration
router.get('/registration', (req, res) => {
  const msg = req.query.msg || null;
  res.render('registration', { message: msg, error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.render('registration', { error: 'Username and password are required.', message: null });
    }

    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');

    const existing = await collection.findOne({ username });
    if (existing) {
      return res.render('registration', { error: 'Username already taken.', message: null });
    }

    await collection.insertOne({ username, password, wantToGo: [] });
    // Redirect to login with a success message
    return res.redirect('/login?msg=registered');
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).send('Server error');
  }
});

// Alias: accept POST /registration and forward preserving method
router.post('/registration', (req, res) => {
  return res.redirect(307, '/register');
});

// Login page
router.get('/login', (req, res) => {
  const error = req.query.error || null;
  const msg = req.query.msg || null;
  res.render('login', { error, message: msg });
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    console.log('Login attempt:', { username, password });
    if (!username || !password) {
      return res.render('login', { error: 'Username and password are required.', message: null });
    }

    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');

    const user = await collection.findOne({ username });
    console.log('User found in DB:', user);
    if (!user || user.password !== password) {
      console.log('Login failed: invalid credentials');
      return res.render('login', { error: 'Invalid username or password.', message: null });
    }

    // Save user info in session
    req.session.username = user.username;
    req.session.userId = user._id;
    console.log('Login successful, session set:', req.session);
    return res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send('Server error');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.set('Cache-Control', 'no-store');
    res.redirect('/login');
  });
});

module.exports = router;

