import REQUEST_TYPES from '../constants';

export default {
  updateMailboxSetting: {
    type: REQUEST_TYPES.PATCH,
    path: (mailboxId) => `mailboxes/${mailboxId}`,
    error: 'Error in updating the mailbox setting',
  },

  updateNotificationSetting: {
    type: REQUEST_TYPES.PATCH,
    path: () => `user/settings`,
    error: 'Error in updating the notification setting',
  },

  fetchMailboxSetting: {
    type: REQUEST_TYPES.POST,
    path: () => 'mailboxes',
    error: 'Error in fetching the mailbox setting',
  },

  fetchNotificationSetting: {
    type: REQUEST_TYPES.GET,
    path: () => 'user/settings?code[]=desktop_notification',
    error: 'Error in fetching the notification setting',
  },

  deleteEmail: {
    type: REQUEST_TYPES.DELETE,
    path: (emailId) => `mailboxes/emails/${emailId}`,
    error: 'Error in deleting the email',
  },

  fetchingTrackableData: {
    type: REQUEST_TYPES.POST,
    path: (mailboxId) => `mailboxes/${mailboxId}/emails/track`,
    error: 'Error in preparing the content trackable',
  },

  updateEmail: {
    type: REQUEST_TYPES.PATCH,
    path: (emailId) => `mailboxes/emails/update-message/${emailId}`,
    error: 'Error in updating the email',
  },
};
