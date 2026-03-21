const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../db');
const { signCertificate, getCACertPem } = require('../../ca/ca');

// POST /api/auth/register
// Receives: { username, password, publicKeyPem }
// Returns:  { userId, certificate, caCertificate }
router.post('/register', async (req, res) => {
  try {
    const { username, password, publicKeyPem } = req.body;

    // Validate all required fields are present
    if (!username || !password || !publicKeyPem)
      return res.status(400).json({ message: 'Missing fields' });

    // Reject if username is already taken
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(409).json({ message: 'Username already taken' });

    // Hash the password before storing
    const passwordHash = await bcrypt.hash(password, 10);

    // CA signs the user's public key → issues a signed X.509 certificate
    const { certPem, serial } = signCertificate(username, publicKeyPem);

    // Save the new user to MongoDB
    const user = await User.create({
      username,
      passwordHash,
      certificate: certPem,
      certSerial: serial
    });

    // Return the user's cert + the CA cert (client needs CA cert to verify other users)
    res.status(201).json({
      userId: user._id,
      certificate: certPem,
      caCertificate: getCACertPem()
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
// Receives: { username, password }
// Returns:  { userId, username, certificate, caCertificate }
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Look up the user
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Verify password against stored hash
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Return user info and certificates needed for client-side crypto
    res.json({
      userId: user._id,
      username: user.username,
      certificate: user.certificate,
      caCertificate: getCACertPem()
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
