module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
        // ... other plugins
        'react-native-worklets/plugin', // Use the new plugin path
      ],
    };
  };