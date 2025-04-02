function loadReactApp() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('app.js');
  document.head.appendChild(script);
}

function injectFloatingWindow(type) {
  const existingModal = document.getElementById('react-root');
  if (existingModal) {
    existingModal.style.display = 'flex';
    return;
  }

  let displayType = 'flex';

  if (type === 'none') {
    displayType = 'none';
  }

  const modalDiv = document.createElement('div');
  modalDiv.id = 'react-root';
  modalDiv.style.position = 'fixed';
  modalDiv.style.top = '50%';
  modalDiv.style.right = '15px';
  modalDiv.style.transform = 'translateY(-50%)';
  modalDiv.style.width = '332px';
  modalDiv.style.height = '686px';
  modalDiv.style.backgroundColor = 'white';
  modalDiv.style.borderRadius = '10px';
  modalDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  modalDiv.style.zIndex = '9999';
  modalDiv.style.display = displayType;
  modalDiv.style.flexDirection = 'column';
  modalDiv.style.alignItems = 'center';
  modalDiv.style.justifyContent = 'flex-start';

  // Store authToken and activeUrl
  chrome.storage.local.get(['authToken'], (request1) => {
    modalDiv.setAttribute('authToken', request1?.authToken || '');
  });

  chrome.storage.local.get(['activeUrl'], (request1) => {
    modalDiv.setAttribute('activeUrl', request1?.activeUrl || '');
  });

  document.body.appendChild(modalDiv);

  loadReactApp();
}

function injectScriptAndFloatingWindow(type) {
  chrome.runtime.sendMessage({ action: 'loadScript' }, () => {
    injectFloatingWindow(type);
  });
}

injectScriptAndFloatingWindow('none');

function injectBeaconOnLinkedInUrl() {
  const existingModal = document.getElementById('saleshandy-beacon');
  if (existingModal) {
    return;
  }

  const beacon = document.createElement('div');
  beacon.id = 'saleshandy-beacon';
  beacon.style.position = 'fixed';
  beacon.style.top = '50%';
  beacon.style.right = '1px';
  beacon.style.width = '40px';
  beacon.style.height = '40px';
  beacon.style.backgroundImage = `url(chrome-extension://${chrome.runtime.id}/assets/icons/beacon.png)`;
  beacon.style.backgroundSize = 'cover';
  beacon.style.cursor = 'pointer';
  beacon.style.borderRadius = '7px 0 0 7px';
  beacon.style.zIndex = '8888';

  document.body.appendChild(beacon);

  let isDragging = false;
  let offsetY = 0;

  beacon.addEventListener('mousedown', (event) => {
    isDragging = true;
    offsetY = event.clientY - beacon.getBoundingClientRect().top;

    beacon.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const y = event.clientY - offsetY;

      beacon.style.top = `${y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      beacon.style.cursor = 'pointer';
    }
  });

  document.body.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'saleshandy-beacon') {
      const element = document.getElementById('react-root');

      if (element && element.style.display === 'flex') {
        return;
      }

      injectScriptAndFloatingWindow();
    }
  });
}

function openIframe() {
  console.log('Inside Ram Ram');
  if (!document.getElementById('saleshandy-welcome-video')) {
    console.log('Inside Ram Ram');
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    const videoContainer = document.createElement('div');
    videoContainer.id = 'saleshandy-welcome-video';
    videoContainer.classList.add('video-container');
    videoContainer.style.position = 'fixed';
    videoContainer.style.bottom = '20px';
    videoContainer.style.left = '20px';
    videoContainer.style.width = '480px';
    videoContainer.style.height = '258px';
    videoContainer.style.borderRadius = '12px';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.zIndex = '9999';
    videoContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    videoContainer.appendChild(iframe);

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.padding = '5px 10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.addEventListener('click', () => {
      videoContainer.remove();
    });

    videoContainer.appendChild(closeButton);

    document.body.appendChild(videoContainer);
  }
}

function closeDiv() {
  const element = document.getElementById('react-root');
  if (element) {
    element.style.display = 'none';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, 'request');
  if (request.method === 'createDiv') {
    injectFloatingWindow();
    sendResponse({ status: 'success', message: 'Div Modal created' });
  }

  if (request.method === 'injectBeacon') {
    injectBeaconOnLinkedInUrl();
    sendResponse({ status: 'success', message: 'Beacon Modal created' });
  }

  if (request.method === 'injectYTVideo') {
    console.log('Message Revived');
    openIframe();

    sendResponse({ status: 'success', message: 'Iframe created' });
  }

  if (request.method === 'closeDiv') {
    closeDiv();
    sendResponse({ status: 'success', message: 'div closed' });
  }
});
