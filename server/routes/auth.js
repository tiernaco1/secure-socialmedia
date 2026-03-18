const express = require('express');
const router = express.Router();

// POST /api/auth/register
// Receives: username, password hash, public key from client
// Returns: signed X.509 certificate from the CA
router.post('/register', (req, res) => {
  // TODO: implement registration
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/auth/login
// Returns: user info + their certificate
router.post('/login', (req, res) => {
  // TODO: implement login
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
