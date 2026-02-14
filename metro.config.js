// Metro configuration for Expo
// Fix for axios crypto import error in React Native

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver configurations for packages that need polyfills
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Create a crypto shim that provides minimal crypto for React Native
const cryptoShimPath = path.resolve(__dirname, 'src/utils/cryptoShim.js');

// Provide browser-compatible polyfills for Node modules that axios needs
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'crypto': cryptoShimPath,
  'stream': require.resolve('readable-stream'),
  'buffer': require.resolve('buffer'),
  'events': require.resolve('events'),
  'util': require.resolve('util'),
};

// Configure module aliases - redirect problematic imports
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': cryptoShimPath,
};

// Configure main fields to prefer browser export
config.resolver.mainFields = [
  'browser:main',
  'main',
  'module'
];

module.exports = config;

