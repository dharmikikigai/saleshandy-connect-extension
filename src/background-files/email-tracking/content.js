const FLOATING_WINDOW_ID = 'saleshandy-iframe';

function reloadIframe() {
  const iframe = document.getElementById(FLOATING_WINDOW_ID);
  if (iframe) {
    iframe.src = chrome.runtime.getURL('frame.html');
  }
}

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
  modalDiv.allow = 'clipboard-write';

  document.body.appendChild(modalDiv);
}

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
  beacon.style.backgroundImage = `url(chrome-extension://${chrome.runtime.id}/assets/icons/beacon.svg)`;
  beacon.style.backgroundSize = 'cover';
  beacon.style.cursor = 'pointer';
  beacon.style.borderRadius = '7px 0 0 7px';
  beacon.style.zIndex = '8888';
  beacon.style.transition = 'all 0.3s ease'; // Add transition for smooth hover effect

  // Create the drag handle
  const dragHandle = document.createElement('div');
  dragHandle.id = 'drag-handle';
  dragHandle.style.position = 'absolute';
  dragHandle.style.bottom = '-25px'; // Position the drag icon at the bottom of the beacon
  dragHandle.style.left = '60%'; // Center horizontally
  dragHandle.style.transform = 'translateX(-50%)'; // Center it properly
  dragHandle.style.cursor = 'grab';
  dragHandle.style.width = '20px'; // Width of the drag icon area
  dragHandle.style.height = '20px'; // Height of the drag icon area
  dragHandle.style.backgroundImage = `url(chrome-extension://${chrome.runtime.id}/assets/icons/drag.svg)`; // Set the drag icon as background image
  dragHandle.style.backgroundSize = 'contain'; // Ensure the icon fits inside the div
  dragHandle.style.backgroundRepeat = 'no-repeat'; // Avoid repeating the image
  dragHandle.style.display = 'flex';
  dragHandle.style.justifyContent = 'center';
  dragHandle.style.alignItems = 'center';

  // Initially hide the drag icon
  dragHandle.style.opacity = '0'; // Make it invisible by default
  dragHandle.style.transition = 'opacity 0.3s ease'; // Smooth transition for visibility change

  beacon.appendChild(dragHandle);
  document.body.appendChild(beacon);

  let isDragging = false;
  let offsetY = 0;

  // Get the height of the viewport
  const viewportHeight = window.innerHeight;
  const beaconHeight = beacon.offsetHeight;

  // Set boundaries for dragging
  const minTop = 0; // Minimum Y position (top of the screen)
  const maxTop = viewportHeight - beaconHeight; // Maximum Y position (bottom of the screen)

  // Drag logic only for the drag handle
  dragHandle.addEventListener('mousedown', (event) => {
    isDragging = true;
    offsetY = event.clientY - beacon.getBoundingClientRect().top;

    dragHandle.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      let y = event.clientY - offsetY;

      // Apply the boundaries
      if (y < minTop) {
        y = minTop; // Don't allow dragging above the screen
      } else if (y > maxTop) {
        y = maxTop; // Don't allow dragging below the screen
      }

      beacon.style.top = `${y}px`; // Move beacon
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragHandle.style.cursor = 'grab';
    }
  });

  // Show the drag handle when beacon is hovered
  beacon.addEventListener('mouseenter', () => {
    dragHandle.style.opacity = '1'; // Show the drag icon on hover
  });

  beacon.addEventListener('mouseleave', () => {
    dragHandle.style.opacity = '0'; // Hide the drag icon when not hovered
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
    iframe.src = 'https://www.youtube.com/embed/m55aDMo6nTA';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allowFullscreen = true;

    const videoContainer = document.createElement('div');
    videoContainer.id = 'saleshandy-welcome-video';
    videoContainer.classList.add('video-container');
    videoContainer.style.position = 'fixed';
    videoContainer.style.bottom = '20px';
    videoContainer.style.left = '20px';
    videoContainer.style.width = '480px';
    videoContainer.style.height = '300px';
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
    // Apply inline CSS for transition
    element.style.transition = 'transform 0.5s ease-out';

    // Start position: set the initial transform
    element.style.transform = 'translate(0, 0)'; // Starts from current position

    // Move the element to the right corner
    element.style.transform = 'translate(100vw, -100vh)'; // Move it out to the top-right corner

    // Wait for the transition to complete before removing the element
    setTimeout(() => {
      element.remove();
    }, 500); // Timeout should match the duration of the CSS transition (500ms)
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

  if (request.method === 'reloadIframe') {
    reloadIframe();
    sendResponse({ status: 'success', message: 'iframe reloaded' });
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
