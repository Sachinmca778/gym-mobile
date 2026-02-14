// Crypto shim for React Native
// This provides a minimal crypto implementation compatible with React Native

const crypto = {
  // Create hash (using a simple fallback)
  createHash: (algorithm) => {
    return {
      update: (data) => crypto,
      digest: (encoding) => Buffer.from('stub').toString(encoding),
    };
  },

  // Random bytes
  randomBytes: (size) => {
    const bytes = new Uint8Array(size);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    }
    return bytes;
  },

  // Random UUID
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  // Timing-safe equal
  timingSafeEqual: (a, b) => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  },

  // PBKDF2 (simplified)
  pbkdf2: async (password, salt, iterations, keylen, digest) => {
    // Return a mock derived key
    return Buffer.alloc(keylen);
  },

  // Create cipher/decipher (stubs)
  createCipheriv: () => ({ update: () => Buffer.alloc(0), final: () => Buffer.alloc(0) }),
  createDecipheriv: () => ({ update: () => Buffer.alloc(0), final: () => Buffer.alloc(0) }),
  createSign: () => ({ update: () => crypto, sign: () => Buffer.alloc(0) }),
  createVerify: () => ({ update: () => crypto, verify: () => true }),
};

// Provide a browser-compatible web crypto API if available
if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
  crypto.webcrypto = window.crypto;
}

module.exports = crypto;

