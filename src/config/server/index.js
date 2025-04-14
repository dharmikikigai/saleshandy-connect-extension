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
      const authenticationToken = await Server.getAuthToken(); // Use static method

      // eslint-disable-next-line no-param-reassign
      config.headers.authorization = `Bearer ${authenticationToken}`;
      // eslint-disable-next-line no-param-reassign
      config.headers['sh-application'] = 'chrome-extension';
      return config;
    });
  }

  // Static method to avoid ESLint error
  static getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['authToken'], (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Failed to retrieve authToken'));
        } else {
          resolve(response?.authToken);
        }
      });
    });
  }
}

export default Server;
