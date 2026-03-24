import forge from 'node-forge';

// Generate an RSA-2048 key pair for a new user.
// Takes ~1-2 seconds in the browser — show a loading state while this runs.
export function generateKeyPair() {
  const keyPair = forge.pki.rsa.generateKeyPair(2048);
  return {
    publicKeyPem:  forge.pki.publicKeyToPem(keyPair.publicKey),
    privateKeyPem: forge.pki.privateKeyToPem(keyPair.privateKey)
  };
}

// Store the private key in localStorage — it never leaves the browser.
export function storePrivateKey(username, privateKeyPem) {
  localStorage.setItem(`blogbar_privkey_${username}`, privateKeyPem);
}

// Retrieve the private key from localStorage for the given user.
export function getPrivateKey(username) {
  return localStorage.getItem(`blogbar_privkey_${username}`);
}

// Validate a certificate against the CA cert and the Certificate Revocation List.
// Returns { valid: true } or { valid: false, reason: '...' }
export function validateCertificate(certPem, caCertPem, revokedSerials = []) {
  try {
    const cert   = forge.pki.certificateFromPem(certPem);
    const caCert = forge.pki.certificateFromPem(caCertPem);

    // Check the certificate has not expired
    const now = new Date();
    if (now > cert.validity.notAfter) {
      return { valid: false, reason: 'Certificate expired' };
    }

    // Check the serial is not on the revocation list
    if (revokedSerials.includes(cert.serialNumber)) {
      return { valid: false, reason: 'Certificate revoked' };
    }

    // Verify the CA's signature on the certificate
    if (!caCert.verify(cert)) {
      return { valid: false, reason: 'Invalid CA signature' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Certificate parse error' };
  }
}

// Encrypt a plaintext message using hybrid encryption:
//   1. Generate a random AES-256-GCM session key
//   2. Encrypt the message body with AES-256-GCM
//   3. Wrap the AES key once per group member using their RSA public key
//
// members      = [{ userId, certificate }] from GET /api/group/members
// caCertPem    = CA cert string from localStorage (blogbar_caCertificate)
// revokedSerials = string[] from GET /api/group/members
//
// Returns { ciphertext, iv, tag, encryptedKeys: [{ userId, encryptedSessionKey }] }
export function encryptMessage(plaintext, members, caCertPem, revokedSerials = []) {
  // Generate a random 32-byte AES session key and 12-byte IV (nonce for GCM)
  const aesKey = forge.random.getBytesSync(32);
  const iv     = forge.random.getBytesSync(12);

  // Encrypt the plaintext with AES-256-GCM (authenticated encryption)
  const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
  cipher.start({ iv, tagLength: 128 });
  cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
  cipher.finish();

  const ciphertext = forge.util.encode64(cipher.output.bytes());
  const tag        = forge.util.encode64(cipher.mode.tag.bytes());
  const ivB64      = forge.util.encode64(iv);

  // Wrap the AES key with each valid group member's RSA public key
  const encryptedKeys = [];
  for (const member of members) {
    const result = validateCertificate(member.certificate, caCertPem, revokedSerials);
    if (!result.valid) continue; // skip revoked or invalid members

    const memberCert = forge.pki.certificateFromPem(member.certificate);
    // RSA-OAEP encrypt the raw AES key bytes
    const encryptedSessionKey = forge.util.encode64(
      memberCert.publicKey.encrypt(aesKey, 'RSA-OAEP')
    );
    encryptedKeys.push({ userId: member.userId, encryptedSessionKey });
  }

  return { ciphertext, iv: ivB64, tag, encryptedKeys };
}

// Decrypt a post using the current user's RSA private key:
//   1. Find the encrypted session key blob addressed to this user
//   2. RSA-OAEP decrypt the AES session key
//   3. AES-256-GCM decrypt the ciphertext
//
// Returns the plaintext string, or null if no key blob found (non-member)
export function decryptMessage(post, myUserId, privateKeyPem) {
  const blob = post.encryptedKeys.find(k => String(k.userId) === String(myUserId));
  if (!blob) return null; // user is not in the group — show ciphertext

  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

  // RSA-OAEP decrypt the session key
  const aesKey = privateKey.decrypt(forge.util.decode64(blob.encryptedSessionKey), 'RSA-OAEP');

  // AES-256-GCM decrypt the message body
  const decipher = forge.cipher.createDecipher('AES-GCM', aesKey);
  decipher.start({
    iv:        forge.util.decode64(post.iv),
    tag:       forge.util.createBuffer(forge.util.decode64(post.tag)),
    tagLength: 128
  });
  decipher.update(forge.util.createBuffer(forge.util.decode64(post.ciphertext)));
  const pass = decipher.finish(); // returns false if auth tag check fails

  if (!pass) return null; // tampered or corrupted message
  return decipher.output.toString('utf8');
}
