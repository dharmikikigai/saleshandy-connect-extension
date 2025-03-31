/* global chrome */
import io from './socket.io';
import environment from '../../config/env/index';

async function getAndSetAuthToken() {
  chrome.cookies.get(
    { url: 'https://pyxis.lifeisgoodforlearner.com', name: 'token' },
    (cookie) => {
      if (cookie) {
        chrome.storage.local.set({ authToken: cookie.value });
      } else {
        console.log('No authToken found in cookies');
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

  // Inject the content script dynamically into the tab
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ['./content.js'],
    },
    () => {
      chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
      chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
    },
  );
}

// chrome.action.onClicked.addListener(async (tab) => {
//   onBeaconClickActivity(tab);
// });

async function updateMailboxEmail(tabId) {
  chrome.tabs.sendMessage(tabId, { method: 'updateMailboxEmail' });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const currentUrl = tab.url;

    if (currentUrl && currentUrl.includes('linkedin.com')) {
      await getAndSetAuthToken();

      await fetchAndSetActiveUrl(tab?.url);

      // Send a message to the content script to inject the beacon

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['./content.js'],
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
        },
      );
    }

    if (tab.status === 'complete' && tab.active === true) {
      if (currentUrl.includes('mail.google.com')) {
        chrome.storage.local.set({ activeUrlForGmail: true });
        await updateMailboxEmail(tab.id);
      } else {
        chrome.storage.local.set({ activeUrlForGmail: false });
      }
      if (
        currentUrl.includes('mail.google.com') === false &&
        currentUrl.includes('hubspot.com/') === false &&
        currentUrl.includes('crm.zoho.in/crm') === false &&
        currentUrl.includes('crm.zoho.com/crm') === false &&
        currentUrl.includes('freshworks.com/crm') === false &&
        currentUrl.includes('linkedin.com/') === false
      ) {
        chrome.storage.local.set({ activeUrlCommonScreen: true });
      } else {
        chrome.storage.local.set({ activeUrlCommonScreen: false });
      }
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentUrl = tab.url;

  if (currentUrl && currentUrl.includes('linkedin.com')) {
    await getAndSetAuthToken();

    await fetchAndSetActiveUrl(tab?.url);

    // Send a message to the content script to inject the beacon

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['./content.js'],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
      },
    );
  }

  if (changeInfo.status === 'complete') {
    if (currentUrl.includes('mail.google.com')) {
      chrome.storage.local.set({ activeUrlForGmail: true });
      await updateMailboxEmail(tab.id);
    } else {
      chrome.storage.local.set({ activeUrlForGmail: false });
    }

    if (
      currentUrl.includes('mail.google.com') === false &&
      currentUrl.includes('hubspot.com/') === false &&
      currentUrl.includes('crm.zoho.in/crm') === false &&
      currentUrl.includes('crm.zoho.com/crm') === false &&
      currentUrl.includes('freshworks.com/crm') === false &&
      currentUrl.includes('linkedin.com/') === false
    ) {
      chrome.storage.local.set({ activeUrlCommonScreen: true });
    } else {
      chrome.storage.local.set({ activeUrlCommonScreen: false });
    }
  }
});

const SOCKET_DISCONNECT_REASONS = {
  PING_TIMEOUT: 'ping timeout',
  TRANSPORT_CLOSE: 'transport close',
  FORCED_CLOSE: 'forced close',
  TRANSPORT_ERROR: 'transport error',
  IO_SERVER_DISCONNECT: 'io server disconnect',
  IO_CLIENT_DISCONNECT: 'io client disconnect',
};

const socketUrl = `${environment.SOCKET_URL}`;

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
    // notificationButtons.push({
    //   title: 'Block all notifications',
    //   iconUrl: '../../assets/icons/block.png',
    // });
  }
  return notificationButtons;
}

function displayNotification(data) {
  let ctr = new Date();
  const { title, message } = data;
  let { encUserId } = data;
  const notificationButtons = getNotificationButtons(encUserId);
  // const notificationObj = {
  //   type: 'basic',
  //   title,
  //   message,
  //   // iconUrl: '../../assets/icons/48_48.png',
  // };

  // if (notificationButtons.length > 0) {
  //   notificationObj.buttons = notificationButtons;
  // }
  // encUserId = encUserId || 'initUserId';

  // chrome.notifications.create(`${encUserId}-${ctr}`, notificationObj);
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

    objSocket = io(socketUrl, {
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
  }

  if (message.method === 'store-data') {
    console.log('Storing the data', message?.value);
  }

  return true;
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

async function openLinkedinOnInstall() {
  // Create a new tab with the desired URL
  chrome.tabs.create(
    { url: 'https://www.linkedin.com/in/piyushnp/' },
    async (newTab) => {
      // Now call your onClickActivity function
      await onBeaconClickActivity(newTab);

      chrome.scripting.executeScript(
        {
          target: { tabId: newTab.id },
          files: ['./content.js'],
        },
        () => {
          chrome.tabs.sendMessage(newTab.id, { method: 'open-iframe' });
        },
      );
    },
  );
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    displayNotification({
      title: 'Hey there !',
      message:
        'This is a sample notification.\nYou will receive all the activity notifications here.',
    });
  }
  await openLinkedinOnInstall();
  gmailReloadAfterUpdate();
});

chrome.runtime.setUninstallURL(
  'https://docs.google.com/forms/d/e/1FAIpQLScQKIzS-dmruh9lu0KkgnnV6-__rdaSMDafzqdEIsb7AXdC8w/viewform',
);

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // Fired when the History API was used to change the URL
  console.log('History state updated', details.url);
  chrome.tabs.sendMessage(details.tabId, { method: 'closeDiv' });
});
