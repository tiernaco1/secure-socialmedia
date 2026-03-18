// app.js — UI logic: calls the API and delegates crypto to crypto.js

const API = 'http://localhost:3000/api';

// Register: generate key pair, send public key to server, receive signed certificate
async function register() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  // TODO: call generateKeyPair()
  // TODO: POST /api/auth/register with { username, password, publicKey }
  // TODO: store private key in localStorage (temporary) / IndexedDB (secure)
  // TODO: store returned certificate
}

// Login: authenticate and retrieve certificate from server
async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  // TODO: POST /api/auth/login
  // TODO: on success, show wall section and load posts
}

// Post a message: encrypt for all group members, send to server
async function postMessage() {
  const plaintext = document.getElementById('message-input').value;
  // TODO: GET /api/group/members to fetch current member certificates
  // TODO: validate each certificate (call validateCertificate from crypto.js)
  // TODO: call encryptMessage(plaintext, memberCertificates)
  // TODO: POST /api/posts with { ciphertext, encryptedKeys }
  // TODO: refresh feed
}

// Load and display all posts from the server
async function loadFeed() {
  // TODO: GET /api/posts
  // TODO: for each post, attempt decryptMessage()
  // TODO: if decryption succeeds, display plaintext; otherwise display ciphertext
}
