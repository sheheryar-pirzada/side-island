const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Add parent directories to watchFolders so Metro can resolve file: dependencies
const monorepoRoot = path.resolve(projectRoot, "../..");
config.watchFolders = [monorepoRoot];

// Critical for symlinked local packages:
// - Prevent Metro from walking up to the monorepo root and accidentally loading a *different* copy
//   of react/react-native/reanimated from ../../node_modules (causes Reanimated runtime crashes like _toString).
config.resolver.disableHierarchicalLookup = true;

// Resolve all dependencies from the Expo app’s node_modules only.
// Also include nested node_modules that npm may keep un-hoisted (e.g. semver under reanimated).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules/react-native/node_modules"),
  path.resolve(projectRoot, "node_modules/react-native-reanimated/node_modules"),
];

// Force peer deps used by the library to come from the app (singletons).
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "react-native-reanimated": path.resolve(projectRoot, "node_modules/react-native-reanimated"),
  "@shopify/react-native-skia": path.resolve(projectRoot, "node_modules/@shopify/react-native-skia"),
  // React Native 0.81+ expects this package; npm may not hoist it to the root.
  "@react-native/virtualized-lists": path.resolve(
    projectRoot,
    "node_modules/react-native/node_modules/@react-native/virtualized-lists"
  ),
};

module.exports = config;
