function ensureLoggedIn(req, res, next) {
  if (!req.session || !req.session.username) {
    return res.redirect('/login?error=loginrequired');
  }
  next();
}

module.exports = { ensureLoggedIn };