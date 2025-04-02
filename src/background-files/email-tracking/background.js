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

  console.log('On Install Updates');
  chrome.tabs.sendMessage(tab.id, { method: 'injectYTVideo' });
  chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const currentUrl = tab.url;

    if (
      tab.status === 'complete' &&
      currentUrl &&
      currentUrl.includes('linkedin.com')
    ) {
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
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentUrl = tab.url;

  if (
    changeInfo.status === 'complete' &&
    currentUrl &&
    currentUrl.includes('linkedin.com')
  ) {
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
});

async function openLinkedinOnInstall() {
  chrome.tabs.create(
    { url: 'https://www.linkedin.com/in/piyushnp/' },
    (newTab) => {
      onBeaconClickActivity(newTab);
    },
  );
}

chrome.runtime.onInstalled.addListener(() => {
  openLinkedinOnInstall();
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  chrome.tabs.sendMessage(details.tabId, { method: 'closeDiv' });
});

// eslint-disable-next-line consistent-return
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
});
