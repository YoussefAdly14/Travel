const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/authMiddleware');

// View current user's want-to-go list
router.get('/wanttogo', ensureLoggedIn, async (req, res) => {
  try {
    const db = req.app.locals.db;
    let wantToGo = [];
    let user = req.session.username;
    if (db) {
      const collection = db.collection('myCollection');
      const username = req.session.username;
      let dbUser = await collection.findOne({ username });
      if (!dbUser) {
        await collection.insertOne({ username, password: '', wantToGo: [] });
        dbUser = { username, wantToGo: [] };
      } else if (!Array.isArray(dbUser.wantToGo)) {
        await collection.updateOne({ username }, { $set: { wantToGo: [] } });
        dbUser.wantToGo = [];
      }
      wantToGo = dbUser.wantToGo;
    }
    // Template expects `list` not `wantToGo`
    res.render('wanttogo', { user, list: wantToGo });
  } catch (err) {
    console.error('View want-to-go error:', err);
    res.render('wanttogo', { user: '', list: [] });
  }
});

// Remove a destination from want-to-go list
router.post('/wanttogo/remove/:dest', ensureLoggedIn, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');
    const username = req.session.username;
    const dest = req.params.dest;
    await collection.updateOne({ username }, { $pull: { wantToGo: dest } });
    res.redirect('/wanttogo');
  } catch (err) {
    console.error('Remove from want-to-go error:', err);
    return res.status(500).send('Server error');
  }
});

// Clear the entire want-to-go list
router.post('/wanttogo/clear', ensureLoggedIn, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');
    const username = req.session.username;
    await collection.updateOne({ username }, { $set: { wantToGo: [] } });
    res.redirect('/wanttogo');
  } catch (err) {
    console.error('Clear want-to-go error:', err);
    return res.status(500).send('Server error');
  }
});

// Add a destination to want-to-go list
router.post('/destination/:dest/add', ensureLoggedIn, async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) return res.status(500).send('Database not initialized');
    const collection = db.collection('myCollection');
    const username = req.session.username;
    const dest = req.params.dest;
    // Ensure user document exists and has wantToGo array
    let user = await collection.findOne({ username });
    if (!user) {
      await collection.insertOne({ username, password: '', wantToGo: [dest] });
      user = { username, wantToGo: [dest] };
    } else if (!Array.isArray(user.wantToGo)) {
      await collection.updateOne({ username }, { $set: { wantToGo: [dest] } });
      user.wantToGo = [dest];
    } else {
      await collection.updateOne(
        { username },
        { $addToSet: { wantToGo: dest } }
      );
      user = await collection.findOne({ username });
    }
    console.log('AFTER ADD (guaranteed):', { username, wantToGo: user.wantToGo });
    res.redirect('/wanttogo');
  } catch (err) {
    console.error('Add to want-to-go error:', err);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
