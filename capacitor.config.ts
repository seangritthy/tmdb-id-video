import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seangritthy.tmdbvideo',
  appName: 'TMDB Video',
  webDir: 'public',
  server: {
    url: 'https://vdomov.com',
    cleartext: true
  }
};

export default config;
