const express = require('express');
const router = express.Router();

// GET /api/group/members
// Returns: list of current group members (userId + certificate)
router.get('/members', (req, res) => {
  // TODO: return all group members with their certificates
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/group/add
// Receives: userId to add to the secure group
router.post('/add', (req, res) => {
  // TODO: add user to group_members table
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/group/remove
// Receives: userId to remove; also triggers certificate revocation
router.post('/remove', (req, res) => {
  // TODO: remove user from group, add cert serial to revocation_list
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
