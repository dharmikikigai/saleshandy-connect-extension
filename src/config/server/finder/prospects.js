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

  // to get the leads data based on linkedin urls
  async getProspects(payload) {
    try {
      return (await this.req.post(URLs.getProspects.path(), payload)).data;
    } catch (e) {
      console.log(URLs.getProspects.error, e);
      return e?.response?.data;
    }
  }

  // to reveal the leads in bulk
  async bulkRevealProspects(payload) {
    try {
      return (await this.req.post(URLs.bulkRevealProspects.path(), payload))
        .data;
    } catch (e) {
      console.log(URLs.bulkRevealProspects.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }

  // to reveal single prospect
  async revealProspect(payload) {
    try {
      return (await this.req.post(URLs.revealProspect.path(), payload)).data;
    } catch (e) {
      console.log(URLs.revealProspect.error, e);
      return {
        error: e?.response?.data,
      };
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

  async saveTags(payload) {
    try {
      return (await this.req.post(URLs.saveTags.path(), payload)).data;
    } catch (e) {
      console.log(URLs.saveTags.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }

  async getSavedLeads(payload) {
    try {
      return (await this.req.get(URLs.getSavedLeads.path(payload))).data;
    } catch (e) {
      console.log(URLs.getSavedLeads.error, e);
    }
  }

  async singleAddToSequence(leadId, payload) {
    try {
      return (
        await this.req.post(URLs.singleAddToSequence.path(leadId), payload)
      ).data;
    } catch (e) {
      console.log(URLs.singleAddToSequence.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }

  async addToSequence(payload) {
    try {
      return (await this.req.post(URLs.addToSequence.path(), payload)).data;
    } catch (e) {
      return {
        error: e?.response?.data,
      };
    }
  }

  async bulkAddToSequence(payload) {
    try {
      return (await this.req.post(URLs.bulkAddToSequence.path(), payload)).data;
    } catch (e) {
      console.log(URLs.bulkAddToSequence.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }

  async bulkSaveTags(payload) {
    try {
      return (await this.req.post(URLs.bulkSaveTags.path(), payload)).data;
    } catch (e) {
      console.log(URLs.bulkSaveTags.error, e);
      return {
        error: e?.response?.data,
      };
    }
  }
}

const prospectsInstance = new Prospects();

export default prospectsInstance;
