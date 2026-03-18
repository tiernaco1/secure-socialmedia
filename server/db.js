const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/app.db'));

// Users: stores username, hashed password, and their public certificate
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    certificate TEXT NOT NULL
  )
`);

// Posts: stores encrypted message body and the per-member encrypted session keys
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    ciphertext TEXT NOT NULL,
    encrypted_keys TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )
`);

// Group members: which users are currently in the secure group
db.exec(`
  CREATE TABLE IF NOT EXISTS group_members (
    user_id INTEGER PRIMARY KEY,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Certificate Revocation List: certificates of removed users
db.exec(`
  CREATE TABLE IF NOT EXISTS revocation_list (
    serial TEXT PRIMARY KEY,
    revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
