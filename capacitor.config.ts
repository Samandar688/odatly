import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.odatly.app',
  appName: 'Odatly',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
