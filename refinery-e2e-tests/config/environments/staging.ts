import { EnvironmentConfig } from './index';

const config: EnvironmentConfig = {
  apiUrl: process.env.STAGING_API_URL || 'https://api-staging.refinery.example.com',
  gatewayUrl: process.env.STAGING_GATEWAY_URL || 'https://gateway-staging.refinery.example.com',
  formreadyUrl: process.env.STAGING_FORMREADY_URL || 'https://staging.formready.example.com',
  authDisabled: false,
};

export default config;