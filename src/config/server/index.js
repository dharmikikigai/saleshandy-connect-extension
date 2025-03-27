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
      const storage = await chrome.storage.local.get(['authToken']);
      // eslint-disable-next-line no-param-reassign
      config.headers.authorization = `Bearer ${storage.authToken}`;

      // eslint-disable-next-line no-param-reassign
      config.headers.Source = 'open-api';
      return config;
    });
  }
}

export default Server;
