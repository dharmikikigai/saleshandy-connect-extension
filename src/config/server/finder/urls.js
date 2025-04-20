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

  getProspects: {
    type: REQUEST_TYPES.POST,
    path: () => 'chrome-extension/search',
    error: 'Error in fetching the leads',
  },

  bulkRevealProspects: {
    type: REQUEST_TYPES.POST,
    path: () => 'chrome-extension/bulk-reveal',
    error: 'Error in revealing the leads',
  },

  revealProspect: {
    type: REQUEST_TYPES.POST,
    path: () => 'chrome-extension/reveal',
    error: 'Error in revealing the lead',
  },

  leadStatus: {
    type: REQUEST_TYPES.POST,
    path: () => 'chrome-extension/status',
    error: 'Error in updating the lead status',
  },

  getTags: {
    type: REQUEST_TYPES.GET,
    path: () => 'lead-finder/tags',
    error: 'Error in getting the tags',
  },

  getSequences: {
    type: REQUEST_TYPES.GET,
    path: (clientIds) => {
      let path = 'chrome-extension/sequences/list';
      if (clientIds) {
        path += `?clientIds=${clientIds}`;
      }
      return path;
    },
    error: 'Error in getting the sequences',
  },

  getAgencyClients: {
    type: REQUEST_TYPES.GET,
    path: () => 'client/list',
    error: 'Error in getting the agency clients',
  },

  saveTags: {
    type: REQUEST_TYPES.POST,
    path: () => 'lead-finder/tag/assign',
    error: 'Error in saving the tags',
  },

  saveTagsForBulkLeads: {
    type: REQUEST_TYPES.POST,
    path: () => 'lead-finder/tag/bulk-assign',
    error: 'Error in saving the tags',
  },

  getSavedLeads: {
    type: REQUEST_TYPES.GET,
    path: ({ start, take, tags, createdDate }) => {
      let path = 'chrome-extension/saved-profiles';
      path += `?start=${start}&take=${take}`;
      if (tags) {
        path += `&tags=${tags}`;
      }
      if (createdDate) {
        path += `&createdDate=${createdDate}`;
      }
      return path;
    },
    error: 'Error in getting the saved leads',
  },

  addToSequence: {
    type: REQUEST_TYPES.POST,
    path: () => 'lead-finder/leads/bulk-actions/add-to-sequence',
    error: 'Error in adding the lead to the sequence',
  },

  bulkAddToSequence: {
    type: REQUEST_TYPES.POST,
    path: () => 'lead-finder/leads/bulk-actions/saved-add-to-sequence',
    error: 'Error in adding the leads to the sequence',
  },

  bulkSaveTags: {
    type: REQUEST_TYPES.POST,
    path: () => 'lead-finder/tag/bulk-assign',
    error: 'Error in adding the tags to the leads',
  },
};
