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
