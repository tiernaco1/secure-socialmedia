const express = require('express');
const router = express.Router();
const { User, RevokedCert } = require('../db');

// GET /api/certificates/crl
// Returns the current Certificate Revocation List as an array of revoked serials.
// Listed before /:userId so Express does not mistake "crl" for a userId.
router.get('/crl', async (req, res) => {
  try {
    const revoked = await RevokedCert.find({}, 'serial revokedAt');
    res.json(revoked.map(r => ({ serial: r.serial, revokedAt: r.revokedAt })));
  } catch (err) {
    console.error('GET /certificates/crl error:', err.message);
    res.status(500).json({ message: 'Failed to fetch CRL' });
  }
});

// GET /api/certificates/:userId
// Returns the PEM-encoded X.509 certificate for a given user.
// Clients can use this to verify another user's public key is CA-signed.
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'username certificate certSerial');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      userId:      user._id,
      username:    user.username,
      certificate: user.certificate,
      serial:      user.certSerial
    });
  } catch (err) {
    console.error('GET /certificates/:userId error:', err.message);
    res.status(500).json({ message: 'Failed to fetch certificate' });
  }
});

module.exports = router;
