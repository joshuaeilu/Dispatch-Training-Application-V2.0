const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    // Try header first (standard)
    const header = req.headers.authorization || '';
    const [scheme, headerToken] = header.split(' ');

    // Try query token fallback (for media links like <audio src="...">)
    const queryToken = req.query.token;

    const token =
      (scheme === 'Bearer' && headerToken) ? headerToken : queryToken;

    if (!token) {
      return res.status(401).json({ error: 'Missing or malformed token' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if expired/invalid
      req.user = payload; // e.g. { id, username, role }

      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = { auth };
