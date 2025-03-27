/* global chrome */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.method === 'getPersonData') {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', message.url);
    if (message.tk) {
      xhr.setRequestHeader('csrf-token', message.tk);
    }
    xhr.setRequestHeader('x-restli-protocol-version', '2.0.0');
    xhr.onload = function () {
      sendResponse({ data: xhr.responseText, method: 'getPersonData' });
    };
    xhr.send(null);
    return true;
  }
  return true;
});
