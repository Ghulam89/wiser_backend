const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'fail', message: 'No token provided' });
  }

  // Remove unwanted quotes if they exist
  token = token.replace(/^"|"$/g, ''); // Removes quotes from the start and end

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'TokenExpiredError', message: 'Token expired, please login again' });
    } else {
      return res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
  }
};

module.exports = authenticate;
