import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vdomov.app',
  appName: 'vdomov',
  webDir: 'public',
  server: {
    url: 'https://vdomov.com',
    cleartext: true
  }
};

export default config;
