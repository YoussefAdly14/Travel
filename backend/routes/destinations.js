const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/authMiddleware');

// Home page - requires login
router.get('/home', ensureLoggedIn, (req, res) => {
  res.render('home', { username: req.session.username });
});

// Category page (renders a view matching the category name)
router.get('/category/:category', ensureLoggedIn, (req, res) => {
  const category = req.params.category;
  // try rendering the ejs file named after the category (e.g., 'cities', 'hiking')
  res.render(category, { username: req.session.username }, (err, html) => {
    if (err) {
      return res.status(404).send('Category not found');
    }
    res.send(html);
  });
});

// Destination page (renders a view matching the destination name)
router.get('/destination/:dest', ensureLoggedIn, (req, res) => {
  const dest = req.params.dest;
  res.render(dest, { username: req.session.username }, (err, html) => {
    if (err) {
      return res.status(404).send('Destination not found');
    }
    res.send(html);
  });
});

// Add destination to current user's want-to-go list
router.post('/destination/:dest/add', ensureLoggedIn, async (req, res) => {
  try {
    const dest = req.params.dest;
    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');

    const username = req.session.username;
    const user = await collection.findOne({ username });
    if (!user) return res.redirect('/login?error=notfound');

    await collection.updateOne({ username }, { $addToSet: { wantToGo: dest } });
    return res.redirect(`/destination/${encodeURIComponent(dest)}?message=added`);
  } catch (err) {
    console.error('Add to want-to-go error:', err);
    return res.status(500).send('Server error');
  }
});

// List of all available destinations (match EJS view filenames)
const DESTINATIONS = [
  'annapurna', 'bali', 'cities', 'hiking', 'inca', 'islands', 'paris', 'rome', 'santorini'
];

// List of categories (example: you can adjust as needed)
const CATEGORIES = [
  'cities', 'hiking', 'islands'
];

// Route to list all destinations
router.get('/destinations', ensureLoggedIn, (req, res) => {
  res.render('destinations', { username: req.session.username, destinations: DESTINATIONS });
});

// Route to list all categories
router.get('/categories', ensureLoggedIn, (req, res) => {
  res.render('categories', { username: req.session.username, categories: CATEGORIES });
});

module.exports = router;
