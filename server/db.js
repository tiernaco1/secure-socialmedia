const mongoose = require('mongoose');

// Stores registered users. certSerial is used to look up revocations in the CRL.
const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  certificate:  { type: String, required: true },
  certSerial:   { type: String, required: true }
});

// encryptedKeys: [{ userId, encryptedSessionKey }] — only the matching user can unwrap their blob.
const postSchema = new mongoose.Schema({
  authorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ciphertext:    { type: String, required: true },  // AES-256-GCM encrypted message (Base64)
  iv:            { type: String, required: true },  // Base64 AES-GCM nonce (12 bytes)
  tag:           { type: String, required: true },  // Base64 AES-GCM auth tag (16 bytes)
  encryptedKeys: { type: Array,  required: true },  // [{ userId, encryptedSessionKey }]
  createdAt:     { type: Date,   default: Date.now }
});

// Tracks which users are currently in the secure group.
const groupMemberSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  addedAt: { type: Date, default: Date.now }
});

// When a user is removed, their cert serial is added here so future encryptions skip them.
const revokedCertSchema = new mongoose.Schema({
  serial:    { type: String, required: true, unique: true },
  revokedAt: { type: Date,   default: Date.now }
});

const User        = mongoose.model('User',        userSchema);
const Post        = mongoose.model('Post',        postSchema);
const GroupMember = mongoose.model('GroupMember', groupMemberSchema);
const RevokedCert = mongoose.model('RevokedCert', revokedCertSchema);

module.exports = { User, Post, GroupMember, RevokedCert };
