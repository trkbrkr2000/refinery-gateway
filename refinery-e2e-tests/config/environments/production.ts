import { EnvironmentConfig } from './index';

const config: EnvironmentConfig = {
  apiUrl: process.env.PROD_API_URL || 'https://api.refinery.example.com',
  gatewayUrl: process.env.PROD_GATEWAY_URL || 'https://gateway.refinery.example.com',
  formreadyUrl: process.env.PROD_FORMREADY_URL || 'https://formready.example.com',
  authDisabled: false,
};

export default config;