/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { Switch } from '@saleshandy/designs';
import Main from './main';
import Gmail from '../assets/icons/gmail.svg';
import mailboxInstance from '../config/server/tracker/mailbox';

const Profile = () => {
  const [logout, setLogout] = useState(false);
  const [isBackClicked, setIsClicked] = useState(false);
  const [nameInitials, setNameInitials] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mailboxSetting, setMailboxSetting] = useState(false);
  const [desktopNotification, setDesktopNotification] = useState(false);
  const [newMailboxId, setMailboxId] = useState();
  const [mailboxEmail, setMailboxEmail] = useState('');
  const [newUserId, setUserId] = useState();
  const [mailboxList, setMailboxList] = useState([]);
  const [emailAccountTooltip, setEmailAccountTooltip] = useState(false);
  const [emailTrackingSentence, setEmailTrackingSentence] = useState('');

  const handledLogout = () => {
    chrome.storage.local.set({ logoutTriggered: 'true' });
    setLogout(true);
  };

  const handledBack = () => {
    setIsClicked(true);
  };

  const removeUnwantedIds = () => {
    const findOne = document.getElementById('common-screen-id');
    if (findOne) {
      findOne.style.display = 'none';
    } else {
      const findTwo = document.getElementById('common-search-id');
      if (findTwo) {
        findTwo.style.display = 'none';
      } else {
        const findThree = document.getElementById('prospect-list-container');
        if (findThree) {
          findThree.style.display = 'none';
        } else {
          const findFour = document.getElementById('single-profile-container');
          if (findFour) {
            findFour.style.display = 'none';
          } else {
            const findFive = document.getElementById('no-result-container');
            if (findFive) {
              findFive.style.display = 'none';
            }
          }
        }
      }
    }
  };

  const fetchSetting = () => {
    chrome.storage.local.get(['activeUrl'], async (result) => {
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
          }
        });
        setEmailTrackingSentence(
          `Email tracking for ${request.mailboxEmail} is turned on`,
        );
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
            console.debug('tracking', trackingEmails);

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
    chrome.storage.local.get(['activeUrl'], async (result) => {
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

  const handleClick = (link) => {
    chrome.runtime.sendMessage({
      method: 'openNewPage',
      link,
    });
  };

  const handleMetaData = () => {
    chrome.storage.local.get(['saleshandyMetaData'], (request) => {
      const metaData = request?.saleshandyMetaData;

      if (metaData) {
        setEmail(metaData.user.email);
        setName(`${metaData.user?.firstName} ${metaData.user?.lastName}`);
        const initials = `${metaData.user?.firstName[0]}${metaData.user?.lastName[0]}`;
        setNameInitials(initials);
      }
    });
  };

  useEffect(() => {
    removeUnwantedIds();
    handleMetaData();
    fetchSetting();
    fetchNotificationSetting();
  }, []);

  return (
    <>
      {logout || isBackClicked ? (
        <Main />
      ) : (
        <>
          {/* Header Section (Back Button) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: '16px 0px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '0px 16px 12px 16px',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <div
                className="button-hover-effect"
                onClick={handledBack}
                style={{ cursor: 'pointer' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.165039 2.05469C0.165039 0.950118 1.06047 0.0546875 2.16504 0.0546875H14.165C15.2696 0.0546875 16.165 0.950118 16.165 2.05469V14.0547C16.165 15.1593 15.2696 16.0547 14.165 16.0547H2.16504C1.06047 16.0547 0.165039 15.1593 0.165039 14.0547V2.05469Z"
                    fill="none"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.83203 8.05545C2.83203 7.68726 3.13051 7.38878 3.4987 7.38878H12.832C13.2002 7.38878 13.4987 7.68726 13.4987 8.05545C13.4987 8.42364 13.2002 8.72211 12.832 8.72211H3.4987C3.13051 8.72211 2.83203 8.42364 2.83203 8.05545Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.02729 7.58404C3.28764 7.32369 3.70975 7.32369 3.9701 7.58404L6.63677 10.2507C6.89712 10.5111 6.89712 10.9332 6.63677 11.1935C6.37642 11.4539 5.95431 11.4539 5.69396 11.1935L3.02729 8.52685C2.76694 8.2665 2.76694 7.84439 3.02729 7.58404Z"
                    fill="#6B7280"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.63677 4.91987C6.89712 5.18022 6.89712 5.60233 6.63677 5.86268L3.9701 8.52935C3.70975 8.7897 3.28764 8.7897 3.02729 8.52935C2.76694 8.269 2.76694 7.84689 3.02729 7.58654L5.69396 4.91987C5.95431 4.65952 6.37642 4.65952 6.63677 4.91987Z"
                    fill="#6B7280"
                  />
                </svg>
              </div>
            </div>
            {/* Profile Section */}
            <div
              style={{
                padding: '0px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              {/* Profile Section */}
              <div
                className="text-center"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  height: '76px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    padding: '15px 15px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid #DBEAFE',
                  }}
                >
                  <span
                    style={{
                      fontWeight: '500',
                      fontSize: '12px',
                      fontFamily: 'Inter',
                      lineHeight: '16px',
                      color: '#1D4ED8',
                    }}
                  >
                    {nameInitials}
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter',
                      color: '#1F2937',
                      fontWeight: '600',
                      lineHeight: '20px',
                      marginBottom: '0px',
                    }}
                  >
                    {name}
                  </h2>
                  <p
                    style={{
                      fontSize: '12px',
                      fontFamily: 'Inter',
                      lineHeight: '16px',
                      color: '#6B7280',
                      fontWeight: '500',
                      marginBottom: '0px',
                    }}
                  >
                    {email}
                  </p>
                </div>
              </div>
              {/* Credits Promotion */}
              <div
                style={{
                  width: '300px',
                  height: '164px',
                  padding: '16px 12px',
                  backgroundColor: '#EEF2FF',
                  borderRadius: '4px',
                  display: 'flex',
                  gap: '8px',
                  border: '1px solid #E0E7FF',
                }}
              >
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
                    d="M8.16471 1.38867C8.5329 1.38867 8.83138 1.68715 8.83138 2.05534V2.72201C8.83138 3.0902 8.5329 3.38867 8.16471 3.38867C7.79652 3.38867 7.49805 3.0902 7.49805 2.72201V2.05534C7.49805 1.68715 7.79652 1.38867 8.16471 1.38867ZM3.42664 3.31727C3.68699 3.05692 4.1091 3.05692 4.36945 3.31727L4.83612 3.78393C5.09647 4.04428 5.09647 4.46639 4.83612 4.72674C4.57577 4.98709 4.15366 4.98709 3.89331 4.72674L3.42664 4.26008C3.16629 3.99973 3.16629 3.57762 3.42664 3.31727ZM12.9028 3.31727C13.1631 3.57762 13.1631 3.99973 12.9028 4.26008L12.4361 4.72674C12.1758 4.98709 11.7537 4.98709 11.4933 4.72674C11.233 4.46639 11.233 4.04428 11.4933 3.78393L11.96 3.31727C12.2203 3.05692 12.6424 3.05692 12.9028 3.31727ZM1.49805 8.05534C1.49805 7.68715 1.79652 7.38867 2.16471 7.38867H2.83138C3.19957 7.38867 3.49805 7.68715 3.49805 8.05534C3.49805 8.42353 3.19957 8.72201 2.83138 8.72201H2.16471C1.79652 8.72201 1.49805 8.42353 1.49805 8.05534ZM12.8314 8.05534C12.8314 7.68715 13.1299 7.38867 13.498 7.38867H14.1647C14.5329 7.38867 14.8314 7.68715 14.8314 8.05534C14.8314 8.42353 14.5329 8.72201 14.1647 8.72201H13.498C13.1299 8.72201 12.8314 8.42353 12.8314 8.05534Z"
                    fill="#4F46E5"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.16471 5.38618C7.60503 5.38618 7.05953 5.56228 6.60549 5.88953C6.15144 6.21678 5.81188 6.6786 5.63489 7.20957C5.4579 7.74054 5.45246 8.31373 5.61934 8.84796C5.78524 9.37903 6.11306 9.84482 6.55678 10.1802C6.57161 10.191 6.5861 10.2025 6.6002 10.2147C6.61511 10.2275 6.62932 10.2409 6.64283 10.2548C6.97295 10.5844 7.2217 10.9864 7.36926 11.4291C7.51178 11.8567 7.55606 12.3106 7.49911 12.7572C7.50835 12.9203 7.5772 13.0748 7.69331 13.1909C7.81833 13.3159 7.9879 13.3862 8.16471 13.3862C8.34152 13.3862 8.51109 13.3159 8.63612 13.1909C8.75222 13.0748 8.82108 12.9203 8.83031 12.7572C8.77337 12.3106 8.81764 11.8567 8.96017 11.4291C9.10908 10.9824 9.36106 10.577 9.69571 10.2457C9.71733 10.2243 9.74038 10.2044 9.76471 10.1862C10.2125 9.85036 10.5432 9.38218 10.7101 8.84796C10.877 8.31373 10.8715 7.74054 10.6945 7.20957C10.5175 6.6786 10.178 6.21678 9.72394 5.88953C9.2699 5.56228 8.7244 5.38618 8.16471 5.38618ZM5.72364 11.2216C5.07286 10.7203 4.59185 10.0304 4.34666 9.24551C4.09634 8.44417 4.1045 7.58438 4.36998 6.78793C4.63546 5.99148 5.14481 5.29876 5.82587 4.80787C6.50693 4.31699 7.32518 4.05284 8.16471 4.05284C9.00424 4.05284 9.82249 4.31699 10.5036 4.80787C11.1846 5.29876 11.694 5.99148 11.9594 6.78793C12.2249 7.58438 12.2331 8.44417 11.9828 9.24551C11.7376 10.0304 11.2566 10.7203 10.6058 11.2216C10.4337 11.4003 10.3036 11.6152 10.2251 11.8507C10.1424 12.0989 10.1192 12.3631 10.1575 12.6219C10.1623 12.6542 10.1647 12.6868 10.1647 12.7195C10.1647 13.2499 9.954 13.7587 9.57893 14.1337C9.20385 14.5088 8.69515 14.7195 8.16471 14.7195C7.63428 14.7195 7.12557 14.5088 6.7505 14.1337C6.37543 13.7587 6.16471 13.2499 6.16471 12.7195C6.16471 12.6868 6.16712 12.6542 6.1719 12.6219C6.21021 12.3631 6.18707 12.0989 6.10434 11.8507C6.02581 11.6152 5.89568 11.4002 5.72364 11.2216Z"
                    fill="#4F46E5"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.96471 11.3912C5.96471 11.023 6.26319 10.7245 6.63138 10.7245H9.69805C10.0662 10.7245 10.3647 11.023 10.3647 11.3912C10.3647 11.7594 10.0662 12.0578 9.69805 12.0578H6.63138C6.26319 12.0578 5.96471 11.7594 5.96471 11.3912Z"
                    fill="#4F46E5"
                  />
                </svg>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '252px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignContent: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#1F2937',
                      }}
                    >
                      Get 500 Credits worth $15 for Free!
                    </span>
                    <div
                      style={{
                        fontWeight: '400',
                        fontFamily: 'Inter',
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Leave a review on G2.com & <br />{' '}
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdnObefoF5Bct-e8kV8gs3EfRHI1thjHXcVnLqgGtkVw34tlw/viewform"
                        target="_blank"
                        style={{
                          textDecoration: 'none',
                          color: '#1D4ED8',
                          fontWeight: '500',
                          fontFamily: 'Inter',
                        }}
                        rel="noreferrer"
                      >
                        {' '}
                        Submit a screenshot{' '}
                      </a>
                      of your review, we'll <br /> thank you with 500 FREE Lead
                      Finder <br /> Credits!{' '}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleClick(
                        'https://www.g2.com/products/saleshandy/reviews/start',
                      )
                    }
                    style={{
                      height: '32px',
                      width: '165px',
                      backgroundColor: '#1D4ED8',
                      color: 'white',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      fontFamily: 'Inter',
                      lineHeight: '20px',
                      border: 'none',
                    }}
                  >
                    Unlock Your Credits
                  </button>
                </div>
              </div>
              {/* Divider */}
              <div
                style={{
                  borderTop: '1px solid #F3F4F6',
                  width: '300px',
                }}
              />
              {/* Saleshandy Platform */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    lineHeight: '16px',
                    color: '#1F2937',
                  }}
                >
                  Saleshandy Platform
                </div>
                <div
                  style={{
                    width: '300px',
                    height: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
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
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      View Lead Finder
                    </div>
                  </div>
                  <div
                    className="button-hover-effect"
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
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
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
                <div
                  style={{
                    width: '100%',
                    height: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
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
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      View Prospects
                    </div>
                  </div>
                  <div
                    className="button-hover-effect"
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
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
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
                <div
                  style={{
                    width: '300px',
                    height: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
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
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Sequence
                    </div>
                  </div>
                  <div
                    className="button-hover-effect"
                    onClick={() =>
                      handleClick(
                        'https://pyxis.lifeisgoodforlearner.com/sequence',
                      )
                    }
                    style={{
                      cursor: 'pointer',
                    }}
                  >
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
                  borderTop: '1px solid #F3F4F6',
                  width: '300px',
                }}
              />
              {/* Email Tracking Insights */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '16px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#1F2937',
                      display: 'flex',
                      gap: '4px',
                    }}
                  >
                    Email Tracking Insights
                    <div className="tooltip-container">
                      <div
                        style={{
                          cursor: 'pointer',
                        }}
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
                      </div>
                      <div className="custom-tooltip tooltip-bottom email-tracking-tooltip">
                        This email tracking only works for the Gmail account in
                        which you are logged in.
                      </div>
                    </div>
                  </div>

                  <div className="tooltip-container">
                    <div
                      className="button-hover-effect"
                      onClick={() =>
                        handleClick(
                          'https://pyxis.lifeisgoodforlearner.com/email-insights',
                        )
                      }
                      style={{
                        cursor: 'pointer',
                      }}
                    >
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
                    <div className="custom-tooltip tooltip-bottom email-insight-tooltip">
                      View email insight reports
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: '300px',
                    height: '20px',
                    display: 'flex',
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
                    <div className="icon" style={{ alignSelf: 'flex-end' }}>
                      <img src={Gmail} alt="gmail" />
                    </div>
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: '14px',
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Enable Email Tracker
                    </div>
                  </div>
                  <div className="custom-switch">
                    <Switch
                      checked={mailboxSetting}
                      onChange={handleTrackingSetting}
                      size={Switch.Size.Small}
                    />
                  </div>
                </div>
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
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        fontStyle: 'normal',
                      }}
                    >
                      <span>{emailTrackingSentence}</span>
                      {emailAccountTooltip && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '31.65rem', // adjust this based on your layout
                            left: '56%',
                            transform: 'translateX(-50%)',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: 'white',
                            borderRadius: '5px',
                            fontSize: '12px',
                            fontWeight: '500',
                            fontFamily: 'Inter',
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
                <div
                  style={{
                    width: '300px',
                    height: '20px',
                    display: 'flex',
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
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
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
                        fontFamily: 'Inter',
                        lineHeight: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Enable Tracking Notification
                    </div>
                  </div>
                  <div className="custom-switch">
                    <Switch
                      checked={desktopNotification}
                      onChange={handleNotificationSetting}
                      size={Switch.Size.Small}
                    />
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div
                style={{
                  borderTop: '1px solid #F3F4F6',
                  width: '300px',
                }}
              />
              {/* YT video */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: '4px',
                  height: '16px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    lineHeight: '16px',
                    color: '#1F2937',
                  }}
                >
                  How to use Extension
                </div>
                <div
                  // style={{ position: 'absolute', top: '627px', left: '145px' }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleClick(
                      'https://pyxis.lifeisgoodforlearner.com/leads#people',
                    );
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.28729 5.02524C1.35156 4.03585 2.14701 3.26047 3.13727 3.21141C4.57123 3.14037 6.62078 3.05469 8.16504 3.05469C9.7093 3.05469 11.7588 3.14037 13.1928 3.21141C14.1831 3.26047 14.9785 4.03585 15.0428 5.02524C15.1044 5.97315 15.165 7.13952 15.165 8.05469C15.165 8.96986 15.1044 10.1362 15.0428 11.0841C14.9785 12.0735 14.1831 12.8489 13.1928 12.898C11.7588 12.969 9.7093 13.0547 8.16504 13.0547C6.62078 13.0547 4.57123 12.969 3.13727 12.898C2.14701 12.8489 1.35156 12.0735 1.28729 11.0841C1.22572 10.1362 1.16504 8.96986 1.16504 8.05469C1.16504 7.13952 1.22572 5.97315 1.28729 5.02524Z"
                      fill="#FC0D1B"
                    />
                    <path
                      d="M6.66504 6.05469V10.0547L10.665 8.05469L6.66504 6.05469Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
              {/* Logout */}
              <div
                onClick={handledLogout}
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    lineHeight: '16px',
                    color: '#1F2937',
                  }}
                >
                  Log Out
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
