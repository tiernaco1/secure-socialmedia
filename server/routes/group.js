const express = require('express');
const router = express.Router();
const { User, GroupMember, RevokedCert } = require('../db');

// GET /api/group/members
// Returns all current group members with their certificates + the current CRL.
// The client uses this before encrypting a post to know who to wrap keys for.
router.get('/members', async (req, res) => {
  try {
    const memberships = await GroupMember.find();
    const userIds = memberships.map(m => m.userId);

    const users = await User.find({ _id: { $in: userIds } });
    const crl   = await RevokedCert.find();

    res.json({
      members: users.map(u => ({
        userId:      u._id,
        username:    u.username,
        certificate: u.certificate
      })),
      revokedSerials: crl.map(r => r.serial)
    });
  } catch (err) {
    console.error('GET /group/members error:', err.message);
    res.status(500).json({ message: 'Failed to fetch group members' });
  }
});

// POST /api/group/add
// Receives: { userId }
// Adds a registered user to the secure group so future posts include a key for them.
router.post('/add', async (req, res) => {
  // TODO: implement in Phase 5 (group management)
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /api/group/remove
// Receives: { userId }
// Removes a user from the group and revokes their certificate.
router.post('/remove', async (req, res) => {
  // TODO: implement in Phase 5 (group management)
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
