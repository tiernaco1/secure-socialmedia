// crypto.js — all cryptographic operations run client-side only
// The private key never leaves this file / the browser

// Generate an RSA-2048 key pair for a new user
async function generateKeyPair() {
  // TODO: use node-forge or Web Crypto API to generate RSA-2048 key pair
  // TODO: return { publicKeyPem, privateKeyPem }
}

// Encrypt a plaintext message using hybrid encryption:
//   1. Generate a random AES-256 session key
//   2. Encrypt the message with AES-256-GCM
//   3. Encrypt the session key with each group member's RSA public key
async function encryptMessage(plaintext, memberCertificates) {
  // TODO: generate random AES-256 session key
  // TODO: AES-GCM encrypt plaintext -> { ciphertext, iv, authTag }
  // TODO: for each member cert: RSA-encrypt session key -> encryptedKeys[]
  // TODO: return { ciphertext, encryptedKeys: [{ userId, encryptedSessionKey }] }
}

// Decrypt a post using the current user's private key:
//   1. Find the encrypted session key blob for this user
//   2. RSA-decrypt the session key with the private key
//   3. AES-GCM decrypt the message body
async function decryptMessage(post, myUserId, myPrivateKeyPem) {
  // TODO: find encryptedSessionKey where userId === myUserId
  // TODO: RSA-decrypt session key using myPrivateKeyPem
  // TODO: AES-GCM decrypt ciphertext -> plaintext
  // TODO: return plaintext string, or null if no key blob found (non-member)
}

// Validate a certificate against the CA public key and the CRL
function validateCertificate(certPem, caCertPem, revokedSerials) {
  // TODO: verify certificate signature using CA public key
  // TODO: check certificate is not expired
  // TODO: check serial not in revokedSerials
}
