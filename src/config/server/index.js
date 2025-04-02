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
      chrome.storage.local.get(['authToken'], async (res) => {
        const authenticationToken = res.authToken;
        // eslint-disable-next-line no-param-reassign
        config.headers.authorization = `Bearer ${authenticationToken}`;

        // eslint-disable-next-line no-param-reassign
        config.headers.Source = 'open-api';
        console.log('token fetched');
        return config;
      });
    });
  }
}

export default Server;
