import React from 'react';
import saleshandyLogo from '../assets/icons/saleshandyLogo.svg';

const handleClose = () => {
  chrome.runtime.sendMessage({
    method: 'closeIframe',
  });
};

const NotAvailableFeature = () => (
  <>
    <div
      style={{
        background: 'linear-gradient(246deg, #DCE1FE 3.34%, #EFF2FE 87.55%)',
        height: '780px',
        width: '332px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="d-flex"
        style={{
          padding: '16px 16px 0px 16px',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <img src={saleshandyLogo} alt="saleshandyLogo" />
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0px',
            display: 'flex',
          }}
          onClick={handleClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
          >
            <path
              // fill-rule="evenodd"
              // clip-rule="evenodd"
              d="M2.94727 7.9987C2.94727 7.63051 3.24574 7.33203 3.61393 7.33203H12.9473C13.3155 7.33203 13.6139 7.63051 13.6139 7.9987C13.6139 8.36689 13.3155 8.66536 12.9473 8.66536H3.61393C3.24574 8.66536 2.94727 8.36689 2.94727 7.9987Z"
              fill="#6B7280"
            />
          </svg>
        </button>
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
        <div
          style={{
            width: '284px',
            height: '136px',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 16px',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontWeight: '600',
              fontSize: '16px',
              fontStyle: 'normal',
              fontFamily: 'Inter',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#1F2937',
            }}
          >
            Uh-oh, it’s unavailable!
          </div>
          <div
            style={{
              fontWeight: '400',
              fontSize: '14px',
              fontStyle: 'normal',
              fontFamily: 'Inter',
              lineHeight: '20px',
              textAlign: 'center',
              color: '#1F2937',
            }}
          >
            We apologize, but this feature is not
            <br />
            available.
          </div>
        </div>
      </div>
    </div>
  </>
);

export default NotAvailableFeature;
