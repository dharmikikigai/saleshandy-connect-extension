/* eslint-disable no-loop-func */
import io from '../gmail/socket.io';

async function getAndSetAuthToken() {
  chrome.cookies.get(
    { url: 'https://pyxis.lifeisgoodforlearner.com', name: 'token' },
    (cookie) => {
      if (cookie) {
        chrome.storage.local.set({ authToken: cookie.value });
      } else {
        chrome.storage.local.set({ authToken: '' });
      }
    },
  );
}

async function fetchAndSetActiveUrl(url) {
  if (url) {
    chrome.storage.local.set({ activeUrl: url });
  }
}

async function onBeaconClickActivity(tab) {
  await getAndSetAuthToken();

  await fetchAndSetActiveUrl(tab?.url);

  chrome.tabs.sendMessage(tab.id, { method: 'injectYTVideo' });
  chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
  chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
}

async function updateMailboxEmail(tabId) {
  chrome.tabs.sendMessage(tabId, { method: 'updateMailboxEmail' });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const currentUrl = tab.url;

    if (tab.status === 'complete') {
      if (currentUrl.includes('linkedin.com')) {
        await getAndSetAuthToken();
        await fetchAndSetActiveUrl(tab?.url);
        // Send a message to the content script to inject the beacon
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['./app.js'],
          },
          () => {
            chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
          },
        );
      }
      if (currentUrl.includes('mail.google.com')) {
        updateMailboxEmail(tab.id);
      }
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentUrl = tab.url;

  if (changeInfo.status === 'complete') {
    if (currentUrl.includes('linkedin.com')) {
      await getAndSetAuthToken();
      await fetchAndSetActiveUrl(tab?.url);
      // Send a message to the content script to inject the beacon
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['./app.js'],
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
        },
      );
    }
    if (currentUrl.includes('mail.google.com')) {
      updateMailboxEmail(tab.id);
    }
  }
});

async function openLinkedinOnInstall() {
  chrome.tabs.create(
    { url: 'https://www.linkedin.com/in/piyushnp/' },
    (newTab) => {
      // Wait for the tab to finish loading before sending a message
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          onBeaconClickActivity(newTab);
          // Remove the listener after sending the message
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    },
  );
}

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  chrome.tabs.sendMessage(details.tabId, { method: 'closeDiv' });
});

const SOCKET_DISCONNECT_REASONS = {
  PING_TIMEOUT: 'ping timeout',
  TRANSPORT_CLOSE: 'transport close',
  FORCED_CLOSE: 'forced close',
  TRANSPORT_ERROR: 'transport error',
  IO_SERVER_DISCONNECT: 'io server disconnect',
  IO_CLIENT_DISCONNECT: 'io client disconnect',
};

let objSocket;
const sourceId = {
  SALESHANDY_CONNECT: 5,
};
let sDisconnectReason = '';
let allConnectedUsers = [];
let allNotConnectedUsers = [];
let socketAuthToken;

chrome.storage.local.get(['socketAuthToken'], (req) => {
  socketAuthToken = req.socketAuthToken || '';
});

let allConnectedUserslocalStorage = [];
chrome.storage.local.get(['allConnectedUsers'], (req) => {
  allConnectedUserslocalStorage = req.allConnectedUsers
    ? req.allConnectedUser
    : [];
});

function getNotificationButtons(encUserId) {
  const notificationButtons = [];
  if (encUserId) {
    notificationButtons.push({
      title: 'Block all notifications',
      iconUrl: '../../assets/icons/block.png',
    });
  }
  return notificationButtons;
}

function displayNotification(data) {
  let ctr = new Date();
  const { title, message } = data;
  let { encUserId } = data;
  const notificationButtons = getNotificationButtons(encUserId);
  const notificationObj = {
    type: 'basic',
    title,
    message,
    iconUrl: '../../assets/icons/48_48.png',
  };

  if (notificationButtons.length > 0) {
    notificationObj.buttons = notificationButtons;
  }
  encUserId = encUserId || 'initUserId';

  chrome.notifications.create(`${encUserId}-${ctr}`, notificationObj);
  ctr++;
}

function receiveNotificationData() {
  objSocket.off('pushData');
  objSocket.on('pushData', (data) => {
    displayNotification(JSON.parse(data));
  });
}

function addUserToSocket(userId) {
  const dataToSend = {
    arrUserId: userId,
    socketAuthToken,
    sourceId: sourceId.SALESHANDY_CONNECT,
  };
  objSocket.emit('eventRegisterUsers', JSON.stringify(dataToSend));
  objSocket.off('eventRegisterUsersAck');
  objSocket.on('eventRegisterUsersAck', (data) => {
    const parsedData = JSON.parse(data);
    const { arrUsersAdded } = parsedData;

    if (arrUsersAdded.length) {
      if (allConnectedUsers.indexOf(arrUsersAdded[0]) === -1) {
        allConnectedUsers.push(arrUsersAdded[0]);
        chrome.storage.local.set({ allConnectedUsers });
      }
      receiveNotificationData();
    }
  });
}

function addRemainingUser() {
  allNotConnectedUsers.forEach((u) => addUserToSocket(u));
}

function createSocketConnection() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['socketAuthToken'], (req) => {
      socketAuthToken = req.socketAuthToken || '';
    });

    objSocket = io('https://appsocket.saleshandy.com', {
      query: `socketAuthToken=${socketAuthToken}`,
      jsonp: false,
    });

    if (Object.keys(objSocket).length === 0) {
      console.log('Socket Not Connected.');
    } else {
      console.log('Socket Already Connected.');
      objSocket.off('eventHandshake');
      objSocket.on('eventHandshake', (data) => {
        socketAuthToken = JSON.parse(data).socketAuthToken;
        chrome.storage.local.set({ socketAuthToken });
        objSocket.query = `socketAuthToken=${socketAuthToken}`;
        objSocket.io.opts.query = `socketAuthToken=${socketAuthToken}`;
        objSocket.io.engine.query.socketAuthToken = socketAuthToken;
        resolve(true);
      });
      objSocket.off('disconnect');
      objSocket.on('disconnect', (disconnectReason) => {
        allNotConnectedUsers = allConnectedUsers;
        allConnectedUsers = [];
        sDisconnectReason = disconnectReason;
        console.log(`Socket disconnected due to: ${disconnectReason}`);
      });
      objSocket.off('reconnect');
      objSocket.on('reconnect', () => {
        if (
          sDisconnectReason === SOCKET_DISCONNECT_REASONS.TRANSPORT_CLOSE ||
          sDisconnectReason === SOCKET_DISCONNECT_REASONS.PING_TIMEOUT ||
          sDisconnectReason === SOCKET_DISCONNECT_REASONS.TRANSPORT_ERROR
        ) {
          addRemainingUser();
          sDisconnectReason = '';
        }
      });
    }
  });
}

function initBrowserNotificationWatch(userId) {
  if (!objSocket || !objSocket.connected) {
    createSocketConnection().then(() => {
      addUserToSocket(userId);
    });
  }
  if (objSocket.connected) {
    addUserToSocket(userId);
  }
}

function disconnectSocket() {
  if (objSocket && objSocket.connected) {
    objSocket.disconnect();
    allConnectedUsers = [];
    chrome.storage.local.set({ allConnectedUsers });
  }
}

function removeUserFromSocket(userId) {
  if (!objSocket || !objSocket.connected) return;

  const dataToSend = {
    arrUserId: userId,
    socketAuthToken,
    sourceId: sourceId.SALESHANDY_CONNECT,
  };

  objSocket.emit('eventRemoveUsersFromSocket', JSON.stringify(dataToSend));
  objSocket.off('eventRemoveUsersFromSocketAck');
  objSocket.on('eventRemoveUsersFromSocketAck', (data) => {
    const { arrUsersRemoved } = JSON.parse(data);

    allConnectedUsers = allConnectedUsers.filter(
      (u) => u !== arrUsersRemoved[0],
    );
    chrome.storage.local.set({ allConnectedUsers });

    if (!allConnectedUsers.length) {
      disconnectSocket();
    }
  });
}

chrome.notifications.onButtonClicked.addListener((notificationId, btnIdx) => {
  const userIDToRemove = notificationId.substring(
    0,
    notificationId.indexOf('-'),
  );
  chrome.notifications.clear(notificationId);
  if (btnIdx === 0) {
    removeUserFromSocket(userIDToRemove);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'loadScript') {
    // Get the current active tab in the window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Ensure that we got the active tab
      const tab = tabs[0]; // tabs array, so access the first tab

      if (tab) {
        // Execute script in the active tab
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['./app.js'],
          },
          () => {
            sendResponse({ status: 'success', message: 'Script loaded' });
          },
        );
      }
    });

    // Returning true here indicates that you will send the response asynchronously
    return true;
  }

  if (message.method === 'openNewPage') {
    chrome.tabs.create({ url: message.link });
  }

  if (message.method === 'socketIo') {
    const { data } = message;
    if (data) {
      const { userId, startNotify } = data;

      if (startNotify === true) {
        initBrowserNotificationWatch(userId);
      } else if (startNotify === false) {
        removeUserFromSocket(userId);
      }
    }

    return true;
  }
});

if (allConnectedUserslocalStorage && allConnectedUserslocalStorage.length) {
  allConnectedUsers = allConnectedUserslocalStorage.filter(
    (value, index, self) => self.indexOf(value) === index,
  );
  allConnectedUsers.forEach((userID) => {
    initBrowserNotificationWatch(userID);
  });
}

function gmailReloadAfterUpdate() {
  chrome.windows.getAll(
    {
      populate: true,
    },
    (windows) => {
      let i = 0;
      const w = windows.length;
      let currentWindow;
      for (; i < w; i++) {
        currentWindow = windows[i];
        let j = 0;
        const t = currentWindow.tabs.length;
        let currentTab;
        for (; j < t; j++) {
          currentTab = currentWindow.tabs[j];
          if (currentTab.url && currentTab.url.includes('mail.google.com')) {
            chrome.tabs.reload(currentTab.id);
          }
        }
      }
    },
  );
}

chrome.runtime.onInstalled.addListener((details) => {
  openLinkedinOnInstall();
  if (details.reason === 'install') {
    displayNotification({
      title: 'Hey there !',
      message:
        'This is a sample notification.\nYou will receive all the activity notifications here.',
    });
  }
  gmailReloadAfterUpdate();
});

chrome.runtime.setUninstallURL(
  'https://docs.google.com/forms/d/e/1FAIpQLScQKIzS-dmruh9lu0KkgnnV6-__rdaSMDafzqdEIsb7AXdC8w/viewform',
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (
      details.url.indexOf('sales-api') > 0 ||
      details.url.indexOf('voyager/api/') > 0 ||
      details.url.indexOf('/talent/search/api/') > 0
    ) {
      for (let iNo = 0; iNo < details.requestHeaders.length; iNo++) {
        if (details.requestHeaders[iNo].name.toLowerCase() === 'csrf-token') {
          chrome.storage.local.set({
            csrfToken: details.requestHeaders[iNo].value,
          });
          const localSv = [
            'salesApiPeopleSearch_url',
            'salesApiCompanySearch_url',
            'defaultApiPeopleSearch_url',
            'premiumApiPeopleSearch_url',
            'talentApiSearchPeople_url',
            'graphApiPeopleSearch_url',
          ];
          chrome.storage.local.get(localSv, (request) => {
            if (
              details.url.indexOf('salesApiPeopleSearch') > 0 ||
              details.url.indexOf('salesApiLeadSearch') > 0
            ) {
              let urls = {};
              if (request.salesApiPeopleSearch_url) {
                urls = JSON.parse(request.salesApiPeopleSearch_url);
              }
              urls[details.tabId] = {
                url: details.url,
                method: details.method,
              };
              chrome.storage.local.set({
                salesApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('salesApiCompanySearch') > 0) {
              let urls = {};
              if (request.salesApiCompanySearch_url) {
                urls = JSON.parse(request.salesApiCompanySearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                salesApiCompanySearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('voyager/api/search/blended') > 0) {
              let urls = {};
              if (request.defaultApiPeopleSearch_url) {
                urls = JSON.parse(request.defaultApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                defaultApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (
              details.url.indexOf('voyager/api/search/dash/clusters') > 0
            ) {
              let urls = {};
              if (request.premiumApiPeopleSearch_url) {
                urls = JSON.parse(request.premiumApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                premiumApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (
              details.url.indexOf('/voyager/api/graphql') > 0 &&
              details.url.indexOf('voyagerSearchDashClusters') > 0
            ) {
              let urls = {};
              if (request.graphApiPeopleSearch_url) {
                urls = JSON.parse(request.graphApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                graphApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('talentRecruiterSearchHits') > 0) {
              let urls = {};
              if (request.talentApiSearchPeople_url) {
                urls = JSON.parse(request.talentApiSearchPeople_url);
              }
              urls[details.tabId] = {
                url: details.url,
                method: details.method,
              };
              chrome.storage.local.set({
                talentApiSearchPeople_url: JSON.stringify(urls),
              });
            }
          });
          break;
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
