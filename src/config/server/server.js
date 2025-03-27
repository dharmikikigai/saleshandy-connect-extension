import axios from 'axios';
import envConfig from '../env/index';

class EdgeServer {
  constructor() {
    this.req = axios.create({
      baseURL: envConfig.BASE_URL,
      timeout: 10000,
    });
  }
}

export default EdgeServer;
