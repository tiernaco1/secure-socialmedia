const mongoose = require('mongoose');

// --- User ---
// Stores registered users. The certificate is the X.509 cert issued by the CA.
// certSerial is used to look up revocations in the CRL.
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  certificate:  { type: String, required: true }, // PEM-encoded X.509 cert
  certSerial:   { type: String, required: true }  // serial number for CRL lookup
});

// --- Post ---
// Stores an encrypted message. encryptedKeys is an array of per-member key blobs.
// Each blob: { userId, encryptedSessionKey } — only that user can decrypt their blob.
const postSchema = new mongoose.Schema({
  authorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ciphertext:    { type: String, required: true },  // AES-256-GCM encrypted message (Base64)
  encryptedKeys: { type: Array,  required: true },  // [{ userId, encryptedSessionKey }]
  createdAt:     { type: Date,   default: Date.now }
});

// --- GroupMember ---
// Tracks which users are currently in the secure group.
const groupMemberSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  addedAt: { type: Date, default: Date.now }
});

// --- RevokedCert ---
// Certificate Revocation List. When a user is removed from the group,
// their cert serial is added here so they can no longer receive encrypted keys.
const revokedCertSchema = new mongoose.Schema({
  serial:    { type: String, required: true, unique: true },
  revokedAt: { type: Date,   default: Date.now }
});

const User        = mongoose.model('User',        userSchema);
const Post        = mongoose.model('Post',        postSchema);
const GroupMember = mongoose.model('GroupMember', groupMemberSchema);
const RevokedCert = mongoose.model('RevokedCert', revokedCertSchema);

module.exports = { User, Post, GroupMember, RevokedCert };
