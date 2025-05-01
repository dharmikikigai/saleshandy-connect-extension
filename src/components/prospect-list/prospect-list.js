/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import 'bootstrap/dist/css/bootstrap.min.css';
import './prospect-list.css';

import minusIcon from '../../assets/icons/minus.svg';
import email from '../../assets/icons/email.svg';
import emailPhone from '../../assets/icons/emailPhone.svg';
import send from '../../assets/icons/send.svg';
import send2 from '../../assets/icons/send2.svg';
import chevronDown from '../../assets/icons/chevronDown.svg';
import chevronUp from '../../assets/icons/chevronUp.svg';
import mail from '../../assets/icons/mail.svg';
import phoneSignal from '../../assets/icons/phoneSignal.svg';
import alertCircle from '../../assets/icons/alertCircle.svg';
import checkbox from '../../assets/icons/checkbox.svg';
import checkboxChecked from '../../assets/icons/checkboxChecked.svg';
import circleCheck from '../../assets/icons/circleCheck.svg';
import tagIcon from '../../assets/icons/tag.svg';
import tag2 from '../../assets/icons/tag2.svg';
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
import NoProspectFound from './no-prospect-found';
import RateLimitReached from '../rate-limit-reached';
import mailboxInstance from '../../config/server/tracker/mailbox';
import Toaster from '../toaster';
import ContactStatusTag from '../contact-status-tag/contact-status-tag';

const CustomButton = ({
  variant,
  className,
  onClick,
  children,
  disabled = false,
  loading = false,
  dataTooltipId = null,
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
      {...(dataTooltipId && {
        'data-tooltip-id': dataTooltipId,
      })}
    >
      {loading ? <div className="spinner" /> : children}
    </button>
  );
};

const BULK_ACTION_TIMEOUT = 1000 * 7; // 7 seconds
const MAX_POLLING_LIMIT = 20;
const MAX_PROSPECT_CACHE_SIZE = 100;
const PROSPECT_CACHE_EXPIRATION = 1000 * 60 * 60 * 2; // 2 hours

const ProspectList = ({ pageType, userMetaData, prospectListForceUpdate }) => {
  const [isProspectsLoading, setIsProspectsLoading] = useState(false);
  const [localProspects, setLocalProspects] = useState(new Set());
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

  const [savedAllSelected, setSavedAllSelected] = useState(false);
  const [deSelectedProspects, setDeSelectedProspects] = useState([]);

  // Add pagination state for saved leads
  const [savedLeadsPagination, setSavedLeadsPagination] = useState({
    start: 1,
    next: 10,
    total: 0,
    hasMore: false,
    isLoading: false,
  });

  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [isFirstPollRequest, setIsFirstPollRequest] = useState(true);
  const pollingAttemptsRef = useRef(0);

  const [showAddToSequenceModal, setShowAddToSequenceModal] = useState(false);

  const visibleProspects = activeTab === 'leads' ? prospects : savedProspects;

  const selectableProspects = visibleProspects.filter(
    (prospect) =>
      prospect.id &&
      !prospect.isRevealing &&
      (!prospect.isRevealed ||
        (prospect.isRevealed && !prospect.isCreditRefunded)),
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
  const [savedFilter, setSavedFilter] = useState({
    tags: [],
    startDate: null,
    endDate: null,
  });
  const [applyFiltersLoading, setApplyFiltersLoading] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isRateLimitReached, setIsRateLimitReached] = useState(false);

  const [showToaster, setShowToaster] = useState(false);
  const [toasterData, setToasterData] = useState({
    header: '',
    body: '',
    type: '',
  });

  const [
    isTagsModalForRevealedProspects,
    setIsTagsModalForRevealedProspects,
  ] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const leadFinderCredits = userMetaData?.leadFinderCredits;

  // Add a ref to track the latest localProspects state
  const localProspectsRef = useRef(new Set());
  const prospectsRef = useRef([]);
  const selectedProspectsRef = useRef([]);

  // Add ref to track processed request
  const processedRequestRef = useRef(null);

  // Update the ref whenever localProspects changes
  useEffect(() => {
    localProspectsRef.current = localProspects;
    prospectsRef.current = prospects;
    selectedProspectsRef.current = selectedProspects;
  }, [localProspects, prospects, selectedProspects]);

  // Helper function to check if two people arrays are the same
  const arePeopleArraysSame = (arr1, arr2) => {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    // Create a map of source_id_2 to person for the first array
    const map1 = new Map(arr1.map((person) => [person.source_id_2, person]));

    // Check if all items in second array match the first
    return arr2.every((person) => {
      const match = map1.get(person.source_id_2);
      return match && JSON.stringify(match) === JSON.stringify(person);
    });
  };

  const fetchProspects = async () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('bulkInfo'));
      if (!sessionData) return;

      const bulkInfo = sessionData?.people;
      if (!bulkInfo) return;

      try {
        // Use the ref to get the latest state of localProspects
        const currentLocalProspects = localProspectsRef.current;
        const currentProspects = prospectsRef.current;
        const currentSelectedProspects = selectedProspectsRef.current;

        // Get cached prospects from session storage
        const cachedProspects =
          JSON.parse(sessionStorage.getItem('prospect_result')) || {};

        // Filter out prospects that we've already fetched
        const prospectsToFetch =
          pageType === 'continuous'
            ? bulkInfo.filter(
                (item) => !currentLocalProspects.has(item.source_id_2),
              )
            : bulkInfo;

        if (prospectsToFetch.length > 0) {
          setIsProspectsLoading(true);

          // Separate prospects into cached and uncached
          const uncachedProspects = [];
          const cachedResults = [];

          prospectsToFetch.forEach((item) => {
            if (
              cachedProspects[item.source_id_2]?.profile &&
              !cachedProspects[item.source_id_2]?.profile?.isRevealing &&
              cachedProspects[item.source_id_2]?.timestamp >
                Date.now() - PROSPECT_CACHE_EXPIRATION
            ) {
              cachedResults.push(cachedProspects[item.source_id_2]?.profile);
            } else {
              uncachedProspects.push(item);
            }
          });

          let apiResponse = null;

          // Only make API call if there are uncached prospects
          if (uncachedProspects.length > 0) {
            const newLinkedinUrls = uncachedProspects.map(
              (item) => `https://www.linkedin.com/in/${item.source_id_2}`,
            );

            const payload = {
              start: 1,
              take: newLinkedinUrls.length,
              link: newLinkedinUrls,
            };

            apiResponse = await prospectsInstance.getProspects(payload);
          }

          // Combine cached and new results
          const allProfiles = [
            ...cachedResults,
            ...(apiResponse?.payload?.profiles || []),
          ];
          if (allProfiles.length > 0) {
            // Create a new Set with all existing prospects plus the new ones
            const updatedLocalProspects = new Set(currentLocalProspects);

            // Add the newly fetched prospect IDs to the Set
            prospectsToFetch.forEach((item) => {
              updatedLocalProspects.add(item.source_id_2);
            });
            let newProspects = [];
            let newSelectableProspects = [];
            // Get the current prospects from state
            if (pageType === 'continuous') {
              newProspects = [...currentProspects];
              newSelectableProspects = [...currentSelectedProspects];
            }

            // Create a map of existing prospects by linkedin_url for quick lookup
            const existingProspectsMap = new Map();
            newProspects.forEach((prospect) => {
              if (prospect.linkedin_url) {
                existingProspectsMap.set(prospect.linkedin_url, prospect);
              }
            });

            // Process new prospects and merge with existing ones
            allProfiles.forEach((profile) => {
              // Find matching local storage data
              const localData = bulkInfo.find(
                (item) =>
                  `https://www.linkedin.com/in/${item.source_id_2}` ===
                  profile.linkedin_url,
              );

              // Merge API response with local storage data
              const mergedProspect = {
                ...profile,
                description: localData?.description || profile.description,
                logo: localData?.logo || profile.logo,
                linkedin_url: localData?.linkedin_url || profile.linkedin_url,
              };

              // Update the map with the merged prospect
              existingProspectsMap.set(profile.linkedin_url, mergedProspect);

              // add the prospect to the new selectable prospects
              if (
                profile.id &&
                !profile.isRevealing &&
                (!profile.isRevealed ||
                  (profile.isRevealed && !profile.isCreditRefunded))
              ) {
                newSelectableProspects.push(profile.id);
              }
            });

            // add the prospect that are not present in the response
            const notFoundProspects = {};
            prospectsToFetch.forEach((item) => {
              if (
                !existingProspectsMap.has(
                  `https://www.linkedin.com/in/${item.source_id_2}`,
                )
              ) {
                const notPresentProspect = {
                  ...item,
                  linkedin_url: `https://www.linkedin.com/in/${item.source_id_2}`,
                };
                existingProspectsMap.set(
                  `https://www.linkedin.com/in/${item.source_id_2}`,
                  notPresentProspect,
                );
                notFoundProspects[item.source_id_2] = {
                  profile: notPresentProspect,
                  timestamp: Date.now(),
                };
              }
            });

            // Cache the new results
            let updatedCache = {};
            if (
              Object.keys(cachedProspects).length >= MAX_PROSPECT_CACHE_SIZE
            ) {
              updatedCache = { ...notFoundProspects };
            } else {
              updatedCache = { ...cachedProspects, ...notFoundProspects };
            }
            if (apiResponse?.payload?.profiles) {
              apiResponse.payload.profiles.forEach((profile) => {
                const sourceId = profile.linkedin_url?.split('/in/')[1];
                if (sourceId) {
                  updatedCache[sourceId] = {
                    profile,
                    timestamp: Date.now(),
                  };
                }
              });
            }
            sessionStorage.setItem(
              'prospect_result',
              JSON.stringify(updatedCache),
            );

            // Convert the map back to an array
            const updatedProspects = Array.from(existingProspectsMap.values());

            // Update prospects state and storage
            setProspects(updatedProspects);
            setLocalProspects(updatedLocalProspects);
            setSelectedProspects(newSelectableProspects);
          }

          if (apiResponse?.type === 'rate-limit') {
            setIsRateLimitReached(true);
          }
          if (apiResponse?.error) {
            setToasterData({
              header: 'Error',
              body:
                apiResponse?.message ||
                (apiResponse?.messages &&
                  apiResponse?.messages?.length > 0 &&
                  apiResponse?.messages[0]),
              type: 'danger',
            });
            setShowToaster(true);
          }
          setIsProspectsLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchProspects callback:', error);
        setIsProspectsLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchProspects:', error);
    }
  };

  const getSavedLeads = async (isLoadMore = false) => {
    try {
      // If loading more, use the next value from pagination
      const start = isLoadMore ? savedLeadsPagination.next : 1;

      // Set loading state
      if (isLoadMore) {
        setSavedLeadsPagination((prev) => ({ ...prev, isLoading: true }));
      }

      const payload = {
        start,
        take: 10,
      };

      const response = await prospectsInstance.getSavedLeads(payload);

      if (
        response &&
        response.payload &&
        response.payload.profiles &&
        response.payload.profiles.length > 0
      ) {
        // If loading more, append to existing prospects
        if (isLoadMore) {
          setSavedProspects((prev) => [...prev, ...response.payload.profiles]);
        } else {
          setSavedProspects(response.payload.profiles);
        }
      }

      // Update pagination state
      if (response?.payload?.pagination) {
        const { total, next } = response.payload.pagination;
        setSavedCount(total);

        setSavedLeadsPagination((prev) => ({
          ...prev,
          start,
          next,
          total,
          hasMore: next <= total,
          isLoading: false,
        }));
      }
    } catch (e) {
      console.log('error', e);
      setSavedLeadsPagination((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const bulkRevealProspects = async (payload) => {
    try {
      setSelectedRevealType(payload?.revealType);
      const bulkRevealRes = await prospectsInstance.bulkRevealProspects(
        payload,
      );
      if (bulkRevealRes) {
        if (bulkRevealRes.error) {
          setToasterData({
            header: 'Error',
            body: bulkRevealRes?.error?.message,
            type: 'danger',
          });
          setShowToaster(true);
        } else {
          const { message, status, shouldPoll, title } = bulkRevealRes.payload;
          if (status === 0) {
            console.log('error', message);
          } else if (status === 2) {
            console.log('warning', message);
          } else {
            const newRevealingProspects = {
              ...revealingProspects,
              ...Object.fromEntries(payload?.leadIds?.map((id) => [id, true])),
            };
            if (shouldPoll) {
              pollingAttemptsRef.current = 0;
              setRevealingProspects(newRevealingProspects);
              setIsPollingEnabled(true);
              // update the cached prospects
              const cachedProspects = JSON.parse(
                sessionStorage.getItem('prospect_result'),
              );
              payload?.leadIds?.forEach((id) => {
                const revealingProspect = prospects.find((p) => p.id === id);
                const sourceId = revealingProspect?.linkedin_url?.split(
                  '/in/',
                )[1];
                if (sourceId) {
                  revealingProspect.isRevealing = true;
                  cachedProspects[sourceId] = {
                    profile: revealingProspect,
                    timestamp: Date.now(),
                  };
                }
              });
              sessionStorage.setItem(
                'prospect_result',
                JSON.stringify(cachedProspects),
              );
            } else {
              setIsPollingEnabled(false);
            }
            setToasterData({
              header: title || 'Lead reveal initiated',
              body: message,
              type: 'success',
            });
            setShowToaster(true);
          }
        }
      }
    } catch (error) {
      console.error('Error in bulkRevealProspects:', error);
    }
  };

  const addToSequence = async (payload) => {
    try {
      const response = await prospectsInstance.addToSequence(payload);
      if (response && response.payload && response.payload.message) {
        setToasterData({
          header: 'Add to Sequence Initiated',
          body: response?.payload?.message,
          type: 'success',
        });
        setShowToaster(true);
      }
      if (response?.error) {
        setToasterData({
          header: 'Error',
          body: response?.error?.message,
          type: 'danger',
        });
        setShowToaster(true);
      }
    } catch (error) {
      console.error('Error in addToSequence:', error);
    }
  };

  const bulkAddToSequence = async (payload) => {
    try {
      const response = await prospectsInstance.bulkAddToSequence(payload);
      if (response && response.payload && response.payload.message) {
        setToasterData({
          header: 'Add to Sequence Initiated',
          body: response?.payload?.message,
          type: 'success',
        });
        setShowToaster(true);
        setSavedAllSelected(false);
        setSelectedProspects([]);
        setDeSelectedProspects([]);
      }
      if (response?.error) {
        setToasterData({
          header: 'Error',
          body: response?.error?.message,
          type: 'danger',
        });
        setShowToaster(true);
      }
    } catch (error) {
      console.error('Error in bulkAddToSequence:', error);
    }
  };

  const addTagsToRevealedProspects = async (payload) => {
    try {
      const response = await prospectsInstance.saveTags(payload);
      if (response && response.message) {
        getSavedLeads();
        setToasterData({
          header: 'Tags applied successfully',
          body: response.message,
          type: 'success',
        });
        setShowToaster(true);
      }
      if (response?.error) {
        setToasterData({
          header: 'Error',
          body: response?.error?.message,
          type: 'danger',
        });
        setShowToaster(true);
      }
    } catch (error) {
      console.error('Error in addTagsToRevealedProspects:', error);
    }
  };

  const bulkAddTagsToRevealedProspects = async (payload) => {
    try {
      const response = await prospectsInstance.bulkSaveTags(payload);
      if (response && response.message) {
        getSavedLeads();
        setToasterData({
          header: 'Tags applied successfully',
          body: response.message,
          type: 'success',
        });
        setShowToaster(true);
        setSavedAllSelected(false);
        setSelectedProspects([]);
        setDeSelectedProspects([]);
      }
      if (response?.error) {
        setToasterData({
          header: 'Error',
          body: response?.error?.message,
          type: 'danger',
        });
        setShowToaster(true);
      }
    } catch (error) {
      console.error('Error in bulkAddTagsToRevealedProspects:', error);
    }
  };

  const handleApplyTags = async () => {
    try {
      setRevealProspectLoading({
        ignore: false,
        apply: true,
        save: false,
      });
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

      if (isTagsModalForRevealedProspects) {
        if (activeTab === 'saved' && savedAllSelected) {
          const leadsFilter = {};

          if (savedFilter.tags) {
            leadsFilter.tags = savedFilter.tags;
          }
          if (savedFilter.startDate) {
            leadsFilter.startDate = savedFilter.startDate;
          }
          if (savedFilter.endDate) {
            leadsFilter.endDate = savedFilter.endDate;
          }
          const payload = {
            deSelectedLeadIds: deSelectedProspects,
            newTags,
            tagIds,
            leadsFilter,
          };
          await bulkAddTagsToRevealedProspects(payload);
        } else {
          const payload = {
            leads: selectedProspects,
            tagIds,
            newTags,
          };
          await addTagsToRevealedProspects(payload);
        }
      } else {
        const payload = {
          leadIds: selectedProspects,
          revealType: selectedRevealType,
          tagIds,
          newTags,
        };
        await bulkRevealProspects(payload);
      }
    } catch (error) {
      console.error('Error in handleApplyTags:', error);
    } finally {
      setRevealProspectLoading({
        ignore: false,
        apply: false,
        save: false,
      });
      setSelectedProspects([]);
      setSelectedTags([]);
      setShowTagsModal(false);
    }
  };

  const handleIgnoreTags = async () => {
    try {
      const payload = {
        leadIds: selectedProspects,
        revealType: selectedRevealType,
      };
      setRevealProspectLoading({
        ignore: true,
        apply: false,
        save: false,
      });
      await bulkRevealProspects(payload);
    } catch (error) {
      console.error('Error in handleIgnoreTags:', error);
    } finally {
      setRevealProspectLoading({
        ignore: false,
        apply: false,
        save: false,
      });
      setSelectedProspects([]);
      setSelectedTags([]);
      setShowTagsModal(false);
    }
  };

  // eslint-disable-next-line no-shadow
  const handleAddToSequence = async (data) => {
    try {
      setRevealProspectLoading({
        ignore: false,
        apply: false,
        save: true,
      });
      let payload = {};
      if (activeTab === 'saved') {
        if (savedAllSelected) {
          const leadsFilter = {};

          if (savedFilter.tags) {
            leadsFilter.tags = savedFilter.tags;
          }
          if (savedFilter.startDate) {
            leadsFilter.startDate = savedFilter.startDate;
          }
          if (savedFilter.endDate) {
            leadsFilter.endDate = savedFilter.endDate;
          }
          payload = {
            deSelectedLeadIds: deSelectedProspects,
            sequenceId: data.sequenceId,
            stepId: data.stepId,
            tagIdsToAssign: data.tagIds,
            newTagsToAssign: data.newTags,
            leadsFilter,
          };
          await bulkAddToSequence(payload);
        } else {
          payload = {
            leadIds: selectedProspects,
            sequenceId: data.sequenceId,
            stepId: data.stepId,
            tagIds: data.tagIds,
            newTags: data.newTags,
          };
          await addToSequence(payload);
        }
      } else {
        const revealedLeadIds = selectedProspects.filter(
          (prospect) => prospects.find((p) => p.id === prospect)?.isRevealed,
        );
        const nonRevealedLeadIds = selectedProspects.filter(
          (prospect) => !prospects.find((p) => p.id === prospect)?.isRevealed,
        );
        if (revealedLeadIds?.length > 0) {
          payload = {
            leadIds: revealedLeadIds,
            tagIds: data.tagIds,
            newTags: data.newTags,
            sequenceId: data.sequenceId,
            stepId: data.stepId,
          };
          await addToSequence(payload);
        }
        if (nonRevealedLeadIds?.length > 0) {
          payload = {
            leadIds: nonRevealedLeadIds,
            revealType: 'email',
            tagIds: data.tagIds,
            newTags: data.newTags,
            sequenceId: data.sequenceId,
            stepId: data.stepId,
          };
          await bulkRevealProspects(payload);
        }
      }
    } catch (error) {
      console.error('Error in handleAddToSequence:', error);
    } finally {
      setRevealProspectLoading({
        ignore: false,
        apply: false,
        save: false,
      });
      setSelectedProspects([]);
      setShowAddToSequenceModal(false);
    }
  };

  const handleViewContact = (type) => {
    setSelectedRevealType(type);
    const newSelectedProspects = selectableProspects
      .filter(
        (prospect) =>
          selectedProspects.includes(prospect.id) &&
          ((type === 'email' && !prospect.isRevealed) ||
            (type === 'emailphone' &&
              ((prospect.isRevealed &&
                prospect.reReveal &&
                prospect?.teaser?.phones?.length > 0) ||
                !prospect.isRevealed))),
      )
      .map((prospect) => prospect.id);
    setSelectedProspects(newSelectedProspects);
    setShowTagsModal(true);
  };

  const handleFetchLead = async () => {
    try {
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
        const remainingProspects = Object.keys(
          updatedRevealingProspects,
        ).filter((id) => updatedRevealingProspects[id]);
        if (remainingProspects.length === 0) {
          setIsPollingEnabled(false);
        }
        setRevealingProspects(updatedRevealingProspects);
        setProspects(updatedProspects);
        setToasterData({
          header: response?.payload?.title || 'Leads Revealed Successfully',
          body: response?.payload?.message,
          type: 'success',
        });
        setShowToaster(true);
      }
    } catch (error) {
      console.error('Error in handleFetchLead:', error);
    }
  };

  const refreshProspects = async () => {
    try {
      const linkedinUrls = [];
      const cachedProspects = JSON.parse(
        sessionStorage.getItem('prospect_result'),
      );
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
        if (response && response.payload && response.payload.profiles) {
          setRevealingProspects({});
          const updatedProspects = [...prospects];
          response?.payload?.profiles?.forEach((profile) => {
            const prospectIndex = updatedProspects.findIndex(
              (p) => p.id === profile.id,
            );
            if (prospectIndex !== -1) {
              updatedProspects[prospectIndex] = {
                ...profile,
                description: updatedProspects[prospectIndex]?.description,
                logo: updatedProspects[prospectIndex]?.logo,
              };
            }
            const sourceId = profile?.linkedin_url?.split('/in/')[1];
            if (sourceId) {
              cachedProspects[sourceId] = {
                profile,
                timestamp: Date.now(),
              };
            }
          });
          sessionStorage.setItem(
            'prospect_result',
            JSON.stringify(cachedProspects),
          );
          setProspects(updatedProspects);
        }

        if (response?.error) {
          setToasterData({
            header: 'Error',
            body:
              response?.message ||
              (response?.messages &&
                response?.messages?.length > 0 &&
                response?.messages[0]),
            type: 'danger',
          });
          setShowToaster(true);
        }
      }
    } catch (error) {
      console.error('Error in refreshProspects:', error);
    }
  };

  // Function to handle scroll and load more saved leads
  const handleScroll = () => {
    try {
      if (activeTab !== 'saved') return;

      const container = document.getElementById(
        'prospect-list-items-container',
      );
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollThreshold = 100; // pixels from bottom to trigger load

      // Check if we're near the bottom and not already loading
      if (
        scrollHeight - scrollTop - clientHeight < scrollThreshold &&
        !savedLeadsPagination.isLoading &&
        savedLeadsPagination.hasMore
      ) {
        getSavedLeads(true);
      }
    } catch (error) {
      console.error('Error in handleScroll:', error);
    }
  };

  const switchTabTo = (tab) => {
    setActiveTab(tab);
    setSelectedProspects([]);
    setSavedAllSelected(false);
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1000);
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
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
          } catch (fallbackErr) {
            console.error('Fallback: Oops, unable to copy', fallbackErr);
          }
          document.body.removeChild(textArea);
        });
    } catch (error) {
      console.error('Error in copyToClipboard:', error);
    }
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
      const currentFilter = {
        tags: selectedTagFilters.map((tag) => tag.value),
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

          currentFilter.startDate = formattedStartDate;
          currentFilter.endDate = formattedEndDate;

          const createdDateString = `${formattedStartDate},${formattedEndDate}`;
          payload.createdDate = encodeURIComponent(createdDateString);
        }
      }
      setSavedFilter(currentFilter);
      const response = await prospectsInstance.getSavedLeads(payload);
      if (response && response.payload && response.payload.profiles) {
        setSavedProspects(response.payload.profiles);
        setIsFilterApplied(true);

        // Reset pagination state for filtered results
        if (response?.payload?.pagination) {
          const { total, next } = response.payload.pagination;
          setSavedCount(total);

          setSavedLeadsPagination({
            start: 1,
            next,
            total,
            hasMore: next <= total,
            isLoading: false,
          });
        }
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
    try {
      setSelectedTagFilters([]);
      setDateFilterValue(null);
      setApplyFiltersLoading(false);
      setSavedProspects([]);
      setSavedCount(0);
      setIsFilterApplied(false);
      // Reset pagination state
      setSavedLeadsPagination({
        start: 1,
        next: 10,
        total: 0,
        hasMore: false,
        isLoading: false,
      });
      getSavedLeads();
    } catch (error) {
      console.error('Error in clearFilters:', error);
    }
  };

  useEffect(() => {
    try {
      getSavedLeads();
    } catch (error) {
      console.error('Error in initial useEffect:', error);
    }
  }, []);

  useEffect(() => {
    const handleUpdateProspectList = async (request) => {
      const isModalClosed = await chrome.storage.local.get(['isModalClosed']);
      if (request?.method === 'set-bulkInfo' && !isModalClosed?.isModalClosed) {
        // Check if this request has already been processed
        if (
          processedRequestRef.current &&
          arePeopleArraysSame(
            processedRequestRef.current?.peopleInfo?.people,
            request?.peopleInfo?.people,
          )
        ) {
          return;
        }

        const requestUrl = request?.peopleInfo?.oldurl;
        const localUrl = JSON.parse(sessionStorage.getItem('bulkInfo'))?.oldurl;
        if (
          requestUrl &&
          requestUrl.includes('linkedin.com/company/') &&
          requestUrl.includes('/people') &&
          requestUrl === localUrl
        ) {
          const existingPeople = JSON.parse(sessionStorage.getItem('bulkInfo'))
            ?.people;
          const newPeople = request?.peopleInfo?.people;
          const combinedPeople = [...existingPeople, ...newPeople];
          const uniquePeople = combinedPeople.filter(
            (person, index, self) =>
              index ===
              self.findIndex((t) => t.source_id_2 === person.source_id_2),
          );
          sessionStorage.setItem(
            'bulkInfo',
            JSON.stringify({
              oldurl: requestUrl,
              people: uniquePeople,
            }),
          );
        } else {
          sessionStorage.setItem(
            'bulkInfo',
            JSON.stringify(request?.peopleInfo),
          );
        }
        fetchProspects();
        // Store the processed request
        processedRequestRef.current = request;
      }
    };

    chrome.runtime.onMessage.addListener(handleUpdateProspectList);

    return () =>
      chrome.runtime.onMessage.removeListener(handleUpdateProspectList);
  }, []);

  // Add effect to handle force update
  useEffect(() => {
    if (prospectListForceUpdate) {
      console.log('prospectListForceUpdate', prospectListForceUpdate);
      fetchProspects();
    }
  }, [prospectListForceUpdate]);

  // Add effect to handle body scroll lock
  useEffect(() => {
    try {
      if (showTagsModal) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
      return () => {
        document.body.classList.remove('modal-open');
      };
    } catch (error) {
      console.error('Error in modal scroll lock useEffect:', error);
    }
  }, [showTagsModal]);

  // Add scroll event listener for infinite scroll
  useEffect(() => {
    try {
      const container = document.getElementById(
        'prospect-list-items-container',
      );
      if (container) {
        container.addEventListener('scroll', handleScroll);
      }

      return () => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
      };
    } catch (error) {
      console.error('Error in scroll event listener useEffect:', error);
    }
  }, [activeTab, savedLeadsPagination.isLoading, savedLeadsPagination.hasMore]);

  useEffect(() => {
    try {
      let intervalId = null;

      if (isPollingEnabled) {
        intervalId = setInterval(() => {
          pollingAttemptsRef.current++;
          if (pollingAttemptsRef.current >= MAX_POLLING_LIMIT) {
            setIsPollingEnabled(false);
          }
          const shouldContinuePolling =
            isFirstPollRequest ||
            pollingAttemptsRef.current < MAX_POLLING_LIMIT;

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
    } catch (error) {
      console.error('Error in polling useEffect:', error);
    }
  }, [isPollingEnabled, revealingProspects]);

  // Add effect to listen for modal close
  useEffect(() => {
    const handleModalClose = (changes) => {
      if (changes.isModalClosed?.newValue === true) {
        pollingAttemptsRef.current = 0;
        setIsPollingEnabled(false);
      }
    };

    chrome.storage.onChanged.addListener(handleModalClose);

    return () => {
      chrome.storage.onChanged.removeListener(handleModalClose);
    };
  }, []);

  const metaCall = async () => {
    const metaData = (await mailboxInstance.getMetaData())?.payload;

    if (metaData) {
      chrome.storage.local.set({ saleshandyMetaData: metaData });
    }
  };

  // Separate useEffect for handling polling completion
  useEffect(() => {
    try {
      if (!isPollingEnabled && pollingAttemptsRef.current > 0) {
        // Only refresh prospects when polling is actually stopped
        refreshProspects();
        setIsFirstPollRequest(true);
        metaCall();
        clearFilters();
      }
    } catch (error) {
      console.error('Error in polling completion useEffect:', error);
    }
  }, [isPollingEnabled]);

  useEffect(() => {
    if (prospects.length > 0) {
      const isRevealingProspects = prospects
        .filter((prospect) => prospect.isRevealing)
        ?.map((prospect) => [prospect.id, true]);
      if (
        isRevealingProspects.length > 0 &&
        !isPollingEnabled &&
        pollingAttemptsRef.current === 0
      ) {
        setRevealingProspects(Object.fromEntries(isRevealingProspects));
        setIsPollingEnabled(true);
      }
    }
  }, [prospects]);

  const toggleProspectSelection = (prospectId) => {
    if (activeTab === 'saved' && savedAllSelected) {
      setDeSelectedProspects((prev) =>
        prev.includes(prospectId)
          ? prev.filter((id) => id !== prospectId)
          : [...prev, prospectId],
      );
    } else {
      setSelectedProspects((prev) =>
        prev.includes(prospectId)
          ? prev.filter((id) => id !== prospectId)
          : [...prev, prospectId],
      );
    }
  };

  const toggleAllProspectsSelection = () => {
    if (activeTab === 'saved') {
      setSavedAllSelected((prev) => !prev);
    } else {
      setSelectedProspects(
        selectedProspects.length === selectableProspects.length
          ? []
          : selectableProspects.map((prospect) => prospect.id),
      );
    }
  };

  const handleAddTagsForRevealedProspects = () => {
    setIsTagsModalForRevealedProspects(true);
    setShowTagsModal(true);
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
      {Array.from({ length: 10 }).map((_, index) => (
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

  const getExpandIcon = (prospect) => {
    if (
      !prospect.id ||
      !prospect.isRevealed ||
      (prospect.id &&
        prospect.isRevealed &&
        (prospect.emails.length > 1 ||
          prospect.phones.length > 0 ||
          prospect.sequences.length > 0 ||
          prospect.tags.length > 0))
    ) {
      return true;
    }

    return false;
  };

  const getProspectDescription = (prospect) => {
    if (!prospect.id || (prospect.isRevealed && prospect.isCreditRefunded)) {
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
          <img
            src={alertCircle}
            alt="alert"
            data-tooltip-id="email-unavailable-tooltip"
            data-tooltip-content={
              !prospect.id
                ? 'Email is not available'
                : 'Email is not available your credit is refunded'
            }
          />
        </div>
      );
    }
    if (prospect?.isRevealed && prospect?.emails?.length > 0) {
      return (
        <div className="prospect-description-revealed cursor-pointer">
          <img src={mail} alt="email" />
          <span
            className="prospect-description-revealed-email"
            data-tooltip-id={
              prospect?.emails[0]?.email?.length > 18
                ? 'prospect-data-tooltip'
                : null
            }
            data-tooltip-content={prospect?.emails[0]?.email}
          >
            {prospect?.emails[0]?.email?.length > 18
              ? `${prospect?.emails[0]?.email?.slice(0, 18)}..`
              : prospect?.emails[0]?.email}
          </span>
          <img src={circleCheck} alt="circle-check" />
          <div
            className="copy-icon"
            onClick={() => copyToClipboard(prospect?.emails[0]?.email)}
            data-tooltip-id="my-tooltip-copy"
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

  const getViewContactButton = (type) => {
    const isAllRevealed = selectableProspects
      .filter((prospect) => selectedProspects.includes(prospect.id))
      .every(
        (prospect) =>
          (type === 'email' && prospect.isRevealed) ||
          (type === 'emailphone' &&
            prospect.isRevealed &&
            !(prospect.reReveal && prospect?.teaser?.phones?.length > 0)),
      );
    const shouldDisable =
      selectedProspects.length === 0 ||
      isAllRevealed ||
      savedAllSelected ||
      (leadFinderCredits < 1 * selectedProspects.length && type === 'email') ||
      (leadFinderCredits < 2 * selectedProspects.length &&
        type === 'emailphone');
    return (
      <div className="tooltip-container">
        <CustomButton
          variant={type === 'email' ? 'primary' : 'outline'}
          className={
            type === 'email'
              ? 'action-button email'
              : 'action-icon-button email-phone'
          }
          onClick={() => handleViewContact(type)}
          disabled={shouldDisable}
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
  };

  const getAddToSequenceButton = (isExpanded = false) => (
    <CustomButton
      variant="outline"
      className={isExpanded ? 'action-button sequence' : 'action-icon-button'}
      disabled={
        (selectedProspects.length === 0 && activeTab === 'leads') ||
        userMetaData?.isFreePlanUser ||
        (activeTab === 'saved' &&
          !savedAllSelected &&
          selectedProspects.length === 0)
      }
      onClick={() => setShowAddToSequenceModal(true)}
      dataTooltipId={userMetaData?.isFreePlanUser ? 'is-free-plan-user' : null}
    >
      <img src={send} alt="send" />
      {isExpanded ? 'Sequence' : ''}
    </CustomButton>
  );

  const getTagButton = () => (
    <CustomButton
      variant="outline"
      className="action-icon-button"
      disabled={
        (selectedProspects.length === 0 && activeTab === 'leads') ||
        userMetaData?.isFreePlanUser ||
        (activeTab === 'saved' &&
          !savedAllSelected &&
          selectedProspects.length === 0)
      }
      onClick={handleAddTagsForRevealedProspects}
      dataTooltipId={userMetaData?.isFreePlanUser ? 'is-free-plan-user' : null}
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

  // Add a function to render the loading spinner at the bottom of the list
  const renderLoadingSpinner = () => {
    if (activeTab === 'saved' && savedLeadsPagination.isLoading) {
      return (
        <div className="loading-spinner-container">
          <div className="spinner" />
          <span>Loading more prospects...</span>
        </div>
      );
    }
    return null;
  };

  const getProspectListTabs = () => (
    <div className="prospect-tabs">
      <div
        className={`prospect-tab ${activeTab === 'leads' ? 'active' : ''}`}
        onClick={() => switchTabTo('leads')}
      >
        <span>Leads Available</span>
      </div>
      <div
        className={`prospect-tab saved-tab ${
          activeTab === 'saved' ? 'active' : ''
        }`}
        onClick={() => switchTabTo('saved')}
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
                <div className="custom-tooltip tooltip-bottom">Filter</div>
              </div>
              {isFilterApplied && (
                <div className="clear-filter" onClick={clearFilters}>
                  <img src={cross} alt="cross" />
                </div>
              )}
            </div>
            {showProspectFilterModal && (
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
            )}
          </div>
        )}
      </div>
      <div
        className={`prospect-tab-highlight ${
          activeTab === 'leads' ? 'leads' : 'saved'
        }`}
      />
    </div>
  );

  if (isRateLimitReached) {
    return <RateLimitReached />;
  }

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
          {showToaster && (
            <Toaster
              header={toasterData.header}
              body={toasterData.body}
              type={toasterData.type}
              onClose={() => setShowToaster(false)}
            />
          )}
          {visibleProspects.length === 0 ? (
            isFilterApplied ? (
              <>
                {getProspectListTabs()}
                <NoProspectFound />
              </>
            ) : (
              <>
                {getProspectTabsSkeleton()}
                <div className="prospect-tab-actions-skeleton" />
                {getProspectListItemsSkeleton()}
              </>
            )
          ) : (
            <>
              {getProspectListTabs()}
              <div className="prospect-tab-actions">
                <div className="action-checkbox">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleAllProspectsSelection()}
                  >
                    <img
                      src={
                        selectedProspects.length ===
                          selectableProspects.length ||
                        (activeTab === 'saved' && savedAllSelected)
                          ? checkboxChecked
                          : checkbox
                      }
                      alt="checkbox"
                    />
                  </div>
                  <span>
                    {activeTab === 'saved' && savedAllSelected
                      ? 'All'
                      : selectedProspects.length > 0
                      ? selectedProspects.length
                      : 'All'}
                  </span>
                </div>
                <div className="action-divider" />
                {getActionButtons()}
              </div>
              {isProspectsLoading && pageType === 'pagination' ? (
                <>{getProspectListItemsSkeleton()}</>
              ) : (
                <div
                  id="prospect-list-items-container"
                  className="prospect-list-items-container"
                >
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
                                !prospect.id ||
                                (prospect.id &&
                                  prospect.isRevealed &&
                                  prospect.isCreditRefunded) ||
                                (activeTab === 'saved' &&
                                  selectedProspects?.length === 25 &&
                                  !selectedProspects.includes(prospect.id))
                                  ? 'checkbox-disabled'
                                  : ''
                              }`}
                              {...(prospect.id &&
                                !prospect.isCreditRefunded &&
                                (activeTab === 'leads' ||
                                  (activeTab === 'saved' &&
                                    (selectedProspects.includes(prospect.id) ||
                                      (selectedProspects?.length < 25 &&
                                        !selectedProspects.includes(
                                          prospect.id,
                                        ))))) && {
                                  onClick: () =>
                                    toggleProspectSelection(prospect.id),
                                })}
                            >
                              <img
                                src={
                                  (prospect.id &&
                                    selectedProspects.includes(prospect.id) &&
                                    !savedAllSelected) ||
                                  (activeTab === 'saved' &&
                                    savedAllSelected &&
                                    prospect.id &&
                                    prospect.isRevealed &&
                                    !prospect.isCreditRefunded &&
                                    !deSelectedProspects.includes(prospect.id))
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
                            } ${
                              prospect.id &&
                              getExpandIcon(prospect) &&
                              'cursor-pointer'
                            }`}
                            {...(prospect.id &&
                              getExpandIcon(prospect) && {
                                onClick: () =>
                                  setExpendedProspect(
                                    expendedProspect === prospect?.id
                                      ? null
                                      : prospect?.id,
                                  ),
                              })}
                          >
                            <div className="prospect-name">
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                {prospect?.name}
                                {prospect?.isRevealed &&
                                  prospect?.prospectStatus && (
                                    <ContactStatusTag
                                      status={prospect?.prospectStatus?.toString()}
                                    />
                                  )}
                              </span>
                              {getExpandIcon(prospect) && (
                                <div
                                  className={`prospect-item-expand-icon ${
                                    !prospect.id ? 'disabled' : 'cursor-pointer'
                                  }`}
                                  {...(prospect.id && {
                                    onClick: () =>
                                      setExpendedProspect(
                                        expendedProspect === prospect?.id
                                          ? null
                                          : prospect?.id,
                                      ),
                                  })}
                                >
                                  <img
                                    src={
                                      expendedProspect === prospect?.id
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
                      {/* emails */}
                      {expendedProspect === prospect.id && (
                        <div className="prospect-item-expanded">
                          {prospect?.isRevealed
                            ? prospect?.emails?.length > 0 &&
                              prospect?.emails?.slice(1).map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email cursor-pointer"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span
                                    className="prospect-description-revealed-email"
                                    data-tooltip-id={
                                      e?.email?.length > 18
                                        ? 'prospect-data-tooltip'
                                        : null
                                    }
                                    data-tooltip-content={e?.email}
                                  >
                                    {e?.email?.length > 18
                                      ? `${e?.email?.slice(0, 18)}..`
                                      : e?.email}
                                  </span>
                                  <img src={circleCheck} alt="circle-check" />
                                  <div
                                    className="copy-icon"
                                    onClick={() => copyToClipboard(e.email)}
                                    data-tooltip-id="my-tooltip-copy"
                                  >
                                    <img src={copy} alt="copy" />
                                  </div>
                                </div>
                              ))
                            : prospect?.teaser?.emails?.map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span>
                                    <span className="list-dots">
                                      {e?.length > 13 ? (
                                        <>
                                          &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;@
                                          {`${e.slice(0, 13)}..`}
                                        </>
                                      ) : (
                                        <>
                                          &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;@
                                          {e}
                                        </>
                                      )}
                                    </span>
                                  </span>
                                </div>
                              ))}
                          {/* phones */}
                          {prospect?.isRevealed && !prospect?.reReveal
                            ? prospect?.phones?.length > 0 &&
                              prospect?.phones?.map((phone) => (
                                <div
                                  className="prospect-item-expanded-phone cursor-pointer"
                                  key={phone.number}
                                >
                                  <img src={phoneSignal} alt="phone-signal" />
                                  <span>{phone?.number}</span>
                                  <div
                                    className="copy-icon"
                                    onClick={() =>
                                      copyToClipboard(phone?.number)
                                    }
                                    data-tooltip-id="my-tooltip-copy"
                                  >
                                    <img src={copy} alt="copy" />
                                  </div>
                                </div>
                              ))
                            : prospect?.teaser?.phones?.length > 0 &&
                              prospect?.teaser?.phones?.map((phone) => (
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
                                        data-tooltip-id="my-tooltip-copy"
                                      >
                                        <img src={copy} alt="copy" />
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                          {prospect?.sequences?.length > 0 && (
                            <div className="prospect-item-expanded-sequences">
                              <div className="prospect-item-expanded-sequences-title">
                                <img src={send2} alt="send" />
                                <span>
                                  {`Already in ${prospect?.sequences?.length}
                                  ${
                                    prospect?.sequences?.length === 1
                                      ? ' Sequence'
                                      : ' Sequences'
                                  }:`}
                                </span>
                              </div>
                              <div className="prospect-item-expanded-sequences-list">
                                {prospect?.sequences?.map((sequence) => (
                                  <div
                                    className="prospect-item-expanded-sequences-item"
                                    key={sequence?.sequenceId}
                                    data-tooltip-id={
                                      sequence?.sequenceName?.length > 23
                                        ? 'prospect-data-tooltip'
                                        : null
                                    }
                                    data-tooltip-content={
                                      sequence?.sequenceName
                                    }
                                  >
                                    <span>
                                      {sequence?.sequenceName?.length > 23
                                        ? `${sequence?.sequenceName?.slice(
                                            0,
                                            23,
                                          )}..`
                                        : sequence?.sequenceName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {prospect?.tags?.length > 0 && (
                            <div className="prospect-item-expanded-tags">
                              <div className="prospect-item-expanded-tags-title">
                                <img src={tag2} alt="tag" />
                                <span>Tags</span>
                              </div>
                              <div className="prospect-item-expanded-tags-list">
                                {prospect?.tags?.map((tag) => (
                                  <div
                                    className="prospect-item-expanded-tags-item"
                                    key={tag?.id}
                                    data-tooltip-id={
                                      tag?.name?.length > 10
                                        ? 'prospect-data-tooltip'
                                        : null
                                    }
                                    data-tooltip-content={tag?.name}
                                  >
                                    <span>
                                      {tag?.name?.length > 10
                                        ? `${tag?.name?.slice(0, 10)}..`
                                        : tag?.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Add loading spinner at the bottom of the list */}
                  {renderLoadingSpinner()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Tags Modal */}
      {showTagsModal && (
        <AddTagsModal
          showModal={showTagsModal}
          onClose={() => setShowTagsModal(false)}
          selectedTags={selectedTags}
          selectedProspects={selectedProspects}
          setSelectedTags={setSelectedTags}
          onApplyTags={handleApplyTags}
          onIgnoreTags={handleIgnoreTags}
          isLoading={revealProspectLoading}
          revealType={selectedRevealType}
          isTagsModalForRevealedProspects={isTagsModalForRevealedProspects}
        />
      )}

      {showAddToSequenceModal && (
        <AddToSequenceModal
          showModal={showAddToSequenceModal}
          onClose={() => setShowAddToSequenceModal(false)}
          handleAddToSequence={handleAddToSequence}
          isLoading={revealProspectLoading}
        />
      )}

      <ReactTooltip
        id="is-free-plan-user"
        place="bottom"
        opacity="1"
        content={
          <>
            Please upgrade your plan
            <br />
            to start adding prospects
          </>
        }
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          textAlign: 'center',
          borderRadius: '4px',
          backgroundColor: '#1F2937',
          padding: '8px',
        }}
      />
      <ReactTooltip
        id="my-tooltip-copy"
        place="bottom"
        content={isCopied ? 'Copied' : 'Copy'}
        opacity="1"
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          textAlign: 'center',
          borderRadius: '4px',
          backgroundColor: '#1F2937',
          padding: '8px',
        }}
      />
      <ReactTooltip
        id="prospect-data-tooltip"
        place="bottom"
        opacity="1"
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          textAlign: 'left',
          borderRadius: '4px',
          backgroundColor: '#1F2937',
          padding: '8px',
          display: 'flex',
          maxWidth: '184px',
          textWrap: 'wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
      <ReactTooltip
        id="email-unavailable-tooltip"
        place="bottom"
        opacity="1"
        style={{
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          textAlign: 'center',
          borderRadius: '4px',
          backgroundColor: '#1F2937',
          padding: '8px',
          display: 'flex',
          maxWidth: '167px',
          textWrap: 'wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
    </>
  );
};

export default ProspectList;
