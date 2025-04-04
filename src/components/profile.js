/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { Switch } from '@saleshandy/designs';
import Main from './main';
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

  const handledLogout = () => {
    localStorage.setItem('logoutTriggered', 'true');
    setLogout(true);
  };

  const handledBack = () => {
    setIsClicked(true);
  };

  const getNameInitials = () => {
    const nameInitial = localStorage.getItem('nameInitials');
    if (nameInitial && nameInitial !== '') {
      setNameInitials(nameInitial);
    } else {
      setNameInitials('NA');
    }
  };

  const getName = () => {
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');

    setName(`${firstName} ${lastName}`);
  };

  const getEmail = () => {
    const userEmail = localStorage.getItem('userEmail');

    setEmail(userEmail);
  };

  const newOne = () => {
    const findOne = document.getElementById('common-screen-id');
    findOne.style.display = 'none';
  };

  const fetchSetting = () => {
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
  };

  const handleTrackingSetting = async () => {
    const trackingSetting = (
      await mailboxInstance.updateMailboxSetting(
        {
          isTrackingEnabled: !mailboxSetting,
        },
        newMailboxId,
      )
    ).payload;

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
  };

  const fetchNotificationSetting = async () => {
    const notificationSetting = (
      await mailboxInstance.fetchNotificationSetting()
    ).payload;
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

    await mailboxInstance.updateNotificationSetting({
      settings: [{ code: 'desktop_notification', value: code }],
    });

    setDesktopNotification(!desktopNotification);
  };

  useEffect(() => {
    newOne();
    getNameInitials();
    getName();
    getEmail();
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
            onClick={handledBack}
            className="d-flex  mb-4"
            style={{
              position: 'absolute',
              top: '15px',
              width: '332px',
              height: '35px',
              borderBottom: '2px solid #E5E7EB',
            }}
          >
            <div style={{ position: 'absolute', left: '18px' }}>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.832031 4.05545C0.832031 3.68726 1.13051 3.38878 1.4987 3.38878H10.832C11.2002 3.38878 11.4987 3.68726 11.4987 4.05545C11.4987 4.42364 11.2002 4.72211 10.832 4.72211H1.4987C1.13051 4.72211 0.832031 4.42364 0.832031 4.05545Z"
                  fill="#6B7280"
                />
                <path
                  fillRule-rule="evenodd"
                  clipRule="evenodd"
                  d="M1.02729 3.58404C1.28764 3.32369 1.70975 3.32369 1.9701 3.58404L4.63677 6.25071C4.89712 6.51106 4.89712 6.93317 4.63677 7.19352C4.37642 7.45387 3.95431 7.45387 3.69396 7.19352L1.02729 4.52685C0.766944 4.2665 0.766944 3.84439 1.02729 3.58404Z"
                  fill="#6B7280"
                />
                <path
                  fill-fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.63677 0.919872C4.89712 1.18022 4.89712 1.60233 4.63677 1.86268L1.9701 4.52935C1.70975 4.7897 1.28764 4.7897 1.02729 4.52935C0.766944 4.269 0.766944 3.84689 1.02729 3.58654L3.69396 0.919871C3.95431 0.659522 4.37642 0.659522 4.63677 0.919872Z"
                  fill="#6B7280"
                />
              </svg>
            </div>
          </div>
          {/* Profile Section */}
          <div style={{ marginTop: '13%' }}>
            {/* Profile Section */}
            <div className="p-4 text-center">
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  marginLeft: '35%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid #DBEAFE',
                }}
              >
                <span
                  style={{
                    fontWeight: '500',
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#1D4ED8',
                  }}
                >
                  {nameInitials}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '14px',
                  color: '#1F2937',
                  fontWeight: '600',
                  marginTop: '8px',
                }}
              >
                {name}
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  lineHeight: '3px',
                  color: '#6B7280',
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
              marginTop: '1%',
              backgroundColor: '#EEF2FF',
              borderRadius: '4px',
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '12px',
              paddingRight: '12px',
              border: '1px solid #E0E7FF',
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
                fontWeight: '600',
                fontSize: '12px',
                lineHeight: '16px',
                color: '#1F2937',
                position: 'absolute',
                top: '200px',
                left: '55px',
              }}
            >
              Get 500 Credits worth $15 for Free!
            </div>
            <div
              style={{
                fontWeight: '400',
                fontSize: '12px',
                lineHeight: '18px',
                color: '#1F2937',
                position: 'absolute',
                top: '218px',
                left: '43px',
                paddingRight: '12px',
                paddingLeft: '12px',
              }}
            >
              Leave a review on G2.com & <br />{' '}
              <a
                href="saleshandy.com"
                target="_blank"
                style={{ textDecoration: 'none', color: '#1D4ED8' }}
              >
                {' '}
                Submit a screenshot{' '}
              </a>
              of your review, we'll thank you with 500 FREE Lead Finder <br />{' '}
              Credits!{' '}
            </div>
            <button
              type="button"
              style={{
                height: '32px',
                width: '165px',
                backgroundColor: '#1D4ED8',
                color: 'white',
                borderRadius: '4px',
                position: 'absolute',
                top: '300px',
                left: '54px',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              Unlock Your Credits
            </button>
          </div>
          {/* Divider */}
          <div
            style={{
              marginTop: '5%',
              border: '1.2px solid #F3F4F6',
              width: '300px',
            }}
          />
          {/* Saleshandy Platform */}
          <div style={{ marginTop: '2%' }}>
            <div
              style={{
                fontWeight: '500',
                fontSize: '12px',
                lineHeight: '16px',
                color: '#1F2937',
                marginTop: '5px',
                position: 'absolute',
                left: '15px',
              }}
            >
              Saleshandy Platform
            </div>
            <div style={{ width: '300px', height: '16px', marginTop: '13px' }}>
              <div style={{ marginTop: '38px' }}>
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
              </div>
              <div
                style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6B7280',
                  position: 'absolute',
                  top: '408px',
                  left: '40px',
                }}
              >
                View Lead Finder
              </div>
              <div
                style={{ position: 'absolute', top: '408px', right: '20px' }}
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
            <div style={{ width: '300px', height: '16px', marginTop: '14px' }}>
              <div>
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
              </div>
              <div
                style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6B7280',
                  position: 'absolute',
                  top: '438px',
                  left: '40px',
                }}
              >
                View Prospects
              </div>
              <div
                style={{ position: 'absolute', top: '438px', right: '20px' }}
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
            <div style={{ width: '300px', height: '16px', marginTop: '15px' }}>
              <div>
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
              </div>
              <div
                style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6B7280',
                  position: 'absolute',
                  top: '468px',
                  left: '40px',
                }}
              >
                Sequence
              </div>
              <div
                style={{ position: 'absolute', top: '468px', right: '20px' }}
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
              marginTop: '5%',
              border: '1.2px solid #F3F4F6',
              width: '300px',
            }}
          />
          {/* Email Tracking Insights */}
          <div style={{ marginTop: '2%' }}>
            <div
              style={{
                fontWeight: '500',
                fontSize: '12px',
                lineHeight: '16px',
                color: '#1F2937',
                marginTop: '5px',
                position: 'absolute',
                left: '15px',
              }}
            >
              Email Tracking Insights
            </div>
            <div style={{ position: 'absolute', top: '516px', left: '153px' }}>
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
            </div>
            <div style={{ position: 'absolute', top: '516px', right: '20px' }}>
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
            <div style={{ width: '300px', height: '16px', marginTop: '13px' }}>
              <div
                style={{
                  position: 'absolute',
                  right: '278px',
                  marginTop: '2px',
                }}
              >
                <svg
                  width="68"
                  height="68"
                  viewBox="0 0 68 68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="29.832"
                    y="24.3887"
                    width="14.6667"
                    height="13.3333"
                    fill="url(#pattern0_35772_64538)"
                  />
                  <defs>
                    <pattern
                      id="pattern0_35772_64538"
                      patternContentUnits="objectBoundingBox"
                      width="1"
                      height="1"
                    >
                      <use
                        xlinkHref="#image0_35772_64538"
                        transform="matrix(0.00327628 0 0 0.00355872 -0.31907 0)"
                      />
                    </pattern>
                    <image
                      id="image0_35772_64538"
                      width="500"
                      height="281"
                      preserveAspectRatio="none"
                      xlinkHref="data:image/png;base64,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"
                    />
                  </defs>
                </svg>
              </div>
              <div
                style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6B7280',
                  position: 'absolute',
                  top: '548px',
                  left: '40px',
                }}
              >
                Enable Email Tracker
              </div>
              <div
                style={{ position: 'absolute', top: '510px', right: '15px' }}
              >
                <Switch
                  checked={mailboxSetting}
                  onChange={handleTrackingSetting}
                  size={Switch.Size.Small}
                />
              </div>
            </div>
            <div style={{ width: '300px', height: '16px', marginTop: '14px' }}>
              <div style={{ position: 'absolute', top: '580px', left: '14px' }}>
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
              </div>
              <div
                style={{
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '16px',
                  color: '#6B7280',
                  position: 'absolute',
                  top: '580px',
                  left: '40px',
                }}
              >
                Enable Tracking Notification
              </div>
              <div
                style={{ position: 'absolute', top: '550px', right: '15px' }}
              >
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
              marginTop: '13%',
              border: '1.2px solid #F3F4F6',
              width: '300px',
            }}
          />
          {/* YT video */}
          <div style={{ width: '300px', marginTop: '12px' }}>
            <div
              style={{
                fontWeight: '500',
                fontSize: '12px',
                lineHeight: '16px',
                color: '#1F2937',
              }}
            >
              How to use Extension
            </div>
            <div style={{ position: 'absolute', top: '627px', left: '145px' }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
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
            style={{ width: '300px', marginTop: '12px' }}
          >
            <div
              style={{
                fontWeight: '500',
                fontSize: '12px',
                lineHeight: '16px',
                color: '#1F2937',
              }}
            >
              Log Out
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
