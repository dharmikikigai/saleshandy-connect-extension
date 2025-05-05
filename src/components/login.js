/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { loginState } from './state';
import Main from './main';
import saleshandyLogo from '../assets/icons/saleshandyLogo.svg';
import minus from '../assets/icons/minus.svg';
import ENV_CONFIG from '../config/env';

const handleClose = () => {
  chrome.runtime.sendMessage({
    method: 'closeIframe',
  });
};

const Login = () => {
  const [showMainPage, setShowMainPage] = useState(false);
  const [isLogin, setIsLogin] = useRecoilState(loginState);

  const handleClick = () => {
    chrome.storage.local.set({ logoutTriggered: 'false' });

    chrome.storage.local.get(['authToken'], (result) => {
      const authenticationToken = result?.authToken;

      if (
        authenticationToken !== undefined &&
        authenticationToken !== null &&
        authenticationToken !== ''
      ) {
        setShowMainPage(true);
        setIsLogin(true);
      } else {
        chrome.runtime.sendMessage({
          method: 'openNewPage',
          link: `${ENV_CONFIG.WEB_APP_URL}/login`,
        });
      }
    });
  };

  return (
    <>
      {showMainPage ? null : (
        <>
          <div
            id="login-id"
            style={{
              background:
                'var(--blue-gra, linear-gradient(246deg, #DCE1FE 3.34%, #EFF2FE 87.55%))',
              height: '780px',
              width: '332px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 16px 0px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <img src={saleshandyLogo} alt="saleshandyLogo" />
              <div
                style={{
                  display: 'flex',
                  cursor: 'pointer',
                }}
                onClick={handleClose}
              >
                <img src={minus} alt="minus" />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                flex: 1,
              }}
            >
              <Container
                fluid
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '284px',
                  //  marginTop: '35%',
                  // padding: '30px'
                }}
              >
                <Card
                  className="border-0 shadow-sm"
                  style={{
                    borderRadius: '8px',
                    padding: '32px 16px',
                    minWidth: '284px',
                  }}
                >
                  <Card.Body style={{ padding: '0px' }}>
                    <div style={{ borderRadius: '7px' }}>
                      <div
                        className="text-center"
                        style={{ marginBottom: '24px' }}
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_35895_50282)">
                            <path
                              d="M8.55222 0.210938C7.36435 0.210938 6.76946 1.62823 7.60941 2.45713L29.7238 24.2805C30.5637 25.1094 31.9999 24.5223 31.9999 23.3501V1.52672C31.9999 0.800036 31.403 0.210938 30.6666 0.210938H8.55222Z"
                              fill="#1D4ED8"
                            />
                            <path
                              d="M15.6262 28.7894C16.2561 29.4111 17.3333 28.9708 17.3333 28.0916V15.6714C17.3333 15.1264 16.8856 14.6846 16.3333 14.6846H3.74748C2.85658 14.6846 2.41041 15.7476 3.04037 16.3692L15.6262 28.7894Z"
                              fill="#1D4ED8"
                            />
                            <path
                              d="M6.86186 30.6667C7.28184 31.0812 7.99993 30.7876 7.99993 30.2015V24.553C7.99993 24.1897 7.70146 23.8951 7.33327 23.8951H1.60941C1.01547 23.8951 0.718028 24.6037 1.138 25.0182L6.86186 30.6667Z"
                              fill="#1D4ED8"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_35895_50282">
                              <rect
                                width="32"
                                height="31.5789"
                                fill="white"
                                transform="translate(0 0.210938)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>

                      <h2
                        className="text-center"
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '16px',
                          lineHeight: '20px',
                          color: '#1F2937',
                          fontWeight: '600',
                          marginBottom: '12px',
                          // textShadow:
                          //   '0.5px 0.5px 0.9px rgba(0, 0, 0, 0.5)' /* Horizontal, Vertical, Blur, and Color */,
                        }}
                      >
                        Welcome to the
                        <br />
                        Chrome Extension
                      </h2>

                      <p
                        className="text-center"
                        style={{
                          fontSize: '14px',
                          fontFamily: 'Inter',
                          fontWeight: '400',
                          lineHeight: '20px',
                          marginBottom: '40px',
                          color: '#1f2937',
                        }}
                      >
                        Your best lead finder tool is just
                        <br />
                        a click away. From revealing contact
                        <br />
                        info to adding them to sequence
                        <br />
                        along with lot more features.
                      </p>

                      <Button
                        variant="primary"
                        className="w-100 py-2"
                        style={{
                          fontSize: '14px',
                          padding: '6px 16px',
                          height: '32px',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: '500',
                          lineHeight: '20px',
                          fontFamily: 'Inter',
                          marginBottom: '16px',
                          background:
                            'var(--new-blue, linear-gradient(46deg, #2563EB 17.53%, #3B82F6 96.95%))',
                        }}
                        onClick={handleClick} // Adding onClick event handler
                      >
                        <span>Log in</span>
                        <div
                          style={{
                            paddingBottom: '3px',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 17 17"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M3.36704 4.64047C3.74211 4.2654 4.25082 4.05469 4.78125 4.05469H8.11458C8.48277 4.05469 8.78125 4.35316 8.78125 4.72135C8.78125 5.08954 8.48277 5.38802 8.11458 5.38802H4.78125C4.60444 5.38802 4.43487 5.45826 4.30985 5.58328C4.18482 5.70831 4.11458 5.87788 4.11458 6.05469V12.0547C4.11458 12.2315 4.18482 12.4011 4.30985 12.5261C4.43487 12.6511 4.60444 12.7214 4.78125 12.7214H10.7813C10.9581 12.7214 11.1276 12.6511 11.2527 12.5261C11.3777 12.4011 11.4479 12.2315 11.4479 12.0547V8.72135C11.4479 8.35316 11.7464 8.05469 12.1146 8.05469C12.4828 8.05469 12.7813 8.35316 12.7813 8.72135V12.0547C12.7813 12.5851 12.5705 13.0938 12.1955 13.4689C11.8204 13.844 11.3117 14.0547 10.7813 14.0547H4.78125C4.25082 14.0547 3.74211 13.844 3.36704 13.4689C2.99196 13.0938 2.78125 12.5851 2.78125 12.0547V6.05469C2.78125 5.52425 2.99196 5.01555 3.36704 4.64047Z"
                              fill="white"
                            />
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M14.586 2.24995C14.8463 2.5103 14.8463 2.93241 14.586 3.19276L7.91932 9.85943C7.65897 10.1198 7.23686 10.1198 6.97651 9.85943C6.71616 9.59908 6.71616 9.17697 6.97651 8.91662L13.6432 2.24995C13.9035 1.9896 14.3256 1.9896 14.586 2.24995Z"
                              fill="white"
                            />
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M10.1146 2.72135C10.1146 2.35316 10.4131 2.05469 10.7813 2.05469H14.1146C14.4828 2.05469 14.7813 2.35316 14.7813 2.72135V6.05469C14.7813 6.42288 14.4828 6.72135 14.1146 6.72135C13.7464 6.72135 13.4479 6.42288 13.4479 6.05469V3.38802H10.7813C10.4131 3.38802 10.1146 3.08954 10.1146 2.72135Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      </Button>

                      <div
                        className="text-center mb-0"
                        style={{
                          fontSize: '14px',
                          fontWeight: '400',
                          fontFamily: 'Inter',
                          lineHeight: '20px',
                          color: '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '13px',
                        }}
                      >
                        <span>Don&apos;t have an account?</span>&nbsp;
                        <a
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            fontFamily: 'Inter',
                            lineHeight: '20px',
                            color: '#1D4ED8',
                            display: 'flex',
                            alignItems: 'start',
                          }}
                          href={`${ENV_CONFIG.WEB_APP_URL}/signup`}
                          className="text-decoration-none fw-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>Sign up!</span>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M2.58579 4.58969C2.96086 4.21462 3.46957 4.00391 4 4.00391H7.33333C7.70152 4.00391 8 4.30238 8 4.67057C8 5.03876 7.70152 5.33724 7.33333 5.33724H4C3.82319 5.33724 3.65362 5.40748 3.5286 5.5325C3.40357 5.65753 3.33333 5.8271 3.33333 6.00391V12.0039C3.33333 12.1807 3.40357 12.3503 3.5286 12.4753C3.65362 12.6003 3.82319 12.6706 4 12.6706H10C10.1768 12.6706 10.3464 12.6003 10.4714 12.4753C10.5964 12.3503 10.6667 12.1807 10.6667 12.0039V8.67057C10.6667 8.30238 10.9651 8.00391 11.3333 8.00391C11.7015 8.00391 12 8.30238 12 8.67057V12.0039C12 12.5343 11.7893 13.043 11.4142 13.4181C11.0391 13.7932 10.5304 14.0039 10 14.0039H4C3.46957 14.0039 2.96086 13.7932 2.58579 13.4181C2.21071 13.043 2 12.5343 2 12.0039V6.00391C2 5.47347 2.21071 4.96477 2.58579 4.58969Z"
                              fill="#1D4ED8"
                            />
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M13.8047 2.19917C14.0651 2.45952 14.0651 2.88163 13.8047 3.14198L7.13807 9.80864C6.87772 10.069 6.45561 10.069 6.19526 9.80864C5.93491 9.5483 5.93491 9.12618 6.19526 8.86584L12.8619 2.19917C13.1223 1.93882 13.5444 1.93882 13.8047 2.19917Z"
                              fill="#1D4ED8"
                            />
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M9.33333 2.67057C9.33333 2.30238 9.63181 2.00391 10 2.00391H13.3333C13.7015 2.00391 14 2.30238 14 2.67057V6.00391C14 6.3721 13.7015 6.67057 13.3333 6.67057C12.9651 6.67057 12.6667 6.3721 12.6667 6.00391V3.33724H10C9.63181 3.33724 9.33333 3.03876 9.33333 2.67057Z"
                              fill="#1D4ED8"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Container>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Login;
