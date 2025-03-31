function loadReactApp() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('app.js');
  script.onload = () => {
    const rootElement = document.getElementById('react-root');
    if (rootElement) {
      console.log('React app loaded!');
      // Ensure the app is mounted here
    } else {
      console.error('React root element not found!');
    }
  };
  document.head.appendChild(script);
}

async function injectFloatingWindow() {
  console.log('Creating React div...');

  const existingModal = document.getElementById('react-root');
  if (existingModal) {
    console.log('Modal already exists, skipping creation.');
    return;
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
  modalDiv.style.display = 'flex';
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

async function injectBeaconOnLinkedInUrl() {
  // Check if the modal already exists
  const existingModal = document.getElementById('saleshandy-beacon');
  if (existingModal) {
    console.log('Beacon already exists, skipping creation.');
    return; // Don't create another modal if one already exists
  }

  console.log('Injecting the beacon');
  // This script will create and append the beacon to the LinkedIn page
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
  beacon.style.zIndex = '9999';

  // Append the beacon to the body of the LinkedIn page
  document.body.appendChild(beacon);

  let isDragging = false;
  let offsetY = 0;

  // Mouse down event to start dragging
  beacon.addEventListener('mousedown', (event) => {
    isDragging = true;
    offsetY = event.clientY - beacon.getBoundingClientRect().top;

    // Change cursor style to indicate dragging
    beacon.style.cursor = 'grabbing';
  });

  // Mouse move event to drag the beacon
  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const y = event.clientY - offsetY;

      // Update the beacon's position
      beacon.style.top = `${y}px`;
    }
  });

  // Mouse up event to stop dragging
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      beacon.style.cursor = 'pointer'; // Reset cursor to pointer when not dragging
    }
  });

  // Event delegation: Attach click event listener to the document body
  document.body.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'saleshandy-beacon') {
      injectFloatingWindow();
    }
  });
}

async function openIframe() {
  // Check if the video player is already injected
  if (!document.querySelector('.video-container')) {
    // Create the iframe element for the video
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Create the video container with styling
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');
    videoContainer.style.position = 'fixed';
    videoContainer.style.bottom = '20px';
    videoContainer.style.left = '20px';
    videoContainer.style.width = '640px';
    videoContainer.style.height = '360px';
    videoContainer.style.borderRadius = '12px';
    videoContainer.style.overflow = 'hidden';
    videoContainer.style.zIndex = '9999';
    videoContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    videoContainer.appendChild(iframe);

    // Create the close button
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

    // Add the video container to the page
    // document.body.appendChild(videoContainer);
  }
}

function closeDiv() {
  const element = document.getElementById('react-root');
  if (element) {
    element.remove();
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.method === 'createDiv') {
    await injectFloatingWindow(sendResponse);
    sendResponse({ status: 'success', message: 'Div Modal created' });
  }

  if (request.method === 'injectBeacon') {
    await injectBeaconOnLinkedInUrl();
    sendResponse({ status: 'success', message: 'Beacon Modal created' });
  }

  if (request.method === 'open-iframe') {
    await openIframe();
    sendResponse({ status: 'success', message: 'Iframe created' });
  }

  if (request.method === 'closeDiv') {
    await closeDiv();
    sendResponse({ status: 'success', message: 'div closed' });
  }
});
