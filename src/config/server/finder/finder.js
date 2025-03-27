/* eslint-disable consistent-return */
import FinderServer from '../finderServer';
import URLs from './urls';

class Finder extends FinderServer {
  async findProspectEmails(payload) {
    try {
      return (await this.req.post(URLs.findProspectEmails.path(), payload))
        .data;
    } catch (e) {
      console.log(URLs.findProspectEmails.error, e);
    }
  }
}

const finderInstance = new Finder();

export default finderInstance;
