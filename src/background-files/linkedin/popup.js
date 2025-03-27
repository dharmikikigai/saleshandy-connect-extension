/* global chrome */
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (
      details.url.indexOf('sales-api') > 0 ||
      details.url.indexOf('voyager/api/') > 0
    ) {
      for (let i = 0; i < details.requestHeaders.length; i++) {
        if (details.requestHeaders[i].name.toLowerCase() === 'csrf-token') {
          chrome.storage.local.set({
            csrfToken: details.requestHeaders[i].value,
          });
        }
      }
    }
    return {
      requestHeaders: details.requestHeaders,
    };
  },
  {
    urls: ['*://*.linkedin.com/*', '*://linkedin.com/*'],
  },
  ['requestHeaders'],
);
