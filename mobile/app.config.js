module.exports = ({ config }) => ({
  ...config,
  name: 'F-Insight',
  slug: 'finsight-mobile',
  version: '1.0.3',
  orientation: 'portrait',
  scheme: 'finsight',
  userInterfaceStyle: 'dark',
  platforms: ['android'],
  newArchEnabled: true,
  icon: './assets/icon.png',
  updates: {
    enabled: false
  },
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#020617'
  },
  android: {
    package: 'br.com.finsight.app',
    versionCode: 4,
    icon: './assets/icon.png',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/monochrome-icon.png',
      backgroundColor: '#020617'
    },
    permissions: ['INTERNET'],
    edgeToEdgeEnabled: true
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://f-insight-api.onrender.com',
    webUrl: process.env.EXPO_PUBLIC_WEB_URL || 'https://f-insight.netlify.app',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || undefined
    }
  }
});
