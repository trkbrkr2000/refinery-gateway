import local from './local';
import staging from './staging';
import production from './production';

export type Environment = 'local' | 'staging' | 'production';

export interface EnvironmentConfig {
  apiUrl: string;
  gatewayUrl: string;
  formreadyUrl: string;
  authDisabled?: boolean;
}

const environments = {
  local,
  staging,
  production,
};

const env = (process.env.TEST_ENV || 'local') as Environment;

export const config: EnvironmentConfig = environments[env];
export { local, staging, production };