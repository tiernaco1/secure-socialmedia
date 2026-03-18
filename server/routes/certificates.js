const express = require('express');
const router = express.Router();

// GET /api/certificates/:userId
// Returns: the X.509 certificate for a given user
router.get('/:userId', (req, res) => {
  // TODO: return certificate for userId
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/certificates/crl
// Returns: the Certificate Revocation List
router.get('/crl', (req, res) => {
  // TODO: return list of revoked certificate serials
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
