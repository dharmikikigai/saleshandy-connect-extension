import { environments as prodConfig } from './env.prod';
import { environments as stagingConfig } from './env.staging';

const environments = {
  staging: 'staging',
  master: 'production',
};

const CURRENT_ENV = environments.staging;

const ENV_CONFIG =
  CURRENT_ENV === environments.master ? prodConfig : stagingConfig;

export default ENV_CONFIG;
