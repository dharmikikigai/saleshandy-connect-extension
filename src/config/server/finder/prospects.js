/* eslint-disable consistent-return */
import Server from '../index';
import URLs from './urls';

class Prospects extends Server {
  async getProspectsFields() {
    try {
      return (await this.req.get(URLs.getProspectFields.path())).data;
    } catch (e) {
      console.log(URLs.getProspectFields.error, e);
    }
  }

  async saveProspect(payload, stepId) {
    try {
      return (
        await this.req.post(URLs.saveProspectFields.path(stepId), payload)
      ).data;
    } catch (e) {
      console.log(URLs.saveProspectFields.error, e);
    }
  }

  async getProspectSequence() {
    try {
      return (await this.req.get(URLs.getProspectSequences.path())).data;
    } catch (e) {
      console.log(URLs.getProspectSequences.error, e);
      return {
        payload: {
          code: e?.response?.data?.code,
          message: e?.response?.data?.message,
        },
      };
    }
  }

  // todo-dharmik : move this function to auth class (new class)
  async authenticateUser(payload) {
    try {
      return (await this.req.post(URLs.authenticateUser.path(), payload)).data;
    } catch (e) {
      console.log(URLs.authenticateUser.error, e);
    }
  }
}

const prospectsInstance = new Prospects();

export default prospectsInstance;
