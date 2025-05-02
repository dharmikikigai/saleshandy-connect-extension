/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import ENV_CONFIG from '../config/env';
import { redirectFromProfilePageState } from './state';

const Profile = () => {
  const [logout, setLogout] = useState(false);
  const [isBackClicked, setIsClicked] = useState(false);
  const [nameInitials, setNameInitials] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [redirectFromProfilePage, setRedirectFromProfilePage] = useRecoilState(
    redirectFromProfilePageState,
  );

  const handledLogout = () => {
    chrome.storage.local.set({ logoutTriggered: 'true' });
    setRedirectFromProfilePage(true);
    setLogout(true);
  };

  const handledBack = () => {
    setIsClicked(true);
    setRedirectFromProfilePage(true);
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
    handleMetaData();
  }, []);

  return (
    <>
      {logout || isBackClicked ? null : (
        <>
          {/* Header Section (Back Button) */}
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '0px 16px 12px 16px',
                borderBottom: '1px solid #E5E7EB',
                marginTop: '16px',
              }}
            >
              <div
                className="button-hover-effect"
                onClick={handledBack}
                style={{ cursor: 'pointer', padding: '2px 0px' }}
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
                maxHeight: '731px',
                overflowY: 'scroll',
                overflowX: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0px 16px 16px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '16px',
                  marginRight: '-5px',
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
                        of your review, we'll <br /> thank you with 500 FREE
                        Lead Finder <br /> Credits!{' '}
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
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '12px',
                      fontFamily: 'Inter',
                      lineHeight: '16px',
                      color: '#1F2937',
                      padding: '16px 16px 8px 16px',
                    }}
                  >
                    Saleshandy Platform
                  </div>
                  <div
                    className="popup-platform-item"
                    style={{
                      width: '332px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
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
                      onClick={() =>
                        handleClick(`${ENV_CONFIG.WEB_APP_URL}/leads#people`)
                      }
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
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
                    className="popup-platform-item"
                    style={{
                      width: '332px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
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
                      onClick={() =>
                        handleClick(`${ENV_CONFIG.WEB_APP_URL}/prospects`)
                      }
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
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
                    className="popup-platform-item"
                    style={{
                      width: '332px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 16px',
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
                      onClick={() =>
                        handleClick(`${ENV_CONFIG.WEB_APP_URL}/sequence`)
                      }
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
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
                        'https://www.youtube.com/watch?v=_bpZWMKkTIg',
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
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
