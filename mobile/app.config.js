module.exports = ({ config }) => ({
  ...config,
  name: 'F-Insight',
  slug: 'finsight-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'finsight',
  userInterfaceStyle: 'dark',
  platforms: ['android'],
  newArchEnabled: true,
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#020617'
  },
  android: {
    package: 'br.com.finsight.app',
    versionCode: 1,
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
