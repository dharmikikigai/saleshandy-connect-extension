import axios from 'axios';
import envConfig from '../env/index';

class FinderServer {
  constructor() {
    this.req = axios.create({
      baseURL: envConfig.EMAIL_FINDER,
      timeout: 10000,
    });
  }
}

export default FinderServer;
