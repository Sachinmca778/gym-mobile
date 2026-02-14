// Polyfills for React Native
// This file should be imported at the very top of your app

// Set up global Buffer using the buffer package
const { Buffer } = require('buffer');

// Set up global Buffer
global.Buffer = Buffer;

// Set up global process with minimal properties
global.process = global.process || {
  env: {},
  version: '',
  platform: 'react-native',
  cwd: () => '/',
  nextTick: (fn) => setTimeout(fn, 0),
};

// Set up global location (for some libraries that check window.location)
if (typeof global.location === 'undefined') {
  global.location = {
    href: '',
    protocol: 'https:',
    host: '',
    hostname: '',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    origin: '',
  };
}

// Set up AbortController if not available
if (typeof global.AbortController === 'undefined') {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = { aborted: false };
    }
    abort() {
      this.signal.aborted = true;
    }
  };
}

// ============================================================
// localStorage Polyfill for React Native
// This provides a localStorage-like API using AsyncStorage
// On web, it uses the native localStorage
// ============================================================

// Synchronous in-memory storage (works immediately)
const memoryStorage = {};

// Flag to track if we're on web
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Initialize memory storage with persisted data
const initMemoryStorage = async () => {
  if (isWeb) {
    // On web, sync from localStorage
    try {
      const keys = ['accessToken', 'refreshToken', 'userRole', 'username', 'userId', 'gymId', 'memberId'];
      keys.forEach(key => {
        try {
          const value = window.localStorage.getItem(key);
          if (value !== null) {
            memoryStorage[key] = value;
          }
        } catch (e) {
          // Ignore
        }
      });
    } catch (e) {
      console.warn('Failed to sync from web localStorage:', e);
    }
    return;
  }

  // On React Native, sync from AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const keys = ['accessToken', 'refreshToken', 'userRole', 'username', 'userId', 'gymId', 'memberId'];
    
    try {
      const allValues = await AsyncStorage.multiGet(keys);
      allValues.forEach(([key, value]) => {
        if (value !== null) {
          memoryStorage[key] = value;
        }
      });
    } catch (multiError) {
      // Fallback to individual gets
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            memoryStorage[key] = value;
          }
        } catch (e) {
          // Ignore individual key errors
        }
      }
    }
  } catch (e) {
    console.warn('AsyncStorage not available, using memory storage only:', e);
  }
};

// Run initialization immediately
initMemoryStorage();

// Create localStorage polyfill that works synchronously
const createLocalStoragePolyfill = () => {
  // If we're on web, return native localStorage
  if (isWeb) {
    return window.localStorage;
  }

  // Create a synchronous polyfill for React Native
  const localStoragePolyfill = {
    getItem: (key) => {
      // Return from memory storage
      if (memoryStorage.hasOwnProperty(key)) {
        return memoryStorage[key];
      }
      return null;
    },

    setItem: (key, value) => {
      // Store in memory
      memoryStorage[key] = value;

      // Persist to AsyncStorage (async, but we return immediately)
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.setItem(key, value).catch(e => {
          console.warn('Failed to persist to AsyncStorage:', e);
        });
      } catch (e) {
        // AsyncStorage not available
      }
    },

    removeItem: (key) => {
      delete memoryStorage[key];

      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.removeItem(key).catch(e => {
          console.warn('Failed to remove from AsyncStorage:', e);
        });
      } catch (e) {
        // AsyncStorage not available
      }
    },

    clear: () => {
      // Clear memory
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);

      // Clear from AsyncStorage
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const keys = ['accessToken', 'refreshToken', 'userRole', 'username', 'userId', 'gymId', 'memberId'];
        AsyncStorage.multiRemove(keys).catch(e => {
          console.warn('Failed to clear AsyncStorage:', e);
        });
      } catch (e) {
        // AsyncStorage not available
      }
    },

    get length() {
      return Object.keys(memoryStorage).length;
    },

    key: (index) => {
      const keys = Object.keys(memoryStorage);
      return keys[index] || null;
    }
  };

  return localStoragePolyfill;
};

// Set global localStorage
if (typeof global !== 'undefined') {
  global.localStorage = createLocalStoragePolyfill();
  
  // Also set window.localStorage for consistency
  if (typeof window !== 'undefined') {
    window.localStorage = global.localStorage;
  }
}

