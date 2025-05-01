import REQUEST_TYPES from '../constants';

export default {
  fetchMetaData: {
    type: REQUEST_TYPES.GET,
    path: () => 'chrome-extension/meta',
    error: 'Error in fetching the metadata',
  },
};
