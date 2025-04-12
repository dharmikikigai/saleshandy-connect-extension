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

  // to get the leads data based on linkedin urls
  async getProspects(payload) {
    try {
      return (await this.req.post(URLs.getProspects.path(), payload)).data;
    } catch (e) {
      console.log(URLs.getProspects.error, e);
    }
  }

  // to reveal the leads in bulk
  async bulkRevealProspects(payload) {
    try {
      return (await this.req.post(URLs.bulkRevealProspects.path(), payload))
        .data;
    } catch (e) {
      console.log(URLs.bulkRevealProspects.error, e);
    }
  }

  // to reveal single prospect
  async revealProspect(payload) {
    try {
      return (await this.req.post(URLs.revealProspect.path(), payload)).data;
    } catch (e) {
      console.log(URLs.revealProspect.error, e);
    }
  }

  // to get the lead status
  async leadStatus(payload) {
    try {
      return (await this.req.post(URLs.leadStatus.path(), payload)).data;
    } catch (e) {
      console.log(URLs.leadStatus.error, e);
    }
  }

  async getTags() {
    try {
      return (await this.req.get(URLs.getTags.path())).data;
    } catch (e) {
      console.log(URLs.getTags.error, e);
    }
  }

  async getSequences(clientIds) {
    try {
      return (await this.req.get(URLs.getSequences.path(clientIds))).data;
    } catch (e) {
      console.log(URLs.getSequences.error, e);
    }
  }

  async getAgencyClients() {
    try {
      return (await this.req.get(URLs.getAgencyClients.path())).data;
    } catch (e) {
      console.log(URLs.getAgencyClients.error, e);
    }
  }
}

const prospectsInstance = new Prospects();

export default prospectsInstance;
