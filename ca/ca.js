const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// The CA's root key pair and certificate — generated once on first startup
let caKeys = null;
let caCert = null;

const KEYS_FILE = path.join(__dirname, 'ca-keys.json');

// Initialise the CA: load existing keys from disk, or generate new ones on first run
function initCA() {
  if (fs.existsSync(KEYS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    caKeys = {
      privateKey: forge.pki.privateKeyFromPem(saved.privateKeyPem),
      publicKey:  forge.pki.publicKeyFromPem(saved.publicKeyPem)
    };
    caCert = forge.pki.certificateFromPem(saved.certPem);
  } else {
    // First run — generate RSA-2048 root key pair
    caKeys = forge.pki.rsa.generateKeyPair(2048);

    // Create a self-signed X.509 root certificate valid for 10 years
    caCert = forge.pki.createCertificate();
    caCert.publicKey = caKeys.publicKey;
    caCert.serialNumber = '01';
    caCert.validity.notBefore = new Date();
    caCert.validity.notAfter  = new Date();
    caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);
    caCert.setSubject([{ name: 'commonName', value: 'BlogBarCA' }]);
    caCert.setIssuer([{ name: 'commonName', value: 'BlogBarCA' }]);
    caCert.sign(caKeys.privateKey, forge.md.sha256.create());

    // Persist to disk so the same CA is reused across server restarts
    fs.writeFileSync(KEYS_FILE, JSON.stringify({
      privateKeyPem: forge.pki.privateKeyToPem(caKeys.privateKey),
      publicKeyPem:  forge.pki.publicKeyToPem(caKeys.publicKey),
      certPem:       forge.pki.certificateToPem(caCert)
    }));
  }
  console.log('CA initialised');
}

// Sign a user's public key and return a signed X.509 certificate (valid 1 year)
function signCertificate(username, publicKeyPem) {
  const userPublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  // Random 16-byte hex serial — used in the CRL to revoke this cert later
  const serial = forge.util.bytesToHex(forge.random.getBytesSync(16));

  const cert = forge.pki.createCertificate();
  cert.publicKey    = userPublicKey;
  cert.serialNumber = serial;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter  = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  cert.setSubject([{ name: 'commonName', value: username }]);
  cert.setIssuer(caCert.subject.attributes); // issued by this CA

  cert.sign(caKeys.privateKey, forge.md.sha256.create());

  return {
    certPem: forge.pki.certificateToPem(cert),
    serial
  };
}

// Validate a certificate: check expiry, CRL, and CA signature
function validateCertificate(certPem, revokedSerials = []) {
  const cert = forge.pki.certificateFromPem(certPem);

  // Check certificate has not expired
  const now = new Date();
  if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
    return { valid: false, reason: 'Certificate expired' };
  }

  // Check serial is not on the revocation list
  if (revokedSerials.includes(cert.serialNumber)) {
    return { valid: false, reason: 'Certificate revoked' };
  }

  // Verify the CA's signature on this certificate
  try {
    const verified = caCert.verify(cert);
    if (!verified) return { valid: false, reason: 'Invalid signature' };
  } catch {
    return { valid: false, reason: 'Signature verification failed' };
  }

  return { valid: true };
}

// Return the CA's own certificate in PEM format — sent to clients on registration/login
function getCACertPem() {
  return forge.pki.certificateToPem(caCert);
}

module.exports = { initCA, signCertificate, validateCertificate, getCACertPem };
