module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // IMPORTANT: Reanimated plugin must be listed last.
    plugins: ["react-native-worklets/plugin"],
  };
};


