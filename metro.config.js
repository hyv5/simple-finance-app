/**
 * Metro configuration for React Native / Expo
 * https://facebook.github.io/metro/docs/configuration
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const ciStubsDir = path.resolve(projectRoot, 'ci-stubs');

const config = getDefaultConfig(projectRoot);

if (fs.existsSync(ciStubsDir)) {
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native-kline-view') {
      const stubPath = path.join(ciStubsDir, 'react-native-kline-view', 'index.js');
      if (fs.existsSync(stubPath)) {
        return {
          filePath: stubPath,
          type: 'sourceFile',
        };
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
