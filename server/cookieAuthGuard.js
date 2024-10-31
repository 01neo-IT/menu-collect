
function cookieAuthGuard(req, res, next) {
  const cookies = req.cookies;

  if (cookies && cookies.authguard && cookies.authguard.includes('authtoken')) {
    return next(); // Allows the request to proceed
  }

  return res.status(403).send('Forbidden'); // Deny access if the condition isn't met
}

module.exports = cookieAuthGuard;

