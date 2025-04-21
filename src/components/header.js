/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { profilePageState } from './state';
import Main from './main';
import saleshandyConnect from '../assets/icons/shConnectLogo.svg';
import diamond from '../assets/icons/diamond.svg';
import verticalDots from '../assets/icons/dotsVertical.svg';
import minus from '../assets/icons/minus.svg';
import './responsive-screen.css';

const handleClose = () => {
  chrome.runtime.sendMessage({
    method: 'closeIframe',
  });
};

const handleClick = () => {
  window.open(
    'https://pyxis.lifeisgoodforlearner.com/settings/billing/subscriptions/lead-finder#lead-finder-credit-plans',
    '_blank',
  );
};

const Header = () => {
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [count, setCount] = useRecoilState(profilePageState);
  const [leadFinderCredits, setLeadFinderCredits] = useState(0);

  const handleProfileClick = () => {
    setShowProfilePage(true);
    setCount(true);
  };

  const getLeadFinderCredits = () => {
    chrome.storage.local.get('saleshandyMetaData', (result) => {
      const saleshandyMetaData = result?.saleshandyMetaData;
      if (saleshandyMetaData) {
        const credits = saleshandyMetaData.leadFinderCredits;
        setLeadFinderCredits(credits);
      }
    });
  };

  useEffect(() => {
    try {
      const handleStorageChange = (changes) => {
        if (changes.saleshandyMetaData) {
          getLeadFinderCredits();
        }
      };

      // Add listener for storage changes
      chrome.storage.onChanged.addListener(handleStorageChange);

      // Clean up listener on component unmount
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    } catch (error) {
      console.error('Error in storage change useEffect:', error);
    }
  }, []);

  useEffect(() => {
    getLeadFinderCredits();
  }, []);

  return (
    <>
      {showProfilePage ? (
        <Main />
      ) : (
        <>
          <div
            className="d-flex"
            style={{
              width: '100%',
              minHeight: '32px',
              alignItems: 'baseline',
              borderBottom: '1px solid #E5E7EB',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                height: '20px',
                justifyContent: 'space-between',
                padding: '0px 16px',
              }}
            >
              <div>
                <img src={saleshandyConnect} alt="saleshandyConnect" />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  className="credits-container"
                  onClick={handleClick} // Adding onClick event handler
                  style={{
                    backgroundColor: '#EFF6FF',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    height: '20px',
                    alignItems: 'center',
                    display: 'flex',
                    gap: '2px',
                    width: 'auto',
                  }}
                >
                  <img src={diamond} alt="diamond" />
                  <span
                    style={{
                      color: '#1D4ED8',
                      fontSize: '12px',
                      fontWeight: '500',
                      lineHeight: '16px',
                    }}
                  >
                    {leadFinderCredits}
                  </span>
                </div>
                <div
                  className="button-hover-effect"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={handleProfileClick}
                >
                  <img src={verticalDots} alt="verticalDots" />
                </div>

                <div
                  className="button-hover-effect"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={handleClose}
                >
                  <img src={minus} alt="minus" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
