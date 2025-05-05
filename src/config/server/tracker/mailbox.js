/* eslint-disable consistent-return */
import Server from '../index';
import URLs from './urls';

class Mailbox extends Server {
  async getMetaData() {
    try {
      return (await this.req.get(URLs.fetchMetaData.path())).data;
    } catch (e) {
      console.log(URLs.fetchMetaData.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }
}

const mailboxInstance = new Mailbox();
export default mailboxInstance;
