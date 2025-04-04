import React, { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import Main from './main';

const handleClose = () => {
  const element = document.getElementById('saleshandy-window');
  if (element) {
    element.style.display = 'none';
  }
};

const Login = () => {
  const [showMainPage, setShowMainPage] = useState(false);

  const handleClick = () => {
    localStorage.setItem('logoutTriggered', 'false');

    const element = document.getElementById('saleshandy-window');

    const authenticationToken = element?.getAttribute('authToken');

    if (
      authenticationToken !== undefined &&
      authenticationToken !== null &&
      authenticationToken !== ''
    ) {
      setShowMainPage(true);
    } else {
      window.open('https://pyxis.lifeisgoodforlearner.com/login', '_blank');
    }
  };

  return (
    <>
      {showMainPage ? (
        <Main />
      ) : (
        <>
          <div
            id="login-id"
            style={{
              backgroundColor: '#DCE1FE',
              height: '686px',
              width: '332px',
            }}
          >
            <div
              className="d-flex  mb-4"
              style={{
                padding: '5px',
                position: 'absolute',
                left: '5px',
                top: '10px',
              }}
            >
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
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'absolute',
                  left: '300px',
                  top: '15px',
                }}
                onClick={handleClose}
              >
                <div
                  style={{
                    height: '1.5px', // Thin line
                    width: '12px', // Long dash
                    backgroundColor: 'grey', // Dash color
                    borderRadius: '1px', // Rounded edges if desired
                  }}
                />
              </button>
            </div>
            <Container
              fluid
              className="d-flex align-items-center justify-content-center"
              style={{ marginTop: '35%', padding: '30px' }}
            >
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: '7px' }}
              >
                <Card.Body className="px-2 pb-2">
                  <Card
                    className="border-0 p-2"
                    style={{ borderRadius: '7px' }}
                  >
                    <div className="text-center mb-4">
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
                      className="text-center fw-bold mb-3"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '16px',
                        lineHeight: '20px',
                        textShadow:
                          '0.5px 0.5px 0.9px rgba(0, 0, 0, 0.5)' /* Horizontal, Vertical, Blur, and Color */,
                      }}
                    >
                      Welcome to the
                      <br />
                      Chrome Extension
                    </h2>

                    <p
                      className="text-center text-secondary mb-4"
                      style={{ fontSize: '14px', marginTop: '14px' }}
                    >
                      Your best lead finder tool is just a click away. From
                      revealing contact info to adding them to sequence along
                      with lot more features.
                    </p>

                    <Button
                      variant="primary"
                      className="w-100 py-2 mb-3"
                      style={{ fontSize: '14px', marginTop: '25px' }}
                      onClick={handleClick} // Adding onClick event handler
                    >
                      Log in
                    </Button>

                    <p
                      className="text-center mb-0"
                      style={{ fontSize: '14px', marginTop: '16px' }}
                    >
                      Don&apos;t have an account?{' '}
                      <a
                        href="https://my.saleshandy.com/signup"
                        className="text-primary text-decoration-none fw-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Sign up!
                      </a>
                    </p>
                  </Card>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export default Login;
