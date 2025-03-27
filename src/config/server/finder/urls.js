import REQUEST_TYPES from '../constants';

export default {
  getProspectFields: {
    type: REQUEST_TYPES.GET,
    path: () => 'fields?includeDefaults=false',
    error: 'Error in getting prospect fields.',
  },

  saveProspectFields: {
    type: REQUEST_TYPES.POST,
    path: (stepId) => {
      let path = `contacts/sequence/${stepId}`;
      if (stepId === undefined) {
        path = 'contacts/import';
      }
      return path;
    },
    error: 'Error in saving prospect',
  },

  getProspectSequences: {
    type: REQUEST_TYPES.GET,
    path: () => 'sequences/steps/list',
    error: 'Error in getting prospect sequence',
  },

  findProspectEmails: {
    type: REQUEST_TYPES.POST,
    path: () => '',
    error: 'Error in finding the email address',
  },

  authenticateUser: {
    type: REQUEST_TYPES.POST,
    path: () => 'auth/login',
    error: 'Error in authenticating the user',
  },
};
