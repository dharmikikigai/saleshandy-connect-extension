import axios from 'axios';
import envConfig from '../env/index';

class Server {
  constructor() {
    this.req = axios.create({
      baseURL: envConfig.BASE_URL,
      timeout: 10000,
    });

    this.setRequestInterceptors();
  }

  setRequestInterceptors() {
    this.req.interceptors.request.use(async (config) => {
      const element = document.getElementById('react-root');

      let authenticationToken = element?.getAttribute('authToken');

      authenticationToken = authenticationToken?.replace(/"/g, '');

      // eslint-disable-next-line no-param-reassign
      config.headers.authorization = `Bearer ${authenticationToken}`;

      // eslint-disable-next-line no-param-reassign
      config.headers.Source = 'open-api';
      return config;
    });
  }
}

export default Server;
