require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { connect } = require('./models/db');

const app = express();
const port = process.env.PORT || 3000;


// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup - secret from env
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
}));

// Prevent caching of authenticated pages (helps after logout)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// --- GLOBAL SESSION PROTECTION ---
const { ensureLoggedIn } = require('./middleware/authMiddleware');
// Only allow unauthenticated access to /login, /register, and static files
app.use((req, res, next) => {
  const openPaths = ['/login', '/register', '/logout'];
  if (
    openPaths.includes(req.path) ||
    req.path.startsWith('/public') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js') ||
    req.path.startsWith('/images') ||
    req.path === '/' // root handled below
  ) {
    return next();
  }
  // Allow static files (by extension)
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|mp4)$/i)) {
    return next();
  }
  // Otherwise, require login
  return ensureLoggedIn(req, res, next);
});

// Mount routers
const authRouter = require('./routes/auth');
const destRouter = require('./routes/destinations');
const searchRouter = require('./routes/search');
const wantToGoRouter = require('./routes/wantToGo');

app.use('/', authRouter);
app.use('/', destRouter);
app.use('/', searchRouter);
app.use('/', wantToGoRouter);

// Root route: send logged-in users to /home, others to /login
app.get('/', (req, res) => {
  if (req.session && req.session.username) {
    return res.redirect('/home');
  }
  return res.redirect('/login');
});

// Simple health check (no auth)
app.get('/health', (req, res) => {
  const dbReady = Boolean(req.app.locals.db);
  res.json({ ok: true, dbReady });
});

// quick DB test route
app.get('/dbtest', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const col = db.collection('myCollection');
    const count = await col.countDocuments();
    const sample = await col.findOne({}, { projection: { password: 0 } }); // hide password
    res.json({ ok: true, count, sample });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Connect to MongoDB once and store myDB on app.locals
async function connectDB() {
  try {
    app.locals.db = await connect();
    console.log('Connected to MongoDB (myDB)');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    app.locals.db = null; // allow server to start without DB
  } finally {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }
}
connectDB();
