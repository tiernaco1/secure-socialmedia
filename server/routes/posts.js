const express = require('express');
const router = express.Router();
const { Post } = require('../db');

// GET /api/posts
// Returns all posts newest-first.
// Each post contains the ciphertext + the array of per-member encrypted session keys.
// The client decides whether to decrypt (member) or display ciphertext (non-member).
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('authorId', 'username');

    res.json(posts.map(p => ({
      id:            p._id,
      author:        p.authorId?.username || 'Unknown',
      authorId:      p.authorId?._id,
      ciphertext:    p.ciphertext,
      iv:            p.iv,
      tag:           p.tag,
      encryptedKeys: p.encryptedKeys,
      createdAt:     p.createdAt
    })));
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// POST /api/posts
// Receives: { authorId, ciphertext, iv, tag, encryptedKeys }
// Stores the encrypted post in MongoDB.
router.post('/', async (req, res) => {
  try {
    const { authorId, ciphertext, iv, tag, encryptedKeys } = req.body;

    if (!authorId || !ciphertext || !iv || !tag || !encryptedKeys) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const post = await Post.create({ authorId, ciphertext, iv, tag, encryptedKeys });
    res.status(201).json({ postId: post._id });
  } catch (err) {
    console.error('POST /posts error:', err.message);
    res.status(500).json({ message: 'Failed to save post' });
  }
});

module.exports = router;
