const express = require('express');
const router = express.Router();

// GET /api/posts
// Returns: all posts (ciphertext + encrypted key blobs)
router.get('/', (req, res) => {
  // TODO: fetch all posts from DB
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/posts
// Receives: ciphertext, array of { userId, encryptedSessionKey }
router.post('/', (req, res) => {
  // TODO: store encrypted post
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
