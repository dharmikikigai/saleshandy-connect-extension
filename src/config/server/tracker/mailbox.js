/* eslint-disable consistent-return */
import Server from '../index';
import URLs from './urls';

class Mailbox extends Server {
  async fetchingMailboxSetting(payload) {
    try {
      return (await this.req.post(URLs.fetchMailboxSetting.path(), payload))
        .data;
    } catch (e) {
      console.log(URLs.fetchMailboxSetting.error, e);
    }
  }

  async fetchNotificationSetting() {
    try {
      return (await this.req.get(URLs.fetchNotificationSetting.path())).data;
    } catch (e) {
      console.log(URLs.fetchNotificationSetting.error, e);
    }
  }

  async updateMailboxSetting(payload, mailboxId) {
    try {
      return (
        await this.req.patch(URLs.updateMailboxSetting.path(mailboxId), payload)
      ).data;
    } catch (e) {
      console.log(URLs.updateMailboxSetting.error, e);
    }
  }

  async updateMailboxesSetting(payload) {
    try {
      return (await this.req.post(URLs.updateMailboxesSetting.path(), payload))
        .data;
    } catch (e) {
      console.log(URLs.updateMailboxesSetting.error, e);
    }
  }

  async getMailboxesSetting() {
    try {
      return (await this.req.get(URLs.getMailboxesSetting.path())).data;
    } catch (e) {
      console.log(URLs.getMailboxesSetting.error, e);
    }
  }

  async updateNotificationSetting(payload) {
    try {
      return (
        await this.req.patch(URLs.updateNotificationSetting.path(), payload)
      ).data;
    } catch (e) {
      console.log(URLs.updateNotificationSetting.error, e);
    }
  }

  async deleteEmail(emailId) {
    try {
      return (await this.req.delete(URLs.deleteEmail.path(emailId))).data;
    } catch (e) {
      console.log(URLs.deleteEmail.error, e);
    }
  }

  async fetchingTrackableData(payload, mailboxId) {
    try {
      return (
        await this.req.post(URLs.fetchingTrackableData.path(mailboxId), payload)
      ).data;
    } catch (e) {
      console.log(URLs.fetchingTrackableData.error, e);
    }
  }

  async updatingEmail(payload, emailId) {
    try {
      return (await this.req.patch(URLs.updateEmail.path(emailId), payload))
        .data;
    } catch (e) {
      console.log(URLs.updateEmail.error, e);
    }
  }

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
