import { EnvironmentConfig } from './index';

const config: EnvironmentConfig = {
  apiUrl: 'http://localhost:3001',
  gatewayUrl: 'http://localhost:3000',
  formreadyUrl: 'http://localhost:3000', // FormReady runs on port 3000 (Nuxt default)
  authDisabled: true, // Auth typically disabled for local dev
};

export default config;