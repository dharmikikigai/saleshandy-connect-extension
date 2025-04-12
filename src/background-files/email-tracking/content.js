const FLOATING_WINDOW_ID = 'saleshandy-iframe';

function injectFloatingWindow() {
  const existingModal = document.getElementById(FLOATING_WINDOW_ID);
  if (existingModal) {
    return;
  }

  const modalDiv = document.createElement('iframe');
  modalDiv.id = FLOATING_WINDOW_ID;
  modalDiv.src = chrome.runtime.getURL('frame.html');
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
  modalDiv.style.display = 'flex';
  modalDiv.style.flexDirection = 'column';
  modalDiv.style.alignItems = 'center';
  modalDiv.style.justifyContent = 'flex-start';

  document.body.appendChild(modalDiv);
}

injectFloatingWindow();

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
      const element = document.getElementById(FLOATING_WINDOW_ID);

      if (element) {
        return;
      }

      injectFloatingWindow();
    }
  });
}

function openIframe() {
  if (!document.getElementById('saleshandy-welcome-video')) {
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
  const element = document.getElementById(FLOATING_WINDOW_ID);
  if (element) {
    // element.style.display = 'none';
    element.remove();
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'createDiv') {
    injectFloatingWindow();
    sendResponse({ status: 'success', message: 'Div Modal created' });
  }

  if (request.method === 'injectBeacon') {
    injectBeaconOnLinkedInUrl();
    sendResponse({ status: 'success', message: 'Beacon Modal created' });
  }

  if (request.method === 'injectYTVideo') {
    openIframe();
    sendResponse({ status: 'success', message: 'Iframe created' });
  }

  if (request.method === 'closeDiv') {
    closeDiv();
    sendResponse({ status: 'success', message: 'div closed' });
  }

  if (request.method === 'getPersonData') {
    if (request.request_method === 'POST') {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', request.url);
      if (request.tk) {
        xhr.setRequestHeader('csrf-token', request.tk);
      }
      xhr.setRequestHeader('X-RestLi-Protocol-Version', '2.0.0');
      xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('x-http-method-override', 'GET');
      if (['ns'].includes(request.origin)) {
        xhr.setRequestHeader(
          'accept',
          'application/vnd.linkedin.normalized+json+2.1',
        );
      }
      xhr.onload = function () {
        sendResponse({ data: xhr.responseText, method: 'getpersondata' });
      };
      xhr.send(request.params);
      return true;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', request.url);
    if (request.tk) {
      xhr.setRequestHeader('csrf-token', request.tk);
    }
    xhr.setRequestHeader('X-RestLi-Protocol-Version', '2.0.0');
    if (['ns'].includes(request.origin)) {
      xhr.setRequestHeader(
        'accept',
        'application/vnd.linkedin.normalized+json+2.1',
      );
    }
    xhr.onload = function () {
      sendResponse({ data: xhr.responseText, method: 'getpersondata' });
    };
    xhr.send(null);
    return true;
  }
});
