const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'swadsadan_secret_123');
    req.user = decoded; // Contains id, role, etc.
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const verifyAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied, admin only' });
    }
    next();
  });
};

const verifyAgent = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ msg: 'Access denied, delivery agents only' });
    }
    next();
  });
};

const verifyUser = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'user') {
      return res.status(403).json({ msg: 'Access denied, customer only' });
    }
    next();
  });
};

module.exports = { auth, adminAuth: verifyAdmin, verifyAdmin, verifyAgent, verifyUser };

