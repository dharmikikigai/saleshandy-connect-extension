import React, { useEffect, useState } from 'react';
import { Switch } from '@saleshandy/designs';
import mailboxInstance from '../config/server/tracker/mailbox';
import Gmail from '../assets/icons/gmail.svg';

const handleClose = () => {
  window.close();
};

const handleClick = (link) => {
  chrome.tabs.create({ url: link });
};

const Popup = () => {
  const [refreshTooltip, setRefreshTooltip] = useState(false);
  const [emailInsightTooltip, setEmailInsightTooltip] = useState(false);
  const [emailReportTooltip, setEmailReportTooltip] = useState(false);
  const [emailAccountTooltip, setEmailAccountTooltip] = useState(false);
  const [mailboxSetting, setMailboxSetting] = useState(false);
  const [desktopNotification, setDesktopNotification] = useState(false);
  const [newMailboxId, setMailboxId] = useState();
  const [mailboxEmail, setMailboxEmail] = useState('');
  const [newUserId, setUserId] = useState();
  const [mailboxList, setMailboxList] = useState([]);
  const [emailTrackingSentence, setEmailTrackingSentence] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchSetting = () => {
    chrome.storage.local.get(['activeAllUrl'], async (result) => {
      const activeUrl = result?.activeUrl;
      if (activeUrl?.includes('mail.google.com')) {
        chrome.storage.local.get(['mailboxEmail'], async (request) => {
          if (request.mailboxEmail) {
            const { mailboxId, isTrackingEnabled, userId } = (
              await mailboxInstance.fetchingMailboxSetting({
                email: request.mailboxEmail,
              })
            ).payload;

            chrome.storage.local.set({
              [request.mailboxEmail]: { mailboxId, isTrackingEnabled, userId },
            });

            setMailboxSetting(isTrackingEnabled);
            setMailboxId(mailboxId);
            setMailboxEmail(request.mailboxEmail);
            setUserId(userId);
            setEmailTrackingSentence(
              `Email tracking for ${request.mailboxEmail} is turned on`,
            );
          }
        });
      } else {
        const mailBoxes = (await mailboxInstance.getMailboxesSetting())
          ?.payload;

        if (mailBoxes?.length) {
          const anyTrackingEnabled = mailBoxes.filter(
            (x) => x.isTrackingEnabled,
          );

          if (anyTrackingEnabled?.length) {
            const trackingEmails = anyTrackingEnabled.map((item) => item.email);

            setMailboxSetting(true);
            setUserId(anyTrackingEnabled[0].userId);
            setMailboxList(trackingEmails);

            let sentence;

            if (trackingEmails.length === 1) {
              sentence = `Email tracking is turned on for ${trackingEmails[0]}`;
            } else if (trackingEmails.length === 2) {
              sentence = `Email tracking is turned on for ${trackingEmails[0]} and ${trackingEmails[1]}`;
            } else {
              sentence = (
                <>
                  Email tracking is turned on for {trackingEmails[0]},<br />
                  {trackingEmails[1]}{' '}
                  <div
                    style={{
                      color: '#0137FC',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onClick={() => {
                      setEmailAccountTooltip(!emailAccountTooltip);
                      console.debug('click ');
                    }}
                  >
                    <span
                      onMouseEnter={() => setEmailAccountTooltip(true)}
                      onMouseLeave={() => setEmailAccountTooltip(false)}
                    >
                      [+{trackingEmails.length - 2} more]
                    </span>
                  </div>
                </>
              );
            }

            setEmailTrackingSentence(sentence);
          } else {
            setMailboxSetting(false);
          }
        }
      }
    });
  };

  const handleTrackingSetting = async () => {
    chrome.storage.local.get(['activeAllUrl'], async (result) => {
      const activeUrl = result?.activeUrl;

      if (activeUrl?.includes('mail.google.com')) {
        const trackingSetting = (
          await mailboxInstance.updateMailboxSetting(
            {
              isTrackingEnabled: !mailboxSetting,
            },
            newMailboxId,
          )
        )?.payload;

        chrome.storage.local.get(['mailboxEmail'], (request) => {
          setMailboxEmail(request.mailboxEmail);
        });

        const trackingData = trackingSetting.isTrackingEnabled;

        chrome.storage.local.set({
          [mailboxEmail]: {
            mailboxId: newMailboxId,
            isTrackingEnabled: trackingData,
            userId: newUserId,
          },
        });

        if (trackingSetting) {
          setMailboxSetting(trackingData);
        }
      } else {
        console.log(mailboxSetting, 'MailboxSetting');
        await mailboxInstance.updateMailboxesSetting({
          isTrackingEnabled: !mailboxSetting,
        });

        if (!mailboxSetting === true) {
          fetchSetting();
        } else {
          setMailboxSetting(!mailboxSetting);
        }
      }
    });
  };

  const fetchNotificationSetting = async () => {
    const notificationSetting = (
      await mailboxInstance.fetchNotificationSetting()
    )?.payload;
    if (notificationSetting) {
      if (notificationSetting.settings[0].value === '1') {
        setDesktopNotification(true);
      } else {
        setDesktopNotification(false);
      }
    }
  };

  const handleNotificationSetting = async () => {
    let code;
    if (desktopNotification) {
      code = '0';
    } else {
      code = '1';
    }

    const data = await mailboxInstance.updateNotificationSetting({
      settings: [{ code: 'desktop_notification', value: code }],
    });
    if (data) {
      setDesktopNotification(!desktopNotification);
    }
  };

  const authCheck = () => {
    chrome.storage.local.get(['authToken'], (result) => {
      const authenticationToken = result?.authToken;

      let checkFurther = true;

      chrome.storage.local.get(['logoutTriggered'], (result1) => {
        const logoutTriggered = result1?.logoutTriggered;

        if (logoutTriggered && logoutTriggered === 'true') {
          setAuthenticated(false);
          checkFurther = false;
        }

        if (checkFurther) {
          if (
            authenticationToken !== undefined &&
            authenticationToken !== null &&
            authenticationToken !== ''
          ) {
            setAuthenticated(true);

            fetchSetting();
            fetchNotificationSetting();
          } else {
            setAuthenticated(false);
          }
        }
      });
    });
  };

  useEffect(() => {
    authCheck();
  }, []);

  return (
    <div
      style={{
        height: 'auto',
        width: '300px',
      }}
    >
      {/* Header */}
      <div
        className="d-flex"
        style={{
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            width="89"
            height="16"
            viewBox="0 0 89 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_35895_50272)">
              <g clipPath="url(#clip1_35895_50272)">
                <path
                  d="M5.00196 0.0390625C4.40463 0.0390625 4.10549 0.753549 4.52786 1.17141L15.6483 12.173C16.0706 12.5909 16.7928 12.295 16.7928 11.704V0.702379C16.7928 0.33604 16.4927 0.0390625 16.1224 0.0390625H5.00196Z"
                  fill="#1D4ED8"
                />
                <path
                  d="M8.55915 14.4461C8.87593 14.7595 9.41758 14.5375 9.41758 14.0943V7.83303C9.41758 7.55828 9.19245 7.33554 8.91473 7.33554H2.58586C2.13786 7.33554 1.9135 7.87141 2.23029 8.18481L8.55915 14.4461Z"
                  fill="#1D4ED8"
                />
                <path
                  d="M4.15195 15.3925C4.36314 15.6014 4.72424 15.4534 4.72424 15.158V12.3104C4.72424 12.1272 4.57415 11.9788 4.389 11.9788H1.51072C1.21205 11.9788 1.06248 12.336 1.27367 12.5449L4.15195 15.3925Z"
                  fill="#1D4ED8"
                />
              </g>
              <path
                d="M26.0115 7.56198C25.0423 7.42566 24.71 7.26213 24.71 6.82595C24.71 6.41705 25.07 6.14448 25.6792 6.14448C26.3161 6.14448 26.6483 6.38981 26.7315 6.93502H28.4482C28.2821 5.40847 27.1468 4.86328 25.6515 4.86328C24.267 4.86328 22.9656 5.54477 22.9656 6.93502C22.9656 8.24344 23.6579 8.73412 25.4577 9.00673C26.4268 9.14301 26.8145 9.33383 26.8145 9.79726C26.8145 10.2606 26.4822 10.5333 25.7623 10.5333C24.9593 10.5333 24.6547 10.1789 24.5716 9.57919H22.8271C22.8825 11.0239 23.9624 11.8145 25.7623 11.8145C27.5345 11.8145 28.6143 11.0512 28.6143 9.63369C28.6421 8.21619 27.7006 7.8073 26.0115 7.56198Z"
                fill="#202020"
              />
              <path
                d="M32.6848 4.89062C31.0234 4.89062 29.7496 5.3813 29.6389 6.96237H31.411C31.4941 6.3899 31.8264 6.22634 32.574 6.22634C33.4324 6.22634 33.6816 6.66251 33.6816 7.453V7.72561H32.9063C30.8296 7.72561 29.3896 8.29808 29.3896 9.85185C29.3896 11.2421 30.4142 11.8418 31.6603 11.8418C32.7125 11.8418 33.3216 11.4329 33.7093 10.8877V11.6782H35.5369V7.37126C35.5092 5.54486 34.3462 4.89062 32.6848 4.89062ZM33.6539 9.36118C33.6539 10.0972 33.0171 10.5334 32.1864 10.5334C31.4941 10.5334 31.2172 10.2062 31.2172 9.74282C31.2172 9.03407 31.8541 8.78875 32.934 8.78875H33.6539V9.36118Z"
                fill="#202020"
              />
              <path
                d="M38.1131 2.02734H36.2578V11.7045H38.1131V2.02734Z"
                fill="#202020"
              />
              <path
                d="M42.3483 4.89062C40.3823 4.89062 38.8594 6.2536 38.8594 8.35257V8.46161C38.8594 10.5878 40.3546 11.8418 42.376 11.8418C44.2312 11.8418 45.3942 11.0513 45.6157 9.60654H43.8436C43.7328 10.179 43.2898 10.5334 42.4314 10.5334C41.4069 10.5334 40.7977 9.90639 40.7423 8.78875H45.6157V8.27083C45.6434 5.89923 44.0928 4.89062 42.3483 4.89062ZM40.7977 7.64382C40.9361 6.68976 41.5176 6.14456 42.3483 6.14456C43.2344 6.14456 43.7605 6.63522 43.8159 7.64382H40.7977Z"
                fill="#202020"
              />
              <path
                d="M49.5486 7.56198C48.5795 7.42566 48.2472 7.26213 48.2472 6.82595C48.2472 6.41705 48.6071 6.14448 49.2163 6.14448C49.8532 6.14448 50.1855 6.38981 50.2686 6.93502H51.9853C51.8192 5.40847 50.6839 4.86328 49.1886 4.86328C47.8041 4.86328 46.5027 5.54477 46.5027 6.93502C46.5027 8.24344 47.195 8.73412 48.9948 9.00673C49.9639 9.14301 50.3516 9.33383 50.3516 9.79726C50.3516 10.2606 50.0193 10.5333 49.2994 10.5333C48.4964 10.5333 48.1918 10.1789 48.1087 9.57919H46.3643C46.4196 11.0239 47.4995 11.8145 49.2994 11.8145C51.0716 11.8145 52.1515 11.0512 52.1515 9.63369C52.1792 8.21619 51.2654 7.8073 49.5486 7.56198Z"
                fill="#202020"
              />
              <path
                d="M56.9952 4.8896C55.8599 4.8896 55.14 5.43479 54.8074 6.08901V2.02734H52.9248V11.7045H54.8074V7.8609C54.8074 6.87954 55.4166 6.38886 56.2198 6.38886C57.0504 6.38886 57.4103 6.825 57.4103 7.72457V11.7045H59.2933V7.45201C59.2656 5.68012 58.3243 4.8896 56.9952 4.8896Z"
                fill="#202020"
              />
              <path
                d="M63.337 4.89062C61.6758 4.89062 60.4019 5.3813 60.2912 6.96237H62.0635C62.1464 6.3899 62.4786 6.22634 63.2262 6.22634C64.0846 6.22634 64.3338 6.66251 64.3338 7.453V7.72561H63.5588C61.4817 7.72561 60.042 8.29808 60.042 9.85185C60.042 11.2421 61.0666 11.8418 62.3127 11.8418C63.3647 11.8418 63.9739 11.4329 64.3616 10.8877V11.6782H66.1891V7.37126C66.1617 5.54486 64.9708 4.89062 63.337 4.89062ZM64.3065 9.36118C64.3065 10.0972 63.6695 10.5334 62.8385 10.5334C62.1464 10.5334 61.8694 10.2062 61.8694 9.74282C61.8694 9.03407 62.5064 8.78875 63.5862 8.78875H64.3065V9.36118Z"
                fill="#202020"
              />
              <path
                d="M70.981 4.89062C69.8456 4.89062 69.1258 5.43582 68.7932 6.09005V5.02692H66.9102V11.6782H68.7932V7.86189C68.7932 6.88058 69.4023 6.3899 70.2056 6.3899C71.0362 6.3899 71.3961 6.82604 71.3961 7.72561V11.7055H73.2791V7.453C73.2513 5.68115 72.31 4.89062 70.981 4.89062Z"
                fill="#202020"
              />
              <path
                d="M79.1224 6.03449C78.7347 5.35301 78.07 4.88959 76.9902 4.88959C75.3012 4.88959 74.0273 6.17079 74.0273 8.35158V8.46061C74.0273 10.6686 75.3286 11.8408 76.9624 11.8408C77.9593 11.8408 78.7898 11.2683 79.1224 10.5869V11.7045H80.9777V2.02734H79.1224V6.03449ZM79.1776 8.40607C79.1776 9.74178 78.4855 10.396 77.5164 10.396C76.5747 10.396 75.9377 9.74178 75.9377 8.43332V8.32429C75.9377 6.98858 76.5195 6.30708 77.5715 6.30708C78.5962 6.30708 79.1776 6.98858 79.1776 8.29704V8.40607Z"
                fill="#202020"
              />
              <path
                d="M86.9017 5.05469L85.3786 9.03457L83.7447 5.05469H81.7236L84.4095 11.0245L83.2185 13.9686H85.0464L88.7013 5.05469H86.9017Z"
                fill="#202020"
              />
            </g>
            <defs>
              <clipPath id="clip0_35895_50272">
                <rect
                  width="88"
                  height="15.9196"
                  fill="white"
                  transform="translate(0.701172 0.0390625)"
                />
              </clipPath>
              <clipPath id="clip1_35895_50272">
                <rect
                  width="16.0915"
                  height="15.9196"
                  fill="white"
                  transform="translate(0.701172 0.0390625)"
                />
              </clipPath>
            </defs>
          </svg>
          <div
            style={{
              fontWeight: '600',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#1F2937',
              paddingLeft: '3px',
            }}
          >
            Connect
          </div>
        </div>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0px',
          }}
          onClick={handleClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-Rule="evenodd"
              clipRule="evenodd"
              d="M15.5891 4.41009C15.9145 4.73553 15.9145 5.26317 15.5891 5.5886L5.58909 15.5886C5.26366 15.914 4.73602 15.914 4.41058 15.5886C4.08514 15.2632 4.08514 14.7355 4.41058 14.4101L14.4106 4.41009C14.736 4.08466 15.2637 4.08466 15.5891 4.41009Z"
              fill="#6B7280"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.41058 4.41009C4.73602 4.08466 5.26366 4.08466 5.58909 4.41009L15.5891 14.4101C15.9145 14.7355 15.9145 15.2632 15.5891 15.5886C15.2637 15.914 14.736 15.914 14.4106 15.5886L4.41058 5.5886C4.08514 5.26317 4.08514 4.73553 4.41058 4.41009Z"
              fill="#6B7280"
            />
          </svg>
        </button>
      </div>
      {/* Divider */}
      <div
        style={{
          border: '1.2px solid #F3F4F6',
          width: '100%',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            gap: '8px',
            width: '100%',
            height: '32px',
            marginTop: '8px',
            cursor: 'pointer',
          }}
          onClick={handleClose}
        >
          <div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.66675 2.00586C3.03494 2.00586 3.33342 2.30434 3.33342 2.67253V4.18777C3.78579 3.64751 4.33182 3.1866 4.95006 2.82943C6.10229 2.16377 7.44143 1.89542 8.76118 2.06571C10.0809 2.236 11.3081 2.83549 12.2536 3.77182C13.1991 4.70816 13.8106 5.9294 13.9937 7.24743C14.0444 7.61211 13.7899 7.94883 13.4252 7.99951C13.0605 8.0502 12.7238 7.79564 12.6731 7.43096C12.5302 6.40261 12.0531 5.44977 11.3154 4.71922C10.5777 3.98868 9.62024 3.52094 8.59055 3.38808C7.56085 3.25522 6.51603 3.46459 5.61704 3.98395C5.02552 4.32568 4.51873 4.78913 4.12752 5.33919H6.00008C6.36827 5.33919 6.66675 5.63767 6.66675 6.00586C6.66675 6.37405 6.36827 6.67253 6.00008 6.67253H3.01499C3.00489 6.67276 2.99477 6.67276 2.98463 6.67253H2.66675C2.29856 6.67253 2.00008 6.37405 2.00008 6.00586V2.67253C2.00008 2.30434 2.29856 2.00586 2.66675 2.00586Z"
                fill="#6B7280"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.57498 8.01221C2.93967 7.96152 3.27639 8.21608 3.32707 8.58076C3.46998 9.60911 3.94704 10.5619 4.68475 11.2925C5.42247 12.023 6.37992 12.4908 7.40962 12.6236C8.43931 12.7565 9.48413 12.5471 10.3831 12.0278C10.9746 11.686 11.4814 11.2226 11.8726 10.6725H10.0001C9.63189 10.6725 9.33342 10.374 9.33342 10.0059C9.33342 9.63767 9.63189 9.33919 10.0001 9.33919H12.9852C12.9953 9.33896 13.0054 9.33896 13.0155 9.33919H13.3334C13.7016 9.33919 14.0001 9.63767 14.0001 10.0059V13.3392C14.0001 13.7074 13.7016 14.0059 13.3334 14.0059C12.9652 14.0059 12.6667 13.7074 12.6667 13.3392V11.824C12.2144 12.3642 11.6683 12.8251 11.0501 13.1823C9.89787 13.8479 8.55874 14.1163 7.23899 13.946C5.91924 13.7757 4.69208 13.1762 3.74656 12.2399C2.80103 11.3036 2.1896 10.0823 2.00643 8.76429C1.95575 8.39961 2.2103 8.06289 2.57498 8.01221Z"
                fill="#6B7280"
              />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '16px',
                color: '#6B7280',
                paddingTop: '3px',
              }}
            >
              Refresh Extension
            </div>
            <div
              onMouseEnter={() => setRefreshTooltip(true)}
              onMouseLeave={() => setRefreshTooltip(false)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.99984 2.33268C4.42251 2.33268 2.33317 4.42202 2.33317 6.99935C2.33317 9.57668 4.42251 11.666 6.99984 11.666C9.57717 11.666 11.6665 9.57668 11.6665 6.99935C11.6665 4.42202 9.57717 2.33268 6.99984 2.33268ZM1.1665 6.99935C1.1665 3.77769 3.77818 1.16602 6.99984 1.16602C10.2215 1.16602 12.8332 3.77769 12.8332 6.99935C12.8332 10.221 10.2215 12.8327 6.99984 12.8327C3.77818 12.8327 1.1665 10.221 1.1665 6.99935Z"
                  fill="#6B7280"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.4165 4.66165C6.4165 4.33948 6.67767 4.07831 6.99984 4.07831H7.00567C7.32784 4.07831 7.589 4.33948 7.589 4.66165C7.589 4.98381 7.32784 5.24498 7.00567 5.24498H6.99984C6.67767 5.24498 6.4165 4.98381 6.4165 4.66165Z"
                  fill="#6B7280"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.83317 6.99935C5.83317 6.67718 6.09434 6.41602 6.4165 6.41602H6.99984C7.322 6.41602 7.58317 6.67718 7.58317 6.99935V8.74935C7.90534 8.74935 8.1665 9.01052 8.1665 9.33268C8.1665 9.65485 7.90534 9.91602 7.58317 9.91602H6.99984C6.67767 9.91602 6.4165 9.65485 6.4165 9.33268V7.58268C6.09434 7.58268 5.83317 7.32151 5.83317 6.99935Z"
                  fill="#6B7280"
                />
              </svg>
              {refreshTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '89px', // adjust this based on your layout
                    left: '55%',
                    transform: 'translateX(-50%)',
                    padding: '10px',
                    backgroundColor: '#333',
                    color: 'white',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    width: '200px',
                    zIndex: 1,
                  }}
                >
                  Clears cache & reload the extension to fix any issues.
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '52px',
                      left: '48%',
                      transform: 'rotate(180deg)',
                      width: '0',
                      height: '0',
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid #333',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div
          style={{
            border: '1.2px solid #F3F4F6',
            width: '268px',
          }}
        />
        {/* Saleshandy Platform */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontWeight: '500',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#1F2937',
              padding: '0px 16px',
            }}
          >
            Saleshandy Platform
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* View Lead Finder */}
            <div
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
              }}
            >
              {/* First SVG */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.83138 1.72201C3.62224 1.72201 1.83138 3.51287 1.83138 5.72201C1.83138 7.93114 3.62224 9.72201 5.83138 9.72201C8.04052 9.72201 9.83138 7.93114 9.83138 5.72201C9.83138 3.51287 8.04052 1.72201 5.83138 1.72201ZM0.498047 5.72201C0.498047 2.77649 2.88586 0.388672 5.83138 0.388672C8.7769 0.388672 11.1647 2.77649 11.1647 5.72201C11.1647 8.66752 8.7769 11.0553 5.83138 11.0553C2.88586 11.0553 0.498047 8.66752 0.498047 5.72201Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.69331 8.58393C8.95366 8.32359 9.37577 8.32359 9.63612 8.58393L13.6361 12.5839C13.8965 12.8443 13.8965 13.2664 13.6361 13.5267C13.3758 13.7871 12.9537 13.7871 12.6933 13.5267L8.69331 9.52674C8.43296 9.26639 8.43296 8.84428 8.69331 8.58393Z"
                    fill="#6B7280"
                  />
                </svg>
                {/* View Lead Finder label */}
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#6B7280',
                  }}
                >
                  View Lead Finder
                </div>
              </div>

              {/* View Lead Finder link svg */}
              <div
                onClick={() =>
                  handleClick(
                    'https://pyxis.lifeisgoodforlearner.com/leads#people',
                  )
                }
                style={{
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.75083 4.64633C3.1259 4.27126 3.63461 4.06055 4.16504 4.06055H7.49837C7.86656 4.06055 8.16504 4.35902 8.16504 4.72721C8.16504 5.0954 7.86656 5.39388 7.49837 5.39388H4.16504C3.98823 5.39388 3.81866 5.46412 3.69363 5.58914C3.56861 5.71417 3.49837 5.88374 3.49837 6.06055V12.0605C3.49837 12.2374 3.56861 12.4069 3.69363 12.532C3.81866 12.657 3.98823 12.7272 4.16504 12.7272H10.165C10.3419 12.7272 10.5114 12.657 10.6364 12.532C10.7615 12.4069 10.8317 12.2374 10.8317 12.0605V8.72721C10.8317 8.35902 11.1302 8.06055 11.4984 8.06055C11.8666 8.06055 12.165 8.35902 12.165 8.72721V12.0605C12.165 12.591 11.9543 13.0997 11.5793 13.4748C11.2042 13.8498 10.6955 14.0605 10.165 14.0605H4.16504C3.63461 14.0605 3.1259 13.8498 2.75083 13.4748C2.37575 13.0997 2.16504 12.591 2.16504 12.0605V6.06055C2.16504 5.53011 2.37575 5.02141 2.75083 4.64633Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9698 2.25581C14.2301 2.51616 14.2301 2.93827 13.9698 3.19862L7.30311 9.86528C7.04276 10.1256 6.62065 10.1256 6.3603 9.86528C6.09995 9.60494 6.09995 9.18283 6.3603 8.92248L13.027 2.25581C13.2873 1.99546 13.7094 1.99546 13.9698 2.25581Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.49837 2.72721C9.49837 2.35902 9.79685 2.06055 10.165 2.06055H13.4984C13.8666 2.06055 14.165 2.35902 14.165 2.72721V6.06055C14.165 6.42874 13.8666 6.72721 13.4984 6.72721C13.1302 6.72721 12.8317 6.42874 12.8317 6.06055V3.39388H10.165C9.79685 3.39388 9.49837 3.0954 9.49837 2.72721Z"
                    fill="#D1D5DB"
                  />
                </svg>
              </div>
            </div>
            {/* View Prospects */}
            <div
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
              }}
            >
              {/* First SVG */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.83171 2.72201C4.72714 2.72201 3.83171 3.61744 3.83171 4.72201C3.83171 5.82657 4.72714 6.72201 5.83171 6.72201C6.93628 6.72201 7.83171 5.82657 7.83171 4.72201C7.83171 3.61744 6.93628 2.72201 5.83171 2.72201ZM2.49837 4.72201C2.49837 2.88106 3.99076 1.38867 5.83171 1.38867C7.67266 1.38867 9.16504 2.88106 9.16504 4.72201C9.16504 6.56295 7.67266 8.05534 5.83171 8.05534C3.99076 8.05534 2.49837 6.56295 2.49837 4.72201Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.49837 10.722C3.96794 10.722 3.45923 10.9327 3.08416 11.3078C2.70909 11.6829 2.49837 12.1916 2.49837 12.722V14.0553C2.49837 14.4235 2.1999 14.722 1.83171 14.722C1.46352 14.722 1.16504 14.4235 1.16504 14.0553V12.722C1.16504 11.838 1.51623 10.9901 2.14135 10.365C2.76647 9.73986 3.61432 9.38867 4.49837 9.38867H7.16504C8.04909 9.38867 8.89694 9.73986 9.52206 10.365C10.1472 10.9901 10.4984 11.8379 10.4984 12.722V14.0553C10.4984 14.4235 10.1999 14.722 9.83171 14.722C9.46352 14.722 9.16504 14.4235 9.16504 14.0553V12.722C9.16504 12.1916 8.95433 11.6829 8.57925 11.3078C8.20418 10.9327 7.69547 10.722 7.16504 10.722H4.49837Z"
                    fill="#6B7280"
                  />
                  <path
                    d="M15.165 4.72201C15.165 4.35382 14.8666 4.05534 14.4984 4.05534H11.8317C11.4635 4.05534 11.165 4.35382 11.165 4.72201C11.165 5.0902 11.4635 5.38867 11.8317 5.38867H14.4984C14.8666 5.38867 15.165 5.0902 15.165 4.72201Z"
                    fill="#6B7280"
                  />
                  <path
                    d="M15.165 7.38867C15.165 7.02048 14.8666 6.72201 14.4984 6.72201H11.8317C11.4635 6.72201 11.165 7.02048 11.165 7.38867C11.165 7.75686 11.4635 8.05534 11.8317 8.05534H14.4984C14.8666 8.05534 15.165 7.75686 15.165 7.38867Z"
                    fill="#6B7280"
                  />
                  <path
                    d="M15.165 10.0553C15.165 9.68715 14.8666 9.38867 14.4984 9.38867H11.8317C11.4635 9.38867 11.165 9.68715 11.165 10.0553C11.165 10.4235 11.4635 10.722 11.8317 10.722H14.4984C14.8666 10.722 15.165 10.4235 15.165 10.0553Z"
                    fill="#6B7280"
                  />
                </svg>
                {/* View Prospects label */}
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#6B7280',
                  }}
                >
                  View Prospects
                </div>
              </div>
              {/* View Prospects link svg */}
              <div
                onClick={() =>
                  handleClick(
                    'https://pyxis.lifeisgoodforlearner.com/prospects',
                  )
                }
                style={{
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.75083 4.64633C3.1259 4.27126 3.63461 4.06055 4.16504 4.06055H7.49837C7.86656 4.06055 8.16504 4.35902 8.16504 4.72721C8.16504 5.0954 7.86656 5.39388 7.49837 5.39388H4.16504C3.98823 5.39388 3.81866 5.46412 3.69363 5.58914C3.56861 5.71417 3.49837 5.88374 3.49837 6.06055V12.0605C3.49837 12.2374 3.56861 12.4069 3.69363 12.532C3.81866 12.657 3.98823 12.7272 4.16504 12.7272H10.165C10.3419 12.7272 10.5114 12.657 10.6364 12.532C10.7615 12.4069 10.8317 12.2374 10.8317 12.0605V8.72721C10.8317 8.35902 11.1302 8.06055 11.4984 8.06055C11.8666 8.06055 12.165 8.35902 12.165 8.72721V12.0605C12.165 12.591 11.9543 13.0997 11.5793 13.4748C11.2042 13.8498 10.6955 14.0605 10.165 14.0605H4.16504C3.63461 14.0605 3.1259 13.8498 2.75083 13.4748C2.37575 13.0997 2.16504 12.591 2.16504 12.0605V6.06055C2.16504 5.53011 2.37575 5.02141 2.75083 4.64633Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9698 2.25581C14.2301 2.51616 14.2301 2.93827 13.9698 3.19862L7.30311 9.86528C7.04276 10.1256 6.62065 10.1256 6.3603 9.86528C6.09995 9.60494 6.09995 9.18283 6.3603 8.92248L13.027 2.25581C13.2873 1.99546 13.7094 1.99546 13.9698 2.25581Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.49837 2.72721C9.49837 2.35902 9.79685 2.06055 10.165 2.06055H13.4984C13.8666 2.06055 14.165 2.35902 14.165 2.72721V6.06055C14.165 6.42874 13.8666 6.72721 13.4984 6.72721C13.1302 6.72721 12.8317 6.42874 12.8317 6.06055V3.39388H10.165C9.79685 3.39388 9.49837 3.0954 9.49837 2.72721Z"
                    fill="#D1D5DB"
                  />
                </svg>
              </div>
            </div>
            {/* Sequence */}
            <div
              style={{
                width: '100%',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
              }}
            >
              {/* First SVG */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.6362 1.58395C14.8965 1.8443 14.8965 2.26641 14.6362 2.52676L7.30283 9.8601C7.04248 10.1204 6.62037 10.1204 6.36002 9.8601C6.09967 9.59975 6.09967 9.17764 6.36002 8.91729L13.6934 1.58395C13.9537 1.3236 14.3758 1.3236 14.6362 1.58395Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.6362 1.58395C14.8189 1.76672 14.8796 2.03867 14.7918 2.28179L10.4585 14.2818C10.4522 14.2992 10.4452 14.3163 10.4375 14.3331C10.3551 14.513 10.2227 14.6654 10.0562 14.7723C9.88967 14.8791 9.69596 14.9359 9.49809 14.9359C9.30022 14.9359 9.10652 14.8791 8.94 14.7723C8.77746 14.668 8.64749 14.5202 8.5647 14.346L6.33452 9.88559L1.87418 7.65542C1.69989 7.57264 1.55217 7.44266 1.44785 7.28012C1.34099 7.1136 1.28418 6.91989 1.28418 6.72202C1.28418 6.52416 1.34099 6.33045 1.44785 6.16393C1.55472 5.9974 1.70715 5.86506 1.88703 5.78263C1.90383 5.77493 1.92095 5.76793 1.93833 5.76165L13.9383 1.42832C14.1814 1.34053 14.4534 1.40118 14.6362 1.58395ZM3.07927 6.76725L7.12957 8.79241C7.25859 8.85691 7.3632 8.96153 7.42771 9.09055L9.45286 13.1409L13.0553 3.16479L3.07927 6.76725Z"
                    fill="#6B7280"
                  />
                </svg>
                {/* Sequence label */}
                <div
                  style={{
                    fontWeight: '400',
                    fontSize: '14px',
                    lineHeight: '16px',
                    color: '#6B7280',
                  }}
                >
                  Sequence
                </div>
              </div>
              {/* Sequence link svg */}
              <div
                onClick={() =>
                  handleClick('https://pyxis.lifeisgoodforlearner.com/sequence')
                }
                style={{
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.75083 4.64633C3.1259 4.27126 3.63461 4.06055 4.16504 4.06055H7.49837C7.86656 4.06055 8.16504 4.35902 8.16504 4.72721C8.16504 5.0954 7.86656 5.39388 7.49837 5.39388H4.16504C3.98823 5.39388 3.81866 5.46412 3.69363 5.58914C3.56861 5.71417 3.49837 5.88374 3.49837 6.06055V12.0605C3.49837 12.2374 3.56861 12.4069 3.69363 12.532C3.81866 12.657 3.98823 12.7272 4.16504 12.7272H10.165C10.3419 12.7272 10.5114 12.657 10.6364 12.532C10.7615 12.4069 10.8317 12.2374 10.8317 12.0605V8.72721C10.8317 8.35902 11.1302 8.06055 11.4984 8.06055C11.8666 8.06055 12.165 8.35902 12.165 8.72721V12.0605C12.165 12.591 11.9543 13.0997 11.5793 13.4748C11.2042 13.8498 10.6955 14.0605 10.165 14.0605H4.16504C3.63461 14.0605 3.1259 13.8498 2.75083 13.4748C2.37575 13.0997 2.16504 12.591 2.16504 12.0605V6.06055C2.16504 5.53011 2.37575 5.02141 2.75083 4.64633Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.9698 2.25581C14.2301 2.51616 14.2301 2.93827 13.9698 3.19862L7.30311 9.86528C7.04276 10.1256 6.62065 10.1256 6.3603 9.86528C6.09995 9.60494 6.09995 9.18283 6.3603 8.92248L13.027 2.25581C13.2873 1.99546 13.7094 1.99546 13.9698 2.25581Z"
                    fill="#D1D5DB"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.49837 2.72721C9.49837 2.35902 9.79685 2.06055 10.165 2.06055H13.4984C13.8666 2.06055 14.165 2.35902 14.165 2.72721V6.06055C14.165 6.42874 13.8666 6.72721 13.4984 6.72721C13.1302 6.72721 12.8317 6.42874 12.8317 6.06055V3.39388H10.165C9.79685 3.39388 9.49837 3.0954 9.49837 2.72721Z"
                    fill="#D1D5DB"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              border: '1.2px solid #F3F4F6',
              width: '268px',
              marginLeft: '5%',
            }}
          />
        </div>
        {/* Email Tracking Insights */}
        {/* Email Tracking label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0px 16px',
              height: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  fontWeight: '500',
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#1F2937',
                }}
              >
                Email Tracking Insights
              </div>
              {/* Email Tracking read more svg */}
              <div
                onMouseEnter={() => setEmailInsightTooltip(true)}
                onMouseLeave={() => setEmailInsightTooltip(false)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.16536 2.38737C4.58804 2.38737 2.4987 4.47671 2.4987 7.05404C2.4987 9.63136 4.58804 11.7207 7.16536 11.7207C9.74269 11.7207 11.832 9.63136 11.832 7.05404C11.832 4.47671 9.74269 2.38737 7.16536 2.38737ZM1.33203 7.05404C1.33203 3.83238 3.9437 1.2207 7.16536 1.2207C10.387 1.2207 12.9987 3.83238 12.9987 7.05404C12.9987 10.2757 10.387 12.8874 7.16536 12.8874C3.9437 12.8874 1.33203 10.2757 1.33203 7.05404Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.58203 4.71634C6.58203 4.39417 6.8432 4.133 7.16536 4.133H7.1712C7.49336 4.133 7.75453 4.39417 7.75453 4.71634C7.75453 5.0385 7.49336 5.29967 7.1712 5.29967H7.16536C6.8432 5.29967 6.58203 5.0385 6.58203 4.71634Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.9987 7.05404C5.9987 6.73187 6.25986 6.4707 6.58203 6.4707H7.16536C7.48753 6.4707 7.7487 6.73187 7.7487 7.05404V8.80404C8.07086 8.80404 8.33203 9.0652 8.33203 9.38737C8.33203 9.70954 8.07086 9.9707 7.7487 9.9707H7.16536C6.8432 9.9707 6.58203 9.70954 6.58203 9.38737V7.63737C6.25986 7.63737 5.9987 7.3762 5.9987 7.05404Z"
                    fill="#6B7280"
                  />
                </svg>
                {emailInsightTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '17.65rem', // adjust this based on your layout
                      left: '49%',
                      transform: 'translateX(-50%)',
                      padding: '8px',
                      backgroundColor: '#333',
                      color: 'white',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: '500',
                      lineHeight: '16px',
                      width: '200px',
                      zIndex: 1,
                    }}
                  >
                    If turned on it tracks opens, clicks for emails sent from,
                    Gmail through this browser
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '64px',
                        left: '51%',
                        transform: 'rotate(180deg)',
                        width: '0',
                        height: '0',
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #333',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Email Tracking link svg */}
            <div
              onClick={() =>
                handleClick(
                  'https://pyxis.lifeisgoodforlearner.com/email-insights',
                )
              }
              onMouseEnter={() => setEmailReportTooltip(true)}
              onMouseLeave={() => setEmailReportTooltip(false)}
              style={{
                cursor: 'pointer',
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.75083 4.64633C3.1259 4.27126 3.63461 4.06055 4.16504 4.06055H7.49837C7.86656 4.06055 8.16504 4.35902 8.16504 4.72721C8.16504 5.0954 7.86656 5.39388 7.49837 5.39388H4.16504C3.98823 5.39388 3.81866 5.46412 3.69363 5.58914C3.56861 5.71417 3.49837 5.88374 3.49837 6.06055V12.0605C3.49837 12.2374 3.56861 12.4069 3.69363 12.532C3.81866 12.657 3.98823 12.7272 4.16504 12.7272H10.165C10.3419 12.7272 10.5114 12.657 10.6364 12.532C10.7615 12.4069 10.8317 12.2374 10.8317 12.0605V8.72721C10.8317 8.35902 11.1302 8.06055 11.4984 8.06055C11.8666 8.06055 12.165 8.35902 12.165 8.72721V12.0605C12.165 12.591 11.9543 13.0997 11.5793 13.4748C11.2042 13.8498 10.6955 14.0605 10.165 14.0605H4.16504C3.63461 14.0605 3.1259 13.8498 2.75083 13.4748C2.37575 13.0997 2.16504 12.591 2.16504 12.0605V6.06055C2.16504 5.53011 2.37575 5.02141 2.75083 4.64633Z"
                  fill="#D1D5DB"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.9698 2.25581C14.2301 2.51616 14.2301 2.93827 13.9698 3.19862L7.30311 9.86528C7.04276 10.1256 6.62065 10.1256 6.3603 9.86528C6.09995 9.60494 6.09995 9.18283 6.3603 8.92248L13.027 2.25581C13.2873 1.99546 13.7094 1.99546 13.9698 2.25581Z"
                  fill="#D1D5DB"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.49837 2.72721C9.49837 2.35902 9.79685 2.06055 10.165 2.06055H13.4984C13.8666 2.06055 14.165 2.35902 14.165 2.72721V6.06055C14.165 6.42874 13.8666 6.72721 13.4984 6.72721C13.1302 6.72721 12.8317 6.42874 12.8317 6.06055V3.39388H10.165C9.79685 3.39388 9.49837 3.0954 9.49837 2.72721Z"
                  fill="#D1D5DB"
                />
              </svg>
              {emailReportTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '17.65rem', // adjust this based on your layout
                    left: '63.65%',
                    transform: 'translateX(-50%)',
                    padding: '8px',
                    backgroundColor: '#333',
                    color: 'white',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    width: '200px',
                    zIndex: 1,
                  }}
                >
                  View email insight reports
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '32px',
                      left: '88%',
                      transform: 'rotate(180deg)',
                      width: '0',
                      height: '0',
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid #333',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Email Tracking on/off */}
          <div
            style={{
              padding: '0px 16px',
              width: '100%',
              marginBottom: '8px',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div
                style={{
                  height: '32px',
                  padding: '8px 0px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <img src={Gmail} alt="gmail" />
                  <div
                    style={{
                      fontWeight: '400',
                      fontSize: '14px',
                      lineHeight: '16px',
                      color: '#6B7280',
                    }}
                  >
                    Enable Email Tracker
                  </div>
                </div>
                <div style={{ alignSelf: 'normal' }}>
                  <Switch
                    checked={mailboxSetting}
                    onChange={handleTrackingSetting}
                    size={Switch.Size.Small}
                    disabled={!authenticated}
                    tooltip={authenticated ? '' : 'Login to change the setting'}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {mailboxSetting && (
                  <div
                    style={{
                      display: 'flex',
                      background: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      gap: '4px',
                    }}
                  >
                    <div className="d-flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.00016 2.66732C5.05464 2.66732 2.66683 5.05513 2.66683 8.00065C2.66683 10.9462 5.05464 13.334 8.00016 13.334C10.9457 13.334 13.3335 10.9462 13.3335 8.00065C13.3335 5.05513 10.9457 2.66732 8.00016 2.66732ZM1.3335 8.00065C1.3335 4.31875 4.31826 1.33398 8.00016 1.33398C11.6821 1.33398 14.6668 4.31875 14.6668 8.00065C14.6668 11.6826 11.6821 14.6673 8.00016 14.6673C4.31826 14.6673 1.3335 11.6826 1.3335 8.00065Z"
                          fill="#2563EB"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.3335 5.32899C7.3335 4.9608 7.63197 4.66233 8.00016 4.66233H8.00683C8.37502 4.66233 8.6735 4.9608 8.6735 5.32899C8.6735 5.69718 8.37502 5.99566 8.00683 5.99566H8.00016C7.63197 5.99566 7.3335 5.69718 7.3335 5.32899Z"
                          fill="#2563EB"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.66683 8.00065C6.66683 7.63246 6.96531 7.33398 7.3335 7.33398H8.00016C8.36835 7.33398 8.66683 7.63246 8.66683 8.00065V10.0007C9.03502 10.0007 9.3335 10.2991 9.3335 10.6673C9.3335 11.0355 9.03502 11.334 8.66683 11.334H8.00016C7.63197 11.334 7.3335 11.0355 7.3335 10.6673V8.66732C6.96531 8.66732 6.66683 8.36884 6.66683 8.00065Z"
                          fill="#2563EB"
                        />
                      </svg>
                    </div>
                    <div
                      style={{
                        alignItems: 'center',
                        fontSize: '12px',
                        fontWeight: '400',
                        lineHeight: '16px',
                        fontStyle: 'normal',
                      }}
                    >
                      <span>{emailTrackingSentence}</span>
                      {emailAccountTooltip && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '16.85rem', // adjust this based on your layout
                            left: '52%',
                            transform: 'translateX(-50%)',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: 'white',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontWeight: '500',
                            lineHeight: '16px',
                            width: 'auto',
                            height: 'auto',
                            wordWrap: 'break-word',
                            zIndex: 1,
                          }}
                        >
                          {mailboxList.map((emails) => (
                            <>
                              {emails},
                              <br />
                            </>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Notification on/off */}
                <div
                  style={{
                    height: '32px',
                    padding: '8px 0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.1651 2.72201C7.98829 2.72201 7.81872 2.79224 7.6937 2.91727C7.57113 3.03983 7.50122 3.2052 7.49852 3.37823C7.50048 3.50842 7.46405 3.63624 7.39506 3.7454C7.34497 3.82466 7.27772 3.89409 7.19552 3.94745C7.1666 3.96631 7.13613 3.98299 7.10433 3.99725C6.45346 4.30776 5.89855 4.7885 5.49843 5.38867C5.09856 5.98849 4.86826 6.68513 4.83177 7.40491V9.38867C4.83177 9.41545 4.83015 9.4422 4.82694 9.46878C4.77343 9.91078 4.63204 10.3368 4.41191 10.722H11.9183C11.6982 10.3368 11.5568 9.91078 11.5033 9.46878C11.5 9.4422 11.4984 9.41545 11.4984 9.38867V7.40491C11.4619 6.68514 11.2316 5.98849 10.8318 5.38867C10.4291 4.78469 9.86969 4.30166 9.21345 3.99136C8.9804 3.88116 8.83177 3.64647 8.83177 3.38867C8.83177 3.21186 8.76153 3.04229 8.6365 2.91727C8.51148 2.79224 8.34191 2.72201 8.1651 2.72201ZM6.21176 2.95915C6.29314 2.58907 6.47876 2.24659 6.75089 1.97446C7.12596 1.59939 7.63467 1.38867 8.1651 1.38867C8.69553 1.38867 9.20424 1.59939 9.57931 1.97446C9.85144 2.24659 10.0371 2.58907 10.1184 2.95915C10.8491 3.37016 11.4742 3.94861 11.9412 4.64907C12.478 5.45438 12.7857 6.39061 12.831 7.35741C12.8315 7.36783 12.8318 7.37825 12.8318 7.38867V9.34557C12.8734 9.64302 12.9816 9.92745 13.1483 10.1776C13.322 10.4382 13.5545 10.6543 13.8269 10.8086C14.0904 10.9578 14.2202 11.2657 14.1431 11.5585C14.066 11.8513 13.8012 12.0553 13.4984 12.0553H2.83177C2.529 12.0553 2.26424 11.8513 2.1871 11.5585C2.10996 11.2657 2.2398 10.9578 2.50326 10.8086C2.77573 10.6543 3.00817 10.4382 3.18186 10.1776C3.34864 9.92745 3.45678 9.64302 3.49843 9.34557V7.38867C3.49843 7.37825 3.49868 7.36783 3.49917 7.35741C3.54455 6.39061 3.85216 5.45438 4.38903 4.64907C4.85601 3.94861 5.48112 3.37016 6.21176 2.95915Z"
                        fill="#6B7280"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.1651 10.7245C6.53329 10.7245 6.83177 11.023 6.83177 11.3912V12.0578C6.83177 12.4115 6.97224 12.7506 7.22229 13.0006C7.47234 13.2507 7.81148 13.3912 8.1651 13.3912C8.51872 13.3912 8.85786 13.2507 9.10791 13.0006C9.35796 12.7506 9.49843 12.4115 9.49843 12.0578V11.3912C9.49843 11.023 9.79691 10.7245 10.1651 10.7245C10.5333 10.7245 10.8318 11.023 10.8318 11.3912V12.0578C10.8318 12.7651 10.5508 13.4434 10.0507 13.9435C9.55062 14.4436 8.87234 14.7245 8.1651 14.7245C7.45786 14.7245 6.77958 14.4436 6.27948 13.9435C5.77938 13.4434 5.49843 12.7651 5.49843 12.0578V11.3912C5.49843 11.023 5.79691 10.7245 6.1651 10.7245Z"
                        fill="#6B7280"
                      />
                    </svg>
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Enable Tracking Notification
                    </div>
                  </div>
                  <div style={{ alignSelf: 'normal' }}>
                    <Switch
                      checked={desktopNotification}
                      onChange={handleNotificationSetting}
                      size={Switch.Size.Small}
                      disabled={!authenticated}
                      tooltip={
                        authenticated ? '' : 'Login to change the setting'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
