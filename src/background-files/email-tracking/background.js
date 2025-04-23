/* eslint-disable no-unused-vars */
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

async function fetchAndSetActiveUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab) {
      chrome.storage.local.set({ activeAllUrl: currentTab.url });
      if (currentTab.url.includes('linkedin.com')) {
        chrome.storage.local.set({ activeUrl: currentTab.url });
      }
    }
  });
}

async function onBeaconClickActivity(tab) {
  await getAndSetAuthToken();

  await fetchAndSetActiveUrl();

  chrome.tabs.sendMessage(tab.id, { method: 'injectYTVideo' });

  chrome.cookies.get(
    { url: 'https://www.linkedin.com', name: 'li_at' },
    (cookie) => {
      if (cookie) {
        chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
      } else {
        console.log('User is not logged in');
      }
    },
  );
}

async function updateMailboxEmail(tabId) {
  chrome.tabs.sendMessage(tabId, { method: 'updateMailboxEmail' });
}

let lastUrl = '';

function cleanUrl(url) {
  if (url.includes('overlay')) {
    return lastUrl;
  }
  // Clean the URL by removing query parameters
  const urlObj = new URL(url);
  urlObj.search = ''; // Remove query parameters
  return urlObj.toString();
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await fetchAndSetActiveUrl();
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const currentUrl = tab.url;

    if (tab.status === 'complete') {
      await getAndSetAuthToken();

      if (currentUrl.includes('linkedin.com')) {
        chrome.cookies.get(
          { url: 'https://www.linkedin.com', name: 'li_at' },
          (cookie) => {
            if (cookie) {
              chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
              chrome.storage.local.get(['isModalClosed'], (req) => {
                const isModalClosed = req?.isModalClosed;
                if (isModalClosed === undefined || isModalClosed === false) {
                  chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
                }
              });
            } else {
              console.log('User is not logged in');
            }
          },
        );
      }
      if (currentUrl.includes('mail.google.com')) {
        updateMailboxEmail(tab.id);
      }
    }

    if (currentUrl.includes('linkedin.com') && tab.status === 'complete') {
      const cleanedUrl = cleanUrl(currentUrl);

      // Only log if the cleaned URL is different from the last one
      if (cleanedUrl !== lastUrl) {
        lastUrl = cleanedUrl; // Update last URL with cleaned URL
        chrome.tabs.sendMessage(tab.id, { method: 'reloadIframe' });
        if (
          currentUrl.includes('linkedin.com/in/') ||
          currentUrl.includes('linkedin.com/search/results/people/') ||
          (currentUrl.includes('linkedin.com/company/') &&
            currentUrl.includes('/people'))
        ) {
          chrome.storage.local.remove(['personInfo', 'bulkInfo']);
        }
      }
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentUrl = tab.url;

  await fetchAndSetActiveUrl();

  if (changeInfo.status === 'complete') {
    await getAndSetAuthToken();

    if (currentUrl.includes('linkedin.com')) {
      chrome.cookies.get(
        { url: 'https://www.linkedin.com', name: 'li_at' },
        (cookie) => {
          if (cookie) {
            chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
            chrome.storage.local.get(['isModalClosed'], (req) => {
              const isModalClosed = req?.isModalClosed;
              if (isModalClosed === undefined || isModalClosed === false) {
                chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
              }
            });
          } else {
            console.log('User is not logged in');
          }
        },
      );
    }
    if (currentUrl.includes('mail.google.com')) {
      updateMailboxEmail(tab.id);
    }
  }

  if (currentUrl.includes('linkedin.com') && changeInfo.status === 'complete') {
    const cleanedUrl = cleanUrl(currentUrl);

    // Only log if the cleaned URL is different from the last one
    if (cleanedUrl !== lastUrl) {
      lastUrl = cleanedUrl; // Update last URL with cleaned URL
      chrome.tabs.sendMessage(tab.id, { method: 'reloadIframe' });

      if (
        currentUrl.includes('linkedin.com/in/') ||
        currentUrl.includes('linkedin.com/search/results/people/') ||
        (currentUrl.includes('linkedin.com/company/') &&
          currentUrl.includes('/people'))
      ) {
        chrome.storage.local.remove(['personInfo', 'bulkInfo']);
      }
    }
  }
});

async function openLinkedinOnInstall() {
  chrome.tabs.create(
    { url: 'https://www.linkedin.com/in/dhruvikigai/' },
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

chrome.runtime.onMessage.addListener((message) => {
  if (message.method === 'openNewPage') {
    chrome.tabs.create({ url: message.link });
  }

  if (message.method === 'closeIframe') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { method: 'closeDiv' });
    });
  }

  if (message.method === 'reloadIframeCs') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { method: 'reloadIframe' });
    });
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

          if (currentTab.url && currentTab.url.includes('linkedin.com')) {
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
