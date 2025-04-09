/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './prospect-list.css';

import minusIcon from '../../assets/icons/minus.svg';
import shConnectLogo from '../../assets/icons/shConnectLogo.svg';
import diamondIcon from '../../assets/icons/diamond.svg';
import dotsVerticalIcon from '../../assets/icons/dotsVertical.svg';
import email from '../../assets/icons/email.svg';
import emailPhone from '../../assets/icons/emailPhone.svg';
import send from '../../assets/icons/send.svg';
import chevronDown from '../../assets/icons/chevronDown.svg';
import chevronUp from '../../assets/icons/chevronUp.svg';
import cross from '../../assets/icons/cross.svg';
import mail from '../../assets/icons/mail.svg';
import phoneSignal from '../../assets/icons/phoneSignal.svg';

import SkeletonLoading from '../skeleton-loading/skeleton-loading';

const CustomButton = ({ variant, className, onClick, children }) => {
  const baseClass =
    variant === 'primary' ? 'btn-primary' : 'btn-outline-primary';
  return (
    <button
      type="button"
      className={`custom-button ${baseClass} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const CustomInput = ({ type = 'text', placeholder, value, onChange }) => (
  <input
    type={type}
    className="custom-input"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

const ProspectList = () => {
  // const [isLoading, setIsLoading] = useState(true);
  // const [prospects, setProspects] = useState([]);
  // const [prospectsRawData, setProspectsRawData] = useState([]);
  const [activeTab, setActiveTab] = useState('leads');
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [expendedProspect, setExpendedProspect] = useState(null);

  const fetchProspects = async () => {
    // chrome.storage.local.get(['bulkInfo'], (request) => {
    //   if (request.bulkInfo && request.bulkInfo.length > 0) {
    //     setProspectsRawData(request.bulkInfo);
    //   const linkedinUrls = request.bulkInfo.map((item) => item.linkedin_url);
    //   const payload = {
    //     start: 1,
    //     take: linkedinUrls.length,
    //     link: linkedinUrls,
    //   };
    //     const response = await prospectsInstance.getProspects(payload);
    //     console.log(response);
    //   }
    // });
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const loading = false;
  const prospects = [
    {
      id: 7501604371,
      status: 'complete',
      name: 'Deepansh Pahuja',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
      links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
      linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
      emails: ['desaleshandy.com', 'gmail.com'],
      phones: [{ number: '637698XXXX', is_premium: true }],
      first_name: 'Deepansh',
      last_name: 'Pahuja',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 3882926612,
      status: 'complete',
      name: 'Harsh Vaghela',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
      links: {
        linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      },
      linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
      phones: [{ number: '951041XXXX', is_premium: true }],
      first_name: 'Harsh',
      last_name: 'Vaghela',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 7501604373,
      status: 'complete',
      name: 'Deepansh Pahuja',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
      links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
      linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
      emails: ['saleshandy.com', 'gmail.com'],
      phones: [{ number: '637698XXXX', is_premium: true }],
      first_name: 'Deepansh',
      last_name: 'Pahuja',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 3882926614,
      status: 'complete',
      name: 'Harsh Vaghela',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
      links: {
        linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      },
      linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
      phones: [{ number: '951041XXXX', is_premium: true }],
      first_name: 'Harsh',
      last_name: 'Vaghela',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 7501604375,
      status: 'complete',
      name: 'Deepansh Pahuja',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
      links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
      linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
      emails: ['saleshandy.com', 'gmail.com'],
      phones: [{ number: '637698XXXX', is_premium: true }],
      first_name: 'Deepansh',
      last_name: 'Pahuja',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 3882926616,
      status: 'complete',
      name: 'Harsh Vaghela',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
      links: {
        linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      },
      linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
      phones: [{ number: '951041XXXX', is_premium: true }],
      first_name: 'Harsh',
      last_name: 'Vaghela',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 7501604377,
      status: 'complete',
      name: 'Deepansh Pahuja',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
      links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
      linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
      emails: ['saleshandy.com', 'gmail.com'],
      phones: [{ number: '637698XXXX', is_premium: true }],
      first_name: 'Deepansh',
      last_name: 'Pahuja',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 3882926618,
      status: 'complete',
      name: 'Harsh Vaghela',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
      links: {
        linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      },
      linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
      phones: [{ number: '951041XXXX', is_premium: true }],
      first_name: 'Harsh',
      last_name: 'Vaghela',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 7501604379,
      status: 'complete',
      name: 'Deepansh Pahuja',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
      links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
      linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
      emails: ['saleshandy.com', 'gmail.com'],
      phones: [{ number: '637698XXXX', is_premium: true }],
      first_name: 'Deepansh',
      last_name: 'Pahuja',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
    {
      id: 3882926620,
      status: 'complete',
      name: 'Harsh Vaghela',
      profile_pic:
        'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
      links: {
        linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      },
      linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
      emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
      phones: [{ number: '951041XXXX', is_premium: true }],
      first_name: 'Harsh',
      last_name: 'Vaghela',
      isRevealed: false,
      isRevealing: false,
      reReveal: false,
      revealType: null,
      contactId: null,
      isProspectCreated: false,
      bio:
        'I create impactful functions and experiences. My designs prioriti..',
    },
  ];

  // Add effect to handle body scroll lock
  useEffect(() => {
    if (showTagsModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showTagsModal]);

  const toggleProspectSelection = (prospectId) => {
    setSelectedProspects((prev) =>
      prev.includes(prospectId)
        ? prev.filter((id) => id !== prospectId)
        : [...prev, prospectId],
    );
  };

  const toggleAllProspectsSelection = () => {
    setSelectedProspects(
      selectedProspects.length === prospects.length
        ? []
        : prospects.map((prospect) => prospect.id),
    );
  };

  console.log(selectedProspects);

  if (loading) {
    // skeleton ui
    return (
      <div className="prospect-list-container">
        <div className="prospect-list-header">
          <div className="prospect-list-header-title">
            <SkeletonLoading width={60} height={16} />
          </div>
          <div className="prospect-list-header-actions">
            <SkeletonLoading width={50} height={20} borderRadius={2} />
            <SkeletonLoading width={16} height={16} borderRadius={2} />
            <img src={minusIcon} alt="minus" />
          </div>
        </div>
        <div className="prospect-tabs-container">
          <div className="prospect-tabs prospect-tabs-skeleton">
            <div className="prospect-tab">
              <SkeletonLoading width={54} height={16} />
            </div>
            <div className="prospect-tab">
              <SkeletonLoading width={54} height={16} />
            </div>
          </div>
          <div className="prospect-tab-actions-skeleton" />
          <div className="prospect-list-items-container prospect-list-items-container-skeleton">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="prospect-item" key={index}>
                <SkeletonLoading width={16} height={16} borderRadius={2} />
                <div className="prospect-item-info">
                  <SkeletonLoading width={32} height={32} circle />
                  <div className="prospect-item-details">
                    <SkeletonLoading width={102} height={20} />
                    <SkeletonLoading width={176} height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  // actual ui
  return (
    <>
      <div className="prospect-list-container">
        <div className="prospect-list-header">
          <div className="prospect-list-header-title">
            <img src={shConnectLogo} alt="sh-logo" />
          </div>
          <div className="prospect-list-header-actions">
            <div className="lf-credits-box">
              <img src={diamondIcon} alt="diamond" />
              100
            </div>
            <img src={dotsVerticalIcon} alt="options" />
            <img src={minusIcon} alt="minus" />
          </div>
        </div>
        <div className="prospect-tabs-container">
          <div className="prospect-tabs">
            <div
              className={`prospect-tab ${
                activeTab === 'leads' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('leads')}
            >
              <span>Leads Available</span>
            </div>
            <div
              className={`prospect-tab ${
                activeTab === 'saved' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('saved')}
            >
              <span>Saved</span>
              <span className="prospect-saved-count">100</span>
            </div>
            <div
              className={`prospect-tab-highlight ${
                activeTab === 'leads' ? 'leads' : 'saved'
              }`}
            />
          </div>
          <div className="prospect-tab-actions">
            <div className="action-checkbox">
              <input
                type="checkbox"
                checked={selectedProspects.length === prospects.length}
                onChange={() => toggleAllProspectsSelection()}
              />
              <span>All</span>
            </div>
            <div className="action-divider" />
            <div className="tooltip-container">
              <CustomButton
                variant="primary"
                className="action-button"
                onClick={() => setShowTagsModal(true)}
              >
                <img src={email} alt="email" />
                View Email
              </CustomButton>
              <div className="custom-tooltip tooltip-bottom">
                1 Credit Required for each
              </div>
            </div>
            <div className="tooltip-container">
              <CustomButton variant="outline" className="action-icon-button">
                <img src={emailPhone} alt="email-phone" />
              </CustomButton>
              <div className="custom-tooltip tooltip-bottom">
                View Email + Phone:
                <br />
                2 Credit Required
                <br />
                for each
              </div>
            </div>
            <CustomButton variant="outline" className="action-icon-button">
              <img src={send} alt="send" />
            </CustomButton>
          </div>
          <div className="prospect-list-items-container">
            {prospects.map((prospect, index) => (
              <div className="prospect-item-container" key={index}>
                <div
                  className={`prospect-item ${
                    expendedProspect === prospect.id ? 'expanded' : ''
                  }`}
                >
                  <div className="prospect-item-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProspects.includes(prospect.id)}
                      onChange={() => toggleProspectSelection(prospect.id)}
                    />
                  </div>
                  <div className="prospect-item-info">
                    <div className="prospect-image">
                      <img src={prospect.profile_pic} alt="profile" />
                    </div>
                    <div className="prospect-item-details">
                      <div className="prospect-name">
                        <span>{prospect.name}</span>
                        <div
                          className="prospect-item-expand-icon"
                          onClick={() =>
                            setExpendedProspect(
                              expendedProspect === prospect.id
                                ? null
                                : prospect.id,
                            )
                          }
                        >
                          <img
                            src={
                              expendedProspect === prospect.id
                                ? chevronUp
                                : chevronDown
                            }
                            alt="chevron-down"
                          />
                        </div>
                      </div>
                      <div className="prospect-bio">
                        <span>{prospect.bio}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {expendedProspect === prospect.id && (
                  <div className="prospect-item-expanded">
                    {prospect.emails.map((e) => (
                      <div className="prospect-item-expanded-email" key={e}>
                        <img src={mail} alt="email" />
                        <span>
                          <span className="list-dots">
                            &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                          </span>
                          @{e}
                        </span>
                      </div>
                    ))}
                    {prospect.phones.map((phone) => (
                      <div
                        className="prospect-item-expanded-phone"
                        key={phone.number}
                      >
                        <img src={phoneSignal} alt="phone-signal" />
                        <span>
                          {phone?.number?.slice(0, 3)}
                          <span className="list-dots">
                            &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      <div className={`custom-modal-overlay ${showTagsModal ? 'show' : ''}`}>
        <div className="custom-modal">
          <div className="custom-modal-header">
            <h3 className="custom-modal-title">Add Tags</h3>
            <button
              type="button"
              className="custom-modal-close"
              onClick={() => setShowTagsModal(false)}
            >
              <img src={cross} alt="close" />
            </button>
          </div>
          <div className="custom-modal-body">
            <span>
              Apply a tag before disclosing emails for 10 leads; this will
              assist you in locating them later.
            </span>
            <CustomInput
              type="text"
              placeholder="Enter a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>
          <div className="custom-modal-footer">
            <CustomButton
              variant="outline"
              className="ignore-button"
              onClick={() => setShowTagsModal(false)}
            >
              Ignore
            </CustomButton>
            <CustomButton
              variant="primary"
              className="action-button"
              onClick={() => setShowTagsModal(false)}
            >
              Apply
            </CustomButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProspectList;
