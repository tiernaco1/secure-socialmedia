const forge = require('node-forge');

// The CA's root key pair and certificate — generated once on first startup
let caKeys = null;
let caCert = null;

// Initialise the CA: generate or load root key pair and self-signed certificate
function initCA() {
  // TODO: generate RSA-2048 root key pair
  // TODO: create self-signed X.509 root certificate
  // TODO: persist to disk so the same CA is used across restarts
}

// Sign a user's public key and return a signed X.509 certificate
function signCertificate(username, publicKeyPem) {
  // TODO: create X.509 cert binding username -> publicKey
  // TODO: sign it with the CA's private key
  // TODO: return the PEM-encoded certificate
}

// Validate a certificate against the CA's public key and the CRL
function validateCertificate(certPem, revokedSerials) {
  // TODO: verify signature using CA public key
  // TODO: check cert is not expired
  // TODO: check serial is not in revokedSerials
}

module.exports = { initCA, signCertificate, validateCertificate };
