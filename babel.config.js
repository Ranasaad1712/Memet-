// babel.config.js
// Required by Metro/Expo to transpile JSX + modern JS. Without this file,
// `expo start` will fail to bundle the app at all.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
