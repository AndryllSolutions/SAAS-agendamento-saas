module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './',
          '@types': './types',
          '@services': './services',
          '@store': './store',
          '@screens': './screens',
          '@components': './components',
          '@navigation': './navigation',
          '@utils': './utils',
          '@hooks': './hooks',
        },
      },
    ],
  ],
};
