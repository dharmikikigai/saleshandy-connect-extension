/* eslint-disable no-unused-vars */
import ENV_CONFIG from '../../config/env/index';

async function getAndSetAuthToken() {
  chrome.cookies.get(
    { url: ENV_CONFIG.WEB_APP_URL, name: 'token' },
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
    if (currentTab?.url) {
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
      }
    },
  );
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
    const currentUrl = tab?.url;

    if (!currentUrl) {
      return;
    }

    if (tab.status === 'complete') {
      await getAndSetAuthToken();

      if (currentUrl.includes('linkedin.com')) {
        chrome.cookies.get(
          { url: 'https://www.linkedin.com', name: 'li_at' },
          (cookie) => {
            if (cookie) {
              chrome.storage.local.get(['isModalClosed'], (req) => {
                const isModalClosed = req?.isModalClosed;
                if (isModalClosed === undefined || isModalClosed === false) {
                  chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
                } else {
                  chrome.tabs.sendMessage(tab.id, { method: 'createDiv-0ff' });
                }
              });

              chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
            }
          },
        );
      }
    }

    if (currentUrl.includes('linkedin.com') && tab.status === 'complete') {
      const cleanedUrl = cleanUrl(currentUrl);

      // Only log if the cleaned URL is different from the last one
      if (cleanedUrl !== lastUrl) {
        chrome.tabs.sendMessage(tab.id, { method: 'reloadIframe' });

        lastUrl = cleanedUrl; // Update last URL with cleaned URL
        if (
          currentUrl.includes('linkedin.com/in/') ||
          currentUrl.includes('linkedin.com/search/results/people/') ||
          (currentUrl.includes('linkedin.com/company/') &&
            currentUrl.includes('/people'))
        ) {
          chrome.storage.local.get(['personInfo'], (req) => {
            const personInfo = req?.personInfo;

            if (!cleanedUrl.includes(personInfo?.sourceId2)) {
              chrome.storage.local.remove(['personInfo']);
            }
          });
          chrome.storage.local.remove(['bulkInfo']);
        }
      }
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const currentUrl = tabs[0]?.url;

    if (!currentUrl) {
      return;
    }

    await fetchAndSetActiveUrl();

    if (changeInfo.status === 'complete') {
      await getAndSetAuthToken();

      if (currentUrl.includes('linkedin.com')) {
        chrome.cookies.get(
          { url: 'https://www.linkedin.com', name: 'li_at' },
          (cookie) => {
            if (cookie) {
              chrome.storage.local.get(['isModalClosed'], (req) => {
                const isModalClosed = req?.isModalClosed;
                if (isModalClosed === undefined || isModalClosed === false) {
                  chrome.tabs.sendMessage(tab.id, { method: 'createDiv' });
                } else {
                  chrome.tabs.sendMessage(tab.id, { method: 'createDiv-0ff' });
                }
              });

              chrome.tabs.sendMessage(tab.id, { method: 'injectBeacon' });
            }
          },
        );
      }
    }

    if (
      currentUrl.includes('linkedin.com') &&
      changeInfo.status === 'complete'
    ) {
      const cleanedUrl = cleanUrl(currentUrl);

      if (
        cleanedUrl === lastUrl &&
        cleanedUrl.includes('linkedin.com/company/')
      ) {
        chrome.storage.local.remove(['bulkInfo']);
      }

      if (cleanedUrl !== lastUrl) {
        // Only log if the cleaned URL is different from the last one
        lastUrl = cleanedUrl; // Update last URL with cleaned URL
        chrome.tabs.sendMessage(tab.id, { method: 'reloadIframe' });

        if (
          currentUrl.includes('linkedin.com/in/') ||
          currentUrl.includes('linkedin.com/search/results/people/') ||
          (currentUrl.includes('linkedin.com/company/') &&
            currentUrl.includes('/people'))
        ) {
          chrome.storage.local.get(['personInfo'], (req) => {
            const personInfo = req?.personInfo;

            if (!currentUrl.includes(personInfo?.sourceId2)) {
              chrome.storage.local.remove(['personInfo']);
            }
          });
          chrome.storage.local.remove(['bulkInfo']);
        }
      }
    }
  });
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
});

function linkedInReloadAfterUpdate() {
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
          if (currentTab?.url) {
            if (currentTab.url.includes('linkedin.com')) {
              chrome.tabs.reload(currentTab.id);
            }
          }
        }
      }
    },
  );
}

chrome.runtime.onInstalled.addListener((details) => {
  openLinkedinOnInstall();
  linkedInReloadAfterUpdate();
});

chrome.runtime.setUninstallURL(
  'https://docs.google.com/forms/d/e/1FAIpQLScQKIzS-dmruh9lu0KkgnnV6-__rdaSMDafzqdEIsb7AXdC8w/viewform',
);

chrome.cookies.onChanged.addListener((changeInfo) => {
  const c = changeInfo.cookie;
  if (
    c.domain === ENV_CONFIG.WEB_DOMAIN &&
    c.name === 'token' &&
    !changeInfo.removed
  ) {
    chrome.storage.local.get(['authToken'], (req) => {
      const authenticationToken = req?.authToken;

      if (
        authenticationToken === undefined ||
        authenticationToken === null ||
        authenticationToken === ''
      ) {
        linkedInReloadAfterUpdate();
      }
    });
  }
});
