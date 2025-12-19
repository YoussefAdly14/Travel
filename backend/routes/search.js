const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/authMiddleware');
const Fuse = require('fuse.js'); // Added for fuzzy search

// Known destination names (match EJS view filenames)
const DESTINATIONS = [
  'annapurna', 'bali', 'cities', 'hiking', 'inca', 'islands', 'paris', 'rome', 'santorini'
];

// Set up Fuse.js for fuzzy searching
const fuse = new Fuse(DESTINATIONS, {
  includeScore: true,
  threshold: 0.4, // Adjust for more/less strictness
});

// Handle search (supports GET and POST)
router.all('/search', ensureLoggedIn, (req, res) => {
  const body = req.body || {};
  // Accept both 'q' and 'Search' field names from forms
  const query = (req.method === 'POST' ? (body.q || body.Search) : (req.query.q || req.query.Search)) || '';
  const q = query.trim().toLowerCase();
  if (!q) {
    return res.render('searchresults', { username: req.session.username, results: [], notFound: true, query: '' });
  }

  // Use Fuse.js for fuzzy search
  const fuseResults = fuse.search(q);
  const matches = fuseResults.map(result => ({
    name: result.item,
    url: `/destination/${encodeURIComponent(result.item)}`
  }));

  if (matches.length === 0) {
    return res.render('searchresults', { username: req.session.username, results: [], notFound: true, query });
  }

  return res.render('searchresults', { username: req.session.username, results: matches, notFound: false, query });
});

module.exports = router;
