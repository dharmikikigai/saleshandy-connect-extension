/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './prospect-list.css';

import minusIcon from '../../assets/icons/minus.svg';
import email from '../../assets/icons/email.svg';
import emailPhone from '../../assets/icons/emailPhone.svg';
import send from '../../assets/icons/send.svg';
import chevronDown from '../../assets/icons/chevronDown.svg';
import chevronUp from '../../assets/icons/chevronUp.svg';
import mail from '../../assets/icons/mail.svg';
import phoneSignal from '../../assets/icons/phoneSignal.svg';
import alertCircle from '../../assets/icons/alertCircle.svg';
import checkbox from '../../assets/icons/checkbox.svg';
import checkboxChecked from '../../assets/icons/checkboxChecked.svg';
import circleCheck from '../../assets/icons/circleCheck.svg';
import tagIcon from '../../assets/icons/tag.svg';
import copy from '../../assets/icons/copy.svg';
import filter from '../../assets/icons/filter.svg';
import filterBlue from '../../assets/icons/filter-blue.svg';
import cross from '../../assets/icons/cross.svg';
import NogenderAvatar from '../no-gender-avatar';

import SkeletonLoading from '../skeleton-loading/skeleton-loading';
import prospectsInstance from '../../config/server/finder/prospects';
import AddTagsModal from './add-tags';
import AddToSequenceModal from './add-to-sequence-modal';
import Header from '../header';
import ProspectFilterModal from './prospect-filter-modal';

chrome.runtime.onMessage.addListener((request) => {
  if (request.method === 'bulk-prospect-reload') {
    console.log('refreshProspects');
  }
});

const CustomButton = ({
  variant,
  className,
  onClick,
  children,
  disabled = false,
  loading = false,
}) => {
  const baseClass =
    variant === 'primary' ? 'btn-primary' : 'btn-outline-primary';
  return (
    <button
      type="button"
      className={`custom-button ${baseClass} ${className || ''} ${
        disabled ? 'disabled' : ''
      }`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <div className="spinner" /> : children}
    </button>
  );
};

const BULK_ACTION_TIMEOUT = 7000;
const MAX_POLLING_LIMIT = 20;

const ProspectList = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const [prospects, setProspects] = useState([]);
  const [savedProspects, setSavedProspects] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [activeTab, setActiveTab] = useState('leads');
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRevealType, setSelectedRevealType] = useState('email');
  const [expendedProspect, setExpendedProspect] = useState(null);
  const [revealingProspects, setRevealingProspects] = useState({});
  const [revealProspectLoading, setRevealProspectLoading] = useState({
    ignore: false,
    apply: false,
    save: false,
  });

  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [isFirstPollRequest, setIsFirstPollRequest] = useState(true);
  const pollingAttemptsRef = useRef(0);

  const [showAddToSequenceModal, setShowAddToSequenceModal] = useState(false);

  const [isAgency, setIsAgency] = useState(false);

  const visibleProspects = activeTab === 'leads' ? prospects : savedProspects;

  const selectableProspects = visibleProspects.filter(
    (prospect) => prospect.id && !prospect.isRevealing,
  );

  const isAllEmailRevealed = selectableProspects.every(
    (prospect) => prospect.isRevealed,
  );

  const isAllEmailPhoneRevealed = selectableProspects.every(
    (prospect) => prospect.isRevealed && !prospect.reReveal,
  );

  const [showProspectFilterModal, setShowProspectFilterModal] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState([]);
  const [dateFilterValue, setDateFilterValue] = useState(null);
  const [dateFilterCustomValue, setDateFilterCustomValue] = useState(null);
  const [applyFiltersLoading, setApplyFiltersLoading] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const setProspectsData = (data, rawData) => {
    if (
      data.payload &&
      data.payload.profiles &&
      data.payload.profiles.length > 0
    ) {
      const prospectsData = rawData.map((item) => {
        const prospect = data.payload.profiles.find(
          (profile) =>
            profile.linkedin_url ===
            `https://www.linkedin.com/in/${item.source_id_2}`,
        );
        if (prospect) {
          return {
            ...prospect,
            description: item.description,
            logo: item.logo,
          };
        }
        return item;
      });
      setProspects(prospectsData);
    }
  };

  const fetchProspects = async () => {
    chrome.storage.local.get(['bulkInfo'], async (result) => {
      const bulkInfo = result?.bulkInfo.people;
      if (bulkInfo && bulkInfo.length > 0) {
        const linkedinUrls = bulkInfo.map(
          (item) => `https://www.linkedin.com/in/${item.source_id_2}`,
        );
        const payload = {
          start: 1,
          take: linkedinUrls.length,
          link: linkedinUrls,
        };
        const response = await prospectsInstance.getProspects(payload);
        setProspectsData(response, bulkInfo);
      }
    });
  };

  const handleApplyTags = async () => {
    const tagIds = [];
    const newTags = [];

    selectedTags.forEach((tag) => {
      // eslint-disable-next-line no-underscore-dangle
      if (tag.__isNew__) {
        newTags.push(tag.value);
      } else {
        tagIds.push(tag.value);
      }
    });

    const payload = {
      leadIds: selectedProspects,
      revealType: selectedRevealType,
      tagIds,
      newTags,
    };
    setRevealProspectLoading({
      ignore: false,
      apply: true,
      save: false,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setSelectedTags([]);
    setShowTagsModal(false);
  };

  const handleIgnoreTags = async () => {
    const payload = {
      leadIds: selectedProspects,
      revealType: selectedRevealType,
    };
    setRevealProspectLoading({
      ignore: true,
      apply: false,
      save: false,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        // if (bulkRevealRes?.payload?.shouldPoll) {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
        // }
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setSelectedTags([]);
    setShowTagsModal(false);
  };

  const handleAddToSequence = async (data) => {
    const payload = {
      leadIds: selectedProspects,
      revealType: 'email',
      tagIds: data.tagIds,
      newTags: data.newTags,
      sequenceId: data.sequenceId,
      stepId: data.stepId,
    };
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: true,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        // if (bulkRevealRes?.payload?.shouldPoll) {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
        // }
        console.log(
          'success',
          message ||
            'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
        );
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setShowAddToSequenceModal(false);
  };

  const handleViewContact = (type) => {
    setSelectedRevealType(type);
    setShowTagsModal(true);
  };

  const handleFetchLead = async () => {
    const allRevealingProspectIds = Object.keys(revealingProspects)
      .filter((id) => revealingProspects[id] === true)
      .map(Number);
    const payload = {
      leadIds: allRevealingProspectIds,
      revealType: selectedRevealType,
      isBulkAction: true,
    };
    const response = await prospectsInstance.leadStatus(payload);
    if (
      response &&
      response.payload &&
      response.payload.profiles &&
      response.payload.profiles.length > 0
    ) {
      const updatedRevealingProspects = { ...revealingProspects };
      const updatedProspects = [...prospects];
      response.payload.profiles.forEach((profile) => {
        if (profile.isRevealed && !profile.isRevealing) {
          updatedRevealingProspects[profile.id] = false;
          const prospectIndex = updatedProspects.findIndex(
            (p) => p.id === profile.id,
          );
          if (prospectIndex !== -1) {
            updatedProspects[prospectIndex] = profile;
          }
        }
      });
      const remainingProspects = Object.keys(updatedRevealingProspects).filter(
        (id) => updatedRevealingProspects[id],
      );
      if (remainingProspects.length > 0) {
        setRevealingProspects(updatedRevealingProspects);
        setProspects(updatedProspects);
      } else {
        setIsPollingEnabled(false);
      }
    }
  };

  const refreshProspects = async () => {
    const linkedinUrls = [];
    Object.keys(revealingProspects).forEach((id) => {
      // Convert id to number for comparison if prospects have numeric IDs
      const prospect = prospects.find(
        (p) => p.id === Number(id) || p.id === id,
      );
      if (prospect) {
        linkedinUrls.push(prospect.linkedin_url);
      }
    });
    if (linkedinUrls.length > 0) {
      const payload = {
        start: 1,
        take: linkedinUrls.length,
        link: linkedinUrls,
      };
      const response = await prospectsInstance.getProspects(payload);
      setRevealingProspects({});
      const updatedProspects = [...prospects];
      response.payload.profiles.forEach((profile) => {
        const prospectIndex = updatedProspects.findIndex(
          (p) => p.id === profile.id,
        );
        if (prospectIndex !== -1) {
          updatedProspects[prospectIndex] = profile;
        }
      });
      setProspects(updatedProspects);
    }
  };

  const getSavedLeads = async () => {
    try {
      const payload = {
        start: 1,
        take: 25,
      };
      const response = await prospectsInstance.getSavedLeads(payload);
      if (
        response &&
        response.payload &&
        response.payload.profiles &&
        response.payload.profiles.length > 0
      ) {
        setSavedProspects(response.payload.profiles);
      }
      if (response?.payload?.pagination?.total) {
        setSavedCount(response?.payload?.pagination?.total);
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('text copied');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          console.log('text copied');
        } catch (fallbackErr) {
          console.error('Fallback: Oops, unable to copy', fallbackErr);
        }
        document.body.removeChild(textArea);
      });
  };

  const closeProspectFilterModal = () => {
    setShowProspectFilterModal(false);
  };

  const applyFilters = async () => {
    try {
      setApplyFiltersLoading(true);
      const tagFilter = selectedTagFilters.map((tag) => tag.value).join(',');
      const payload = {
        start: 1,
        take: 25,
        tags: tagFilter,
      };

      if (dateFilterValue) {
        let startDate;
        let endDate;

        if (dateFilterValue.value === 'Custom' && dateFilterCustomValue) {
          [startDate, endDate] = dateFilterCustomValue;
        } else {
          startDate = dateFilterValue.startDate;
          endDate = dateFilterValue.endDate;
        }

        if (startDate && endDate) {
          let formattedStartDate;
          let formattedEndDate;

          if (startDate.toISO && typeof startDate.toISO === 'function') {
            const startDateMidnight = startDate.startOf('day');
            const endDateMidnight = endDate.startOf('day');

            formattedStartDate = startDateMidnight
              .toLocal()
              .toISO()
              .replace('Z', '+05:30');
            formattedEndDate = endDateMidnight
              .toLocal()
              .toISO()
              .replace('Z', '+05:30');
          } else if (
            startDate.toISOString &&
            typeof startDate.toISOString === 'function'
          ) {
            const startDateMidnight = new Date(startDate);
            startDateMidnight.setHours(0, 0, 0, 0);

            const endDateMidnight = new Date(endDate);
            endDateMidnight.setHours(0, 0, 0, 0);

            const formatDateToLocalISO = (date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}T00:00:00.000+05:30`;
            };

            formattedStartDate = formatDateToLocalISO(startDateMidnight);
            formattedEndDate = formatDateToLocalISO(endDateMidnight);
          } else {
            const startDateMidnight = new Date(startDate);
            startDateMidnight.setHours(0, 0, 0, 0);

            const endDateMidnight = new Date(endDate);
            endDateMidnight.setHours(0, 0, 0, 0);

            const formatDateToLocalISO = (date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}T00:00:00.000+05:30`;
            };

            formattedStartDate = formatDateToLocalISO(startDateMidnight);
            formattedEndDate = formatDateToLocalISO(endDateMidnight);
          }

          const createdDateString = `${formattedStartDate},${formattedEndDate}`;
          payload.createdDate = encodeURIComponent(createdDateString);
        }
      }

      const response = await prospectsInstance.getSavedLeads(payload);
      if (response && response.payload && response.payload.profiles) {
        setSavedProspects(response.payload.profiles);
        setIsFilterApplied(true);
      }
      if (response?.payload?.pagination?.total) {
        setSavedCount(response?.payload?.pagination?.total);
      }
    } catch (e) {
      console.log('error', e);
    } finally {
      setApplyFiltersLoading(false);
      setShowProspectFilterModal(false);
    }
  };

  const clearFilters = () => {
    setSelectedTagFilters([]);
    setDateFilterValue(null);
    setApplyFiltersLoading(false);
    setSavedProspects([]);
    setSavedCount(0);
    setIsFilterApplied(false);
    getSavedLeads();
  };

  useEffect(() => {
    fetchProspects();
    getSavedLeads();
    setIsAgency(true);
    // setMetaData();  TODO for header
  }, []);

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

  useEffect(() => {
    let intervalId = null;

    if (isPollingEnabled) {
      intervalId = setInterval(() => {
        pollingAttemptsRef.current++;
        if (pollingAttemptsRef.current >= MAX_POLLING_LIMIT) {
          setIsPollingEnabled(false);
        }
        const shouldContinuePolling =
          isFirstPollRequest || pollingAttemptsRef.current < MAX_POLLING_LIMIT;

        if (shouldContinuePolling) {
          handleFetchLead();
        }
      }, BULK_ACTION_TIMEOUT);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPollingEnabled, revealingProspects]);

  // Separate useEffect for handling polling completion
  useEffect(() => {
    if (!isPollingEnabled && pollingAttemptsRef.current > 0) {
      // Only refresh prospects when polling is actually stopped
      refreshProspects();
      setIsFirstPollRequest(true);
      pollingAttemptsRef.current = 0;
    }
  }, [isPollingEnabled]);

  const toggleProspectSelection = (prospectId) => {
    setSelectedProspects((prev) =>
      prev.includes(prospectId)
        ? prev.filter((id) => id !== prospectId)
        : [...prev, prospectId],
    );
  };

  const toggleAllProspectsSelection = () => {
    setSelectedProspects(
      selectedProspects.length === selectableProspects.length
        ? []
        : selectableProspects.map((prospect) => prospect.id),
    );
  };

  const loading = false;

  const getProspectHeaderSkeleton = () => (
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
  );

  const getProspectTabsSkeleton = () => (
    <div className="prospect-tabs prospect-tabs-skeleton">
      <SkeletonLoading width={54} height={16} />
      <SkeletonLoading width={54} height={16} />
    </div>
  );

  const getProspectListItemsSkeleton = () => (
    <div className="prospect-list-items-container prospect-list-items-container-skeleton">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="prospect-item" key={index}>
          <SkeletonLoading width={16} height={16} borderRadius={2} />
          <div className="prospect-item-info">
            <div className="prospect-image">
              <SkeletonLoading width={32} height={32} circle />
            </div>
            <div className="prospect-item-details">
              <SkeletonLoading width={102} height={20} />
              <SkeletonLoading width={176} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getProspectDescription = (prospect) => {
    if (!prospect.id || (prospect.isRevealed && prospect.emails.length === 0)) {
      return (
        <div className="prospect-email-unavailable">
          <img
            className="prospect-email-unavailable-icon"
            src={mail}
            alt="email"
          />
          <span className="prospect-email-unavailable-text">
            Email unavailable
          </span>
          <div className="tooltip-container">
            <img src={alertCircle} alt="alert" />
            <div className="custom-tooltip tooltip-bottom">
              Email is not available your
              <br />
              credit is refunded
            </div>
          </div>
        </div>
      );
    }
    if (prospect.isRevealed && prospect.emails.length > 0) {
      return (
        <div className="prospect-description-revealed">
          <img src={mail} alt="email" />
          <span className="prospect-description-revealed-email">
            {prospect.emails[0].email}
          </span>
          <img src={circleCheck} alt="circle-check" />
          <div
            className="copy-icon"
            onClick={() => copyToClipboard(prospect.emails[0].email)}
          >
            <img src={copy} alt="copy" />
          </div>
        </div>
      );
    }
    return (
      <div className="prospect-description">
        <span>{prospect.description}</span>
      </div>
    );
  };

  const getViewContactButton = (type) => (
    <div className="tooltip-container">
      <CustomButton
        variant={type === 'email' ? 'primary' : 'outline'}
        className={type === 'email' ? 'action-button' : 'action-icon-button'}
        onClick={() => handleViewContact(type)}
        disabled={selectedProspects.length === 0}
      >
        <img src={type === 'email' ? email : emailPhone} alt="email" />
        {type === 'email' ? 'View Email' : ''}
      </CustomButton>
      <div className="custom-tooltip tooltip-bottom">
        {type === 'email' ? (
          '1 Credit Required for each'
        ) : (
          <>
            View Email + Phone:
            <br />
            2 Credit Required
            <br />
            for each
          </>
        )}
      </div>
    </div>
  );

  const getAddToSequenceButton = (isExpanded = false) => (
    <CustomButton
      variant="outline"
      className={isExpanded ? 'action-button' : 'action-icon-button'}
      disabled={selectedProspects.length === 0}
      onClick={() => setShowAddToSequenceModal(true)}
    >
      <img src={send} alt="send" />
      {isExpanded ? 'Sequence' : ''}
    </CustomButton>
  );

  const getTagButton = () => (
    <CustomButton
      variant="outline"
      className="action-icon-button"
      disabled={selectedProspects.length === 0}
    >
      <img src={tagIcon} alt="tag" />
    </CustomButton>
  );

  const getActionButtons = () => {
    if (isAllEmailRevealed && isAllEmailPhoneRevealed) {
      return (
        <>
          {getAddToSequenceButton('expanded')}
          {getTagButton()}
        </>
      );
    }
    if (isAllEmailRevealed && !isAllEmailPhoneRevealed) {
      return (
        <>
          {getAddToSequenceButton('expanded')}
          {getViewContactButton('emailphone')}
          {getTagButton()}
        </>
      );
    }
    return (
      <>
        {getViewContactButton('email')}
        {getViewContactButton('emailphone')}
        {getAddToSequenceButton()}
      </>
    );
  };

  if (loading) {
    // skeleton ui
    return (
      <div className="prospect-list-container">
        {getProspectHeaderSkeleton()}
        <div className="prospect-tabs-container">
          {getProspectTabsSkeleton()}
          <div className="prospect-tab-actions-skeleton" />
          {getProspectListItemsSkeleton()}
        </div>
      </div>
    );
  }
  // actual ui
  return (
    <>
      <div className="prospect-list-container">
        <Header />
        <div className="prospect-tabs-container" id="prospect-list-container">
          {visibleProspects.length === 0 ? (
            <>
              {getProspectTabsSkeleton()}
              <div className="prospect-tab-actions-skeleton" />
              {getProspectListItemsSkeleton()}
            </>
          ) : (
            <>
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
                  className={`prospect-tab saved-tab ${
                    activeTab === 'saved' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('saved')}
                >
                  <span>Saved</span>
                  <span className="prospect-saved-count"> {savedCount}</span>
                  {activeTab === 'saved' && (
                    <div className="prospect-tab-filter">
                      <div
                        className={`filter-container ${
                          isFilterApplied ? 'filter-applied' : ''
                        }`}
                      >
                        <div className="tooltip-container">
                          <div
                            className="filter-icon-container"
                            onClick={() => setShowProspectFilterModal(true)}
                          >
                            <img
                              src={isFilterApplied ? filterBlue : filter}
                              alt="filter"
                            />
                          </div>
                          <div className="custom-tooltip tooltip-bottom">
                            Filter
                          </div>
                        </div>
                        {isFilterApplied && (
                          <div className="clear-filter" onClick={clearFilters}>
                            <img src={cross} alt="cross" />
                          </div>
                        )}
                      </div>
                      <ProspectFilterModal
                        showModal={showProspectFilterModal}
                        onClose={closeProspectFilterModal}
                        selectedTags={selectedTagFilters}
                        setSelectedTags={setSelectedTagFilters}
                        dateFilterValue={dateFilterValue}
                        setDateFilterValue={setDateFilterValue}
                        dateFilterCustomValue={dateFilterCustomValue}
                        setDateFilterCustomValue={setDateFilterCustomValue}
                        applyFilters={applyFilters}
                        clearFilters={clearFilters}
                        isLoading={applyFiltersLoading}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`prospect-tab-highlight ${
                    activeTab === 'leads' ? 'leads' : 'saved'
                  }`}
                />
              </div>
              <div className="prospect-tab-actions">
                <div className="action-checkbox">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleAllProspectsSelection()}
                  >
                    <img
                      src={
                        selectedProspects.length === selectableProspects.length
                          ? checkboxChecked
                          : checkbox
                      }
                      alt="checkbox"
                    />
                  </div>
                  <span>
                    {selectedProspects.length > 0
                      ? selectedProspects.length
                      : 'All'}
                  </span>
                </div>
                <div className="action-divider" />
                {getActionButtons()}
              </div>
              <div className="prospect-list-items-container">
                {visibleProspects.map((prospect, index) => (
                  <div className="prospect-item-container" key={index}>
                    <div
                      className={`prospect-item ${
                        expendedProspect === prospect.id ? 'expanded' : ''
                      }`}
                    >
                      <div className="prospect-item-checkbox">
                        {prospect.isRevealing ||
                        revealingProspects[prospect.id] ? (
                          <div className="spinner" />
                        ) : (
                          <div
                            className={`cursor-pointer ${
                              !prospect.id ? 'checkbox-disabled' : ''
                            }`}
                            {...(prospect.id && {
                              onClick: () =>
                                toggleProspectSelection(prospect.id),
                            })}
                          >
                            <img
                              src={
                                prospect.id &&
                                selectedProspects.includes(prospect.id)
                                  ? checkboxChecked
                                  : checkbox
                              }
                              alt="checkbox"
                            />
                          </div>
                        )}
                      </div>
                      <div className="prospect-item-info">
                        <div className="prospect-image">
                          {prospect.profile_pic || prospect.logo ? (
                            <img
                              src={
                                prospect.profile_pic
                                  ? prospect.profile_pic
                                  : prospect.logo
                              }
                              alt="profile"
                            />
                          ) : (
                            <NogenderAvatar />
                          )}
                        </div>
                        <div
                          className={`prospect-item-details ${
                            !prospect.id || prospect.isRevealed
                              ? 'prospect-item-details-unavailable'
                              : ''
                          }`}
                        >
                          <div className="prospect-name">
                            <span>{prospect.name}</span>
                            {prospect.id &&
                              (prospect.emails.length > 0 ||
                                prospect.phones.length > 0) && (
                                <div
                                  className="prospect-item-expand-icon cursor-pointer"
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
                              )}
                          </div>
                          {getProspectDescription(prospect)}
                        </div>
                      </div>
                    </div>
                    {expendedProspect === prospect.id && (
                      <div className="prospect-item-expanded">
                        {prospect.emails.length > 0 &&
                          (prospect.isRevealed
                            ? prospect.emails.slice(1).map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span className="prospect-description-revealed-email">
                                    {e.email}
                                  </span>
                                  <img src={circleCheck} alt="circle-check" />
                                  <div
                                    className="copy-icon"
                                    onClick={() => copyToClipboard(e.email)}
                                  >
                                    <img src={copy} alt="copy" />
                                  </div>
                                </div>
                              ))
                            : prospect.emails.map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span>
                                    {e.email ? (
                                      e.email
                                    ) : (
                                      <span className="list-dots">
                                        &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                                        @{e}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )))}
                        {prospect.phones.length > 0 &&
                          prospect.phones.map((phone) => (
                            <div
                              className="prospect-item-expanded-phone"
                              key={phone.number}
                            >
                              <img src={phoneSignal} alt="phone-signal" />
                              {phone?.number?.includes('X') ? (
                                <span>
                                  {phone?.number?.slice(0, 3)}
                                  <span className="list-dots">
                                    &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                                  </span>
                                </span>
                              ) : (
                                <>
                                  <span>{phone?.number}</span>
                                  <div
                                    className="copy-icon"
                                    onClick={() =>
                                      copyToClipboard(phone?.number)
                                    }
                                  >
                                    <img src={copy} alt="copy" />
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Tags Modal */}
      <AddTagsModal
        showModal={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        selectedTags={selectedTags}
        selectedProspects={selectedProspects}
        setSelectedTags={setSelectedTags}
        onApplyTags={handleApplyTags}
        onIgnoreTags={handleIgnoreTags}
        isLoading={revealProspectLoading}
      />

      <AddToSequenceModal
        showModal={showAddToSequenceModal}
        onClose={() => setShowAddToSequenceModal(false)}
        isAgency={isAgency}
        handleAddToSequence={handleAddToSequence}
        isLoading={revealProspectLoading}
      />
    </>
  );
};

export default ProspectList;
