/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-const */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable consistent-return */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-useless-escape */
/* global chrome */
import * as InboxSDK from '@inboxsdk/core';
import linkifyHtml from 'linkify-html';
import mailboxInstance from '../../config/server/tracker/mailbox';

const extensionId = chrome.runtime.id;

// Regex for fetching links from the email content.
const REG_URL = /([a-z]*[\-]*[\=]+\'*\")*([blob\:])*(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)+[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{1,5}(:[0-9]{1,5})*([\/]*([a-z])*([A-Z])*([0-9])*[\?]*[\_]*[\-]*[\%]*[\&]*[\@]*[\^]*[\,]*[\*]*[\!]*[\(]*[\)]*[\']*[\~]*[\$]*[\*]*[\;]*[\:]*[\=]*[\.]*[\+]*(\<wbr> )*(\#)*)*/gi;

let oldTrackingPixel;
let oldTrackingLinks;
let newEmailId;
let newMailboxId;
let newUserId;
let undoListenerAdded = false;
let normal = false;
let modelView;

const pixel =
  '<img width="0" height="0" src="" alt="/ma/mb" style="display:none">';

// const welcomePopupHtml = `<div class="v5165_442503">
// <div class="divHeader">
//   <img src="chrome-extension://${extensionId}/assets/images/header.svg"/>
//   <span class="v09786">Connect</span>
// </div>
// <div class="v5165_442505">
//   <iframe
//     src="https://www.youtube.com/embed/Vt8IxejFH7c"
//     frameborder="0"
//     class="v1927653"
//   ></iframe>
// </div>
// <div class="v5165_442510">
//   <span > Email Tracking + Email Finder (LinkedIn) </span>
// </div>

// <div class="v5165_442511">
//   <div class="v5165_442512">
//     <img src="chrome-extension://${extensionId}/assets/images/circle.svg" />
//     <span class="v5165_442514">Track Emails from Gmail</span>
//   </div>
//   <div class="v5165_442515">
//   <img src="chrome-extension://${extensionId}/assets/images/circle.svg" />
//     <span class="v5165_442517"
//       >View Email Insights Report</span
//     >
//   </div>
//   <div class="v5165_442521">
//   <img src="chrome-extension://${extensionId}/assets/images/circle.svg" />
//     <span class="v5165_442520">LinkedIn Prospecting</span>
//   </div>
//   <div class="v5165_442518">
//   <img src="chrome-extension://${extensionId}/assets/images/circle.svg" />
//     <span class="v5165_442523">Add Prospect directly to Sequence</span>
//   </div>
// </div>
// <button class="shbutton" id="let_start_sh">
//   Let's get started
// </button>
// </div>`;

const welcomePopupHtml = '';
const forwardMessageSplit = '---------- Forwarded message ---------';

// Send Message to background file to start/stop the socket connection.
function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({
    method: 'socketIo',
    data,
  });
}

// Prepares the recipients array for API call.
function prepareRecipientsArray(toRecipients, ccRecipients, bccRecipients) {
  const recipients = [];

  for (const recipient of toRecipients) {
    const obj = {};

    if (recipient.name) {
      obj.firstName = recipient.name?.split(' ')[0];
      obj.lastName = recipient.name?.split(' ')[1];
    }

    obj.email = recipient.emailAddress;
    obj.type = 'to';

    recipients.push(obj);
  }

  for (const recipient of ccRecipients) {
    const obj = {};

    if (recipient.name) {
      obj.firstName = recipient.name?.split(' ')[0];
      obj.lastName = recipient.name?.split(' ')[1];
    }

    obj.email = recipient.emailAddress;
    obj.type = 'cc';

    recipients.push(obj);
  }

  for (const recipient of bccRecipients) {
    const obj = {};

    if (recipient.name) {
      obj.firstName = recipient.name?.split(' ')[0];
      obj.lastName = recipient.name?.split(' ')[1];
    }

    obj.email = recipient.emailAddress;
    obj.type = 'bcc';

    recipients.push(obj);
  }
  return recipients;
}

InboxSDK.load(2, 'sdk_sh_connect_3d6289d8a5').then(async (sdk) => {
  // Fetching the email address of current mailbox through inbox sdk.
  const currentUserEmail = sdk.User.getEmailAddress();

  // Shows the welcome popup
  async function showWelcomePopup() {
    const fontPreLoad = document.createElement('link');
    fontPreLoad.rel = 'preconnect';
    fontPreLoad.href = 'https://fonts.googleapis.com';
    const fontLoad = document.createElement('link');
    fontLoad.rel = 'stylesheet';
    fontLoad.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';

    document.head.appendChild(fontPreLoad);
    document.head.appendChild(fontLoad);
    const modalOptions = {};

    const modelEl = document.createElement('div');

    modelEl.style = 'width: 665px; float: left;';
    modelEl.innerHTML = welcomePopupHtml;

    modalOptions.el = modelEl;
    modalOptions.chrome = false;
    modelView = sdk.Widgets.showModalView(modalOptions);
  }

  function letGetStarted() {
    modelView.close();
    const isWelcomeMessageSeen = `${currentUserEmail} welcome message shown`;
    chrome.storage.local.set({
      [isWelcomeMessageSeen]: true,
    });
  }

  // Checking and handling the welcome popup in local storage.
  const isWelcomeMessageShown = `${currentUserEmail} welcome message shown`;
  chrome.storage.local.get([isWelcomeMessageShown], (req) => {
    if (
      req[isWelcomeMessageShown] === undefined ||
      req[isWelcomeMessageShown] === false
    ) {
      showWelcomePopup();
      document
        .getElementById('let_start_sh')
        .addEventListener('click', letGetStarted);
    }
  });

  // Updating mailbox email in local storage when getting the message from background file after user lands on Gmail tab.
  chrome.runtime.onMessage.addListener((request) => {
    if (request.method === 'updateMailboxEmail') {
      const currentMailbox = sdk.User.getEmailAddress();
      chrome.storage.local.set({ mailboxEmail: currentMailbox });
    }
  });

  // API call for fetching the mailbox setting and storing them in local storage.
  // Request Body -> mailbox email address
  // Response -> mailboxId, tracking setting and userId.
  async function mailboxApiCall() {
    const { mailboxId, isTrackingEnabled, userId } = (
      await mailboxInstance.fetchingMailboxSetting({
        email: currentUserEmail,
      })
    ).payload;

    chrome.storage.local.set({
      [currentUserEmail]: { mailboxId, isTrackingEnabled, userId },
    });

    newUserId = userId;
    newMailboxId = mailboxId;
  }

  // Fetching mailbox related data everytime the Gmail tab is been loaded.
  await mailboxApiCall();

  // Notifying the background file to make a socket connection for notification.
  sendMessageToBackground({ userId: newUserId.toString(), startNotify: true });

  // Called everytime the users clicks the undo or cancel button.
  async function handleUndoAndCancelSend() {
    sdk.Compose.registerComposeViewHandler((composeView) => {
      let getBody = composeView.getHTMLContent();

      // Fetching the dataSafeRedirectUrl from email content.
      const dataSafeRedirectUrl = getBody.match(
        'data-saferedirecturl.+?[\'|"]+?([^\'|"]+)?[\'|"]',
      );

      // Removing dataSafeRedirectUrl from email content.
      if (dataSafeRedirectUrl?.length) {
        for (const url of dataSafeRedirectUrl) {
          getBody = getBody.replace(url, '');
        }
      }

      // Replacing the links from trackable to non-trackable one
      if (oldTrackingLinks) {
        for (const key in oldTrackingLinks) {
          getBody = getBody.replace(
            `href="${oldTrackingLinks[key]}"`,
            `href="${key}"`,
          );
        }
      }

      // Regex for extracting the src attributes from email content.
      const linkRegex = 'srcs*=s*"(.+?)"';

      const googleRegex = getBody.match(linkRegex);

      if (googleRegex) {
        // Removing those src attributes from email content.
        getBody = getBody.replace(googleRegex[1], '');
      }

      // Removing tracking pixel
      getBody = getBody.replace(oldTrackingPixel, '');

      composeView.setBodyHTML(getBody);
    });

    // API call to delete that particular email from our DB.
    // Request param -> emailId (number)
    // Response -> Success message
    await mailboxInstance.deleteEmail(newEmailId);
  }

  // Handles the visibility changes and call undo function when stated buttons are been clicked.
  function handleVisibilityChange() {
    if (document.hidden) return;
    if (event.target.id === 'link_undo') {
      if (!undoListenerAdded) {
        document.querySelector('body').addEventListener(
          'click',
          (event) => {
            if (event.target.id === 'link_undo') {
              handleUndoAndCancelSend();
            }
          },
          {
            capture: true,
          },
        );
        undoListenerAdded = true;
      }
    }
  }

  // Monitors the changes on screen and calls the respective function.
  function setupTabMonitoring() {
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
      false,
    );
    window.addEventListener('focus', handleVisibilityChange, false);
    window.addEventListener('mouseover', handleVisibilityChange, false);
  }

  setTimeout(() => {
    setupTabMonitoring();
  }, 2000);

  // Registering the composeView handler.
  sdk.Compose.registerComposeViewHandler((composeView) => {
    // Fetching links from the email HTML content and returns the links found the content in the form of array.
    function getLinksFromBody() {
      const urlsEdited = [];

      let getHtmlBody = composeView.getHTMLContent();
      getHtmlBody = linkifyHtml(getHtmlBody, {});
      const urls = getHtmlBody.match(REG_URL);
      if (urls) {
        let count = 0;

        for (let i = 0; i < urls.length; i++) {
          if (urls[i].includes('href=')) {
            let value = urls[i];
            value = value.replace('href="', '');
            value = value.replace('"', '');
            urls[i] = value;
          }

          if (!urls[i].includes('http') && !urls[i].includes('https')) {
            urls[i] = `http://${urls[i]}`;
          }

          if (!urls[i].includes('href=')) {
            urls[i] = `href="${urls[i]}"`;
          }
        }

        // Counting the safe redirect url in urls array.
        urls.forEach((element) => {
          if (element.includes('saferedirecturl')) {
            count += 1;
          }
        });

        // Removing safe redirect url conditionally.
        for (let i = 0; i < count; i++) {
          const b = urls.findIndex((ele) => ele.includes('saferedirecturl'));
          if (urls[b + 1]) {
            if (urls[b + 1].includes('href')) {
              urls.splice(b, 1);
            } else {
              urls.splice(b, 2);
            }
          } else {
            urls.splice(b, 1);
          }
        }

        for (let url of urls) {
          if (url.includes('src')) {
            continue;
          }

          while (url[url.length - 1] === '.') url = url.slice(0, -1);
          while (url[url.length - 1] === '"') url = url.slice(0, -1);
          while (url[url.length - 1] === ',') url = url.slice(0, -1);
          url = url.replace(/\<wbr>/gi, '');
          url = url.replace(/\&nbsp;/gi, '');
          url = url.trim();

          // Removing "href" from the url.
          const editedUrl = url.substring(url.indexOf('"') + 1);

          if (editedUrl.includes('os="')) {
            continue;
          }

          urlsEdited.push(editedUrl);
        }
      }
      return urlsEdited;
    }

    async function replaceLinks(links, getBody, url) {
      if (url.includes('href')) {
        const urlLinkToReplace = url.substring(url.indexOf('"') + 1);

        if (getBody.includes(`href="${urlLinkToReplace}"`)) {
          getBody = getBody.replace(
            `href="${urlLinkToReplace}"`,
            `href="${links[urlLinkToReplace]}"`,
          );
        } else if (getBody.includes(`href="${`${urlLinkToReplace} `}"`)) {
          getBody = getBody.replace(
            `href="${`${urlLinkToReplace} `}"`,
            `href="${links[urlLinkToReplace]}"`,
          );
        } else if (getBody.includes(`href="${`${urlLinkToReplace}  `}"`)) {
          getBody = getBody.replace(
            `href="${`${urlLinkToReplace}  `}"`,
            `href="${links[urlLinkToReplace]}"`,
          );
        }
      } else {
        getBody = getBody.replace(url, `<a href="${links[url]}">${url}</a>`);
      }

      return getBody;
    }

    async function handleAndReplaceLinks(links, getBody) {
      oldTrackingLinks = links;

      let getHtmlBody = composeView.getHTMLContent();
      getHtmlBody = linkifyHtml(getHtmlBody, {});
      const allUrls = getHtmlBody.match(REG_URL);

      getBody = getBody.replace(/\<wbr>/gi, '');

      if (allUrls) {
        for (let i = 0; i < allUrls.length; i++) {
          if (allUrls[i].includes('href=')) {
            let value = allUrls[i];
            value = value.replace('href="', '');
            value = value.replace('"', '');
            allUrls[i] = value;
          }

          if (!allUrls[i].includes('http') && !allUrls[i].includes('https')) {
            allUrls[i] = `http://${allUrls[i]}`;
          }

          if (!allUrls[i].includes('href=')) {
            allUrls[i] = `href="${allUrls[i]}"`;
          }
        }

        let count = 0;
        // Removing '.', ',' from email content. Counting saferedirecturl.
        allUrls.forEach((element, index) => {
          while (element[element.length - 1] === '.') {
            element = element.slice(0, -1);
            allUrls[index] = element;
          }
          while (element[element.length - 1] === '"') {
            element = element.slice(0, -1);
            allUrls[index] = element;
          }
          while (element[element.length - 1] === ',') {
            element = element.slice(0, -1);
            allUrls[index] = element;
          }
          if (element.includes('saferedirecturl')) {
            count += 1;
          }
          if (!element.includes('href')) {
            for (const url of allUrls) {
              if (url.includes(element) && url.includes('href')) {
                allUrls.splice(index, 1);
                break;
              }
            }
          }
        });

        // Removing saferedirecturl.
        for (let i = 0; i < count; i++) {
          const b = allUrls.findIndex((ele) => ele.includes('saferedirecturl'));
          if (allUrls[b + 1]) {
            if (allUrls[b + 1].includes('href')) {
              allUrls.splice(b, 1);
            } else {
              allUrls.splice(b, 2);
            }
          } else {
            allUrls.splice(b, 1);
          }
        }

        for (const url of allUrls) {
          if (
            url.includes('googleusercontent.com') ||
            url.includes('export=download&amp') ||
            url.includes('src') ||
            url.includes('&nbsp;')
          ) {
            continue;
          }

          if (url.includes('="') && !url.includes('href')) {
            continue;
          }
          getBody = await replaceLinks(links, getBody, url);
        }
      }
      composeView.setBodyHTML(getBody);
    }

    // Fires when the user presses send button.
    composeView.on('presending', async (event) => {
      // If no recipients, return.
      const toRecipientsCheck = composeView.getToRecipients();
      if (!toRecipientsCheck.length) {
        return;
      }

      // Fetching body in type string.
      let getBody = composeView.getHTMLContent();

      // Checking if, Is it a forward email case.
      const isForward = composeView.isForward();

      // Splitting the forward message. It's generic, will not break in case of no forward type.
      const forwardMessage = getBody.split(forwardMessageSplit)[0];

      try {
        // Checking if the email content is already replaced by our data.
        if (
          !getBody.includes('/ma/' || '/mb/') || isForward
            ? !forwardMessage.includes('/ma/' || '/mb/')
            : false
        ) {
          getBody = linkifyHtml(getBody, {});

          const currentMailboxEmail = sdk.User.getEmailAddress();
          let mailboxId;
          let isTrackingEnabled;
          let userId;

          normal = true;
          // Canceling the events. (Prevents the gmail to send the email.)
          event.cancel();

          // Reading the local storage for mailbox settings.
          const readLocalStorage = async (request) =>
            new Promise((resolve, reject) => {
              chrome.storage.local.get([request], (result) => {
                if (result[request] === undefined) {
                  reject();
                } else {
                  resolve(result[request]);
                }
              });
            });

          const mailboxTrackingData = await readLocalStorage(currentUserEmail);

          normal = false;

          mailboxId = mailboxTrackingData.mailboxId;
          isTrackingEnabled = mailboxTrackingData.isTrackingEnabled;
          userId = mailboxTrackingData.userId;

          // If unable to find the setting for given user then making an API call for same.
          if (!mailboxId && !isTrackingEnabled) {
            normal = true;
            event.cancel();
            const mailboxTracking = (
              await mailboxInstance.fetchingMailboxSetting({
                email: currentMailboxEmail,
              })
            ).payload;

            mailboxId = mailboxTracking.mailboxId;
            isTrackingEnabled = mailboxTracking.isTrackingEnabled;
            userId = mailboxTracking.userId;
            normal = false;
          }

          newUserId = userId;
          newMailboxId = mailboxId;

          // Checking the tracking setting of mailbox.
          if (isTrackingEnabled) {
            const subject = composeView.getSubject();
            const toRecipients = composeView.getToRecipients();
            const ccRecipients = composeView.getCcRecipients();
            const bccRecipients = composeView.getBccRecipients();

            // Request Payload for tracking content API call.
            const requestPayload = {};

            // Trimming white spaces from subject.
            if (subject) {
              requestPayload.subject = subject.trim();
            }

            // Preparing recipient array for API call.
            const recipients = prepareRecipientsArray(
              toRecipients,
              ccRecipients,
              bccRecipients,
            );

            requestPayload.recipients = recipients;

            // Extracting the links from email content.
            const linksToTrackArray = getLinksFromBody();

            if (linksToTrackArray && linksToTrackArray.length > 0) {
              requestPayload.links = linksToTrackArray;
            }

            let links;
            let trackingPixel;
            let emailId;

            // Canceling the events. (Prevents the gmail to send the email.)
            normal = true;
            event.cancel();

            // API call for fetching tracking pixels and links.
            // Param -> mailboxId (number)
            // Request body -> - subject(string) - links(array of string) - recipients (array of object)
            const trackingData = (
              await mailboxInstance.fetchingTrackableData(
                requestPayload,
                newMailboxId,
              )
            )?.payload;

            normal = false;
            console.log(requestPayload, 'requestPayload');

            if (trackingData) {
              links = trackingData.links;
              trackingPixel = trackingData.trackingPixel;
              emailId = trackingData.emailId;
            }

            if (links) {
              await handleAndReplaceLinks(links, getBody);
            } else {
              composeView.setBodyHTML(getBody);
            }

            if (trackingPixel) {
              oldTrackingPixel = trackingPixel;
              composeView.insertHTMLIntoBodyAtCursor(trackingPixel);
            } else {
              composeView.insertHTMLIntoBodyAtCursor(pixel);
            }

            if (emailId) {
              newEmailId = emailId;
            }
          } else {
            composeView.insertHTMLIntoBodyAtCursor(pixel);
          }
          composeView.send();
        }
      } catch (error) {
        composeView.insertHTMLIntoBodyAtCursor(pixel);
        composeView.send();
      }
    });

    composeView.on('sendCanceled', () => {
      if (normal === false) {
        handleUndoAndCancelSend();
      }
    });

    composeView.on('sent', () => {
      if (newEmailId) {
        const threadId = composeView.getThreadID();

        mailboxInstance.updatingEmail({ draftId: threadId }, newEmailId);
      }
    });
  });
});

(function removeFromSocketOnLogout() {
  const logoutURL = document.querySelector(
    "[href^='https://accounts.google.com/Logout']",
  );
  if (logoutURL) {
    document
      .querySelector("[href^='https://accounts.google.com/Logout']")
      .addEventListener('click', () => {
        sendMessageToBackground({
          userID: newUserId?.toString(),
          startNotify: false,
        });
      });
  }
})();
