import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seangritthy.tmdbvideo',
  appName: 'TMDB Video',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
