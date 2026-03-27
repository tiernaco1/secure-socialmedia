const express = require('express');
const router = express.Router();
const { User, GroupMember, RevokedCert, Post } = require('../db');

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
// Receives: { userId, keyUpdates: [{ postId, encryptedSessionKey }] }
// Adds the user to the group and appends their re-wrapped AES key to every existing post.
router.post('/add', async (req, res) => {
  try {
    const { userId, keyUpdates } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    // Add to group — upsert so calling twice is safe
    await GroupMember.updateOne({ userId }, { userId }, { upsert: true });

    // Push the new member's encrypted session key into each existing post
    for (const { postId, encryptedSessionKey } of (keyUpdates || [])) {
      await Post.updateOne(
        { _id: postId },
        { $push: { encryptedKeys: { userId, encryptedSessionKey } } }
      );
    }

    res.json({ message: 'User added to group' });
  } catch (err) {
    console.error('POST /group/add error:', err.message);
    res.status(500).json({ message: 'Failed to add user to group' });
  }
});

// POST /api/group/remove
// Receives: { userId }
// Revokes their certificate, removes them from the group, and strips their
// key blob from every existing post so they can no longer decrypt anything.
router.post('/remove', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    // Look up the user to get their cert serial for the CRL
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add their cert serial to the revocation list (upsert — safe to call twice)
    await RevokedCert.updateOne(
      { serial: user.certSerial },
      { serial: user.certSerial },
      { upsert: true }
    );

    // Remove from group
    await GroupMember.deleteOne({ userId });

    // Strip their key blob from every post
    await Post.updateMany(
      {},
      { $pull: { encryptedKeys: { userId: user._id } } }
    );

    res.json({ message: 'User removed from group' });
  } catch (err) {
    console.error('POST /group/remove error:', err.message);
    res.status(500).json({ message: 'Failed to remove user from group' });
  }
});

module.exports = router;
