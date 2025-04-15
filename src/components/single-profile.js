import React, { useEffect, useState, useRef } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Header from './header';
import NogenderAvatar from './no-gender-avatar';
import AddToSequence from './add-to-sequence';
import AddTagsSelect from './add-tags';
import Toaster from './toaster';
import './responsive-screen.css';
import ContactStatusTag from './contact-status-tag/contact-status-tag';
import prospectsInstance from '../config/server/finder/prospects';
import SingleProfileSkeleton from './single-profile-skeleton';
import NoResult from './no-result';

const BULK_ACTION_TIMEOUT = 12000;
const MAX_POLLING_LIMIT = 20;

const SingleProfile = () => {
  // useState
  const [isEmailCopyiconDisplay, setIsEmailCopyIconDisplay] = useState(false);
  const [isViewEmailPhoneHover, setIsViewEmailPhoneHover] = useState(false);

  const [isPhoneCopyiconDisplay, setIsPhoneCopyIconDisplay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showToaster, setShowToaster] = useState(false);
  const [toasterData, setToasterData] = useState({
    header: '',
    body: '',
    type: '',
  });
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sequenceTags, setSequenceTags] = useState([]);

  // new state
  const [prospect, setProspect] = useState({});
  const singleleadsData = [prospect];
  const [revealType, setRevealType] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const pollingAttemptsRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const [tagOptions, setTagOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSequences, setClientSequences] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [sequenceOptions, setSequenceOptions] = useState([]);
  const [stepOptions, setStepOptions] = useState([]);

  const [isAgency, setIsAgency] = useState(false);

  const [expandedSection, setExpandedSection] = useState(null);

  const [btnLoadingStatus, setBtnLoadingStatus] = useState({
    addToSequence: false,
    saveTags: false,
  });

  const fetchProspect = async () => {
    try {
      chrome.storage.local.get(['personInfo'], async (result) => {
        const localData = result.personInfo;
        if (localData && localData.sourceId2) {
          const linkedinUrl = `https://www.linkedin.com/in/${localData.sourceId2}`;
          setIsLoading(true);

          const payload = {
            start: 1,
            take: 1,
            link: [linkedinUrl],
          };

          const response = await prospectsInstance.getProspects(payload);

          if (response) {
            if (!response.payload) {
              throw new Error('No data received from API');
            }

            if (response?.payload?.profiles?.length > 0) {
              setProspect({
                ...response?.payload?.profiles[0],
                headline: localData.headline,
                locality: localData.locality,
                logo: localData.logo,
              });

              if (response?.payload?.profiles[0]?.tags?.length > 0) {
                setSelectedTags(
                  response?.payload?.profiles[0]?.tags?.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                    data: tag,
                  })),
                );
              }
            } else {
              setProspect({});
            }
          }
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Error fetching prospect:', err);
      setIsLoading(false);
      setProspect({});
    }
  };

  const revealProspect = async (leadRevealType) => {
    try {
      setIsRevealing(true);
      const payload = {
        leadId: prospect.id,
        revealType: leadRevealType,
      };

      const response = await prospectsInstance.revealProspect(payload);

      if (response) {
        const { message, status } = response.payload;
        if (status === 0) {
          console.log('error', message);
        } else if (status === 2) {
          console.log('warning', message);
        } else {
          setIsPollingEnabled(true);
          setToasterData({
            header: 'Lead reveal initiated',
            body: message,
            type: 'success',
          });
          setShowToaster(true);
          console.log(
            'success',
            message ||
              'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
          );
        }
      }
    } catch (err) {
      console.error('Error revealing prospect:', err);
      setToasterData({
        header: 'Lead reveal failed',
        body: err.message,
        type: 'danger',
      });
      setShowToaster(true);
      setIsRevealing(false);
    }
  };

  const handleFetchLead = async () => {
    const allRevealingProspectIds = [prospect.id];
    const payload = {
      leadIds: allRevealingProspectIds,
      revealType: revealType || 'email',
      isBulkAction: true,
    };
    const response = await prospectsInstance.leadStatus(payload);
    if (
      response &&
      response.payload &&
      response.payload.profiles &&
      response.payload.profiles.length > 0
    ) {
      if (
        response.payload.profiles[0].isRevealed &&
        !response.payload.profiles[0].isRevealing
      ) {
        setIsPollingEnabled(false);
        setToasterData({
          header: 'Email is revealed',
          body: response?.payload?.message,
          type: 'success',
        });
        setShowToaster(true);
      } else {
        setIsPollingEnabled(true);
      }
    }
  };

  const fetchTags = async () => {
    try {
      const res = await prospectsInstance.getTags();
      if (
        res &&
        res.payload &&
        Array.isArray(res.payload) &&
        res.payload.length > 0
      ) {
        const tags = res.payload.map((tag) => ({
          value: tag.id,
          label: tag.name,
          data: tag,
        }));
        setTagOptions(tags);
      } else {
        console.log('No tags found or empty response, using fallback tags');
        // Keep using fallback tags if API returns empty or invalid data
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      // Keep using fallback tags if API call fails
    }
  };

  const fetchAgencyClients = async () => {
    try {
      chrome.storage.local.get(['saleshandyMetaData'], async (result) => {
        const isAgencyUser =
          result?.saleshandyMetaData?.user?.isAgencyficationActive;
        if (isAgencyUser) {
          setIsAgency(true);
          const res = await prospectsInstance.getAgencyClients();
          if (
            res &&
            res.payload &&
            res.payload.clients &&
            Array.isArray(res.payload.clients) &&
            res.payload.clients.length > 0
          ) {
            const clients = res.payload.clients.map((client) => ({
              value: client.id,
              label: `${client.firstName} ${client.lastName}`,
            }));
            setClientOptions(clients);
          }
        } else {
          setIsAgency(false);
        }
      });
    } catch (err) {
      console.error('Error fetching agency clients:', err);
    }
  };

  const fetchSequences = async () => {
    try {
      const res = await prospectsInstance.getSequences();
      if (
        res &&
        res.payload &&
        Array.isArray(res.payload) &&
        res.payload.length > 0
      ) {
        // setSequences(res.payload);
        const recentSequences = [];
        const remainingSequences = [];
        res.payload.forEach((sequence) => {
          if (sequence.isRecent) {
            recentSequences.push({
              value: sequence.id,
              label: sequence.title,
              status: sequence.progress,
              steps: sequence.step,
            });
          } else {
            remainingSequences.push({
              value: sequence.id,
              label: sequence.title,
              status: sequence.progress,
              steps: sequence.step,
            });
          }
        });
        const customSequenceOptions = [
          {
            label: 'Recent Sequences',
            options: recentSequences,
          },
          ...remainingSequences,
        ];
        setSequenceOptions(customSequenceOptions);
      } else {
        console.log(
          'No sequences found or empty response, using fallback sequences',
        );
      }
    } catch (err) {
      console.error('Error fetching sequences:', err);
    }
  };

  const fetchClientSequences = async () => {
    try {
      const res = await prospectsInstance.getSequences(selectedClient?.value);
      if (
        res &&
        res.payload &&
        Array.isArray(res.payload) &&
        res.payload.length > 0
      ) {
        // setSequences(res.payload);
        const recentSequences = [];
        const remainingSequences = [];
        res.payload.forEach((sequence) => {
          if (sequence.isRecent) {
            recentSequences.push({
              value: sequence.id,
              label: sequence.title,
              status: sequence.progress,
              steps: sequence.step,
            });
          } else {
            remainingSequences.push({
              value: sequence.id,
              label: sequence.title,
              status: sequence.progress,
              steps: sequence.step,
            });
          }
        });
        const customSequenceOptions = [
          {
            label: 'Recent Sequences',
            options: recentSequences,
          },
          ...remainingSequences,
        ];
        setClientSequences(customSequenceOptions);
      } else {
        console.log(
          'No sequences found or empty response, using fallback sequences',
        );
      }
    } catch (err) {
      console.error('Error fetching sequences:', err);
    }
  };

  const handleAddToSequence = async (data) => {
    try {
      const payload = {
        leadId: prospect.id,
        revealType: 'email',
        tagIds: data.tagIds,
        newTags: data.newTags,
        sequenceId: data.sequenceId,
        stepId: data.stepId,
      };

      const response = await prospectsInstance.revealProspect(payload);

      if (response) {
        const { message, status } = response.payload;
        if (status === 0) {
          console.log('error', message);
        } else if (status === 2) {
          console.log('warning', message);
        } else {
          setIsPollingEnabled(true);
          setToasterData({
            header: 'Added to Sequence Successfully',
            body: message,
            type: 'success',
          });
          setShowToaster(true);
          // }
          console.log(
            'success',
            message ||
              'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
          );
        }
      }
    } catch (err) {
      console.error('Error revealing prospect:', err);
      setIsRevealing(false);
    } finally {
      setBtnLoadingStatus({
        ...btnLoadingStatus,
        addToSequence: false,
      });
      setExpandedSection(null);
      setSelectedClient(null);
      setSelectedSequence(null);
      setSelectedStep(null);
      setSequenceTags([]);
    }
  };

  const handleOnSave = () => {
    setBtnLoadingStatus({
      ...btnLoadingStatus,
      addToSequence: true,
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

    const payload = {
      sequenceId: selectedSequence.value,
      stepId: selectedStep.value,
      tagIds,
      newTags,
    };
    handleAddToSequence(payload);
  };

  const handleEmailCopy = (text) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
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
            setTimeout(() => setIsCopied(false), 2000);
          } catch (fallbackErr) {
            console.error('Fallback: Oops, unable to copy', fallbackErr);
          }
          document.body.removeChild(textArea);
        });
    }
  };

  const handlePhoneNumberCopy = (text) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy phone number: ', err);
          // Fallback method for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          } catch (fallbackErr) {
            console.error(
              'Fallback: Oops, unable to copy phone number',
              fallbackErr,
            );
          }
          document.body.removeChild(textArea);
        });
    }
  };

  const handleViewEmailPhoneAndFindPhoneBtn = () => {
    setRevealType('emailphone');
    revealProspect('emailphone');
  };

  const hadnleViewEmailBtn = () => {
    setRevealType('email');
    revealProspect('email');
  };

  const handleExpandedSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const saveTags = async () => {
    setBtnLoadingStatus({
      ...btnLoadingStatus,
      saveTags: true,
    });
    try {
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
        leads: [prospect.id],
        tagIds,
        newTags,
      };
      const response = await prospectsInstance.saveTags(payload);
      console.log('success', response);
    } catch (err) {
      console.error('Error saving tags:', err);
    } finally {
      setBtnLoadingStatus({
        ...btnLoadingStatus,
        saveTags: false,
      });
      setExpandedSection(null);
    }
  };

  useEffect(() => {
    fetchProspect();
    fetchTags();
    fetchSequences();
    fetchAgencyClients();
  }, []);

  useEffect(() => {
    if (selectedSequence) {
      const { steps } = selectedSequence;

      if (steps && Array.isArray(steps) && steps.length > 0) {
        const customStepOptions = steps.map((step) => ({
          value: step.id,
          label: `Step ${step.number}`,
        }));
        setStepOptions(customStepOptions);
      }
    }
  }, [selectedSequence]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientSequences();
    }
  }, [selectedClient]);

  useEffect(() => {
    let intervalId = null;

    if (isPollingEnabled) {
      intervalId = setInterval(() => {
        pollingAttemptsRef.current++;
        if (pollingAttemptsRef.current >= MAX_POLLING_LIMIT) {
          setIsPollingEnabled(false);
        }
        const shouldContinuePolling =
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
  }, [isPollingEnabled]);

  useEffect(() => {
    if (!isPollingEnabled && pollingAttemptsRef.current > 0) {
      // Only refresh prospects when polling is actually stopped
      fetchProspect(prospect.linkedin_url);
      setIsRevealing(false);
      pollingAttemptsRef.current = 0;
    }
  }, [isPollingEnabled]);

  if (isLoading) {
    return <SingleProfileSkeleton />;
  }

  if (!prospect?.id) {
    return <NoResult />;
  }

  return (
    <>
      {singleleadsData?.map((singleProfile, index) => (
        <>
          <Header />
          <div
            key={`user-profile ${index + 1}`}
            className="single-profile-container"
            id="single-profile-container"
          >
            <div
              className="user-profile-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                marginTop: '16px',
              }}
            >
              <div
                className="profile-user-img-name"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '0px 16px',
                }}
              >
                {showToaster && (
                  <Toaster
                    header={toasterData.header}
                    body={toasterData.body}
                    type={toasterData.type}
                    onClose={() => setShowToaster(false)}
                  />
                )}
                {/* User-Details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {singleProfile?.profile_pic ? (
                    <img
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                      }}
                      src={singleProfile?.profile_pic}
                      alt="userImage"
                    />
                  ) : (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                      }}
                    >
                      <NogenderAvatar />
                    </div>
                  )}

                  {singleProfile?.name && (
                    <span
                      style={{
                        color: '#1f2937',
                        fontFamily: 'Inter',
                        fontSize: '16px',
                        fontWeight: '600',
                        lineHeight: '20px',
                      }}
                    >
                      {singleProfile?.name || ''}
                    </span>
                  )}
                  {/* Create enum which will be provided by backend and replace here in status */}
                  {singleProfile?.isRevealed &&
                    singleProfile?.prospectStatus && (
                      <ContactStatusTag
                        status={singleProfile?.prospectStatus?.toString()}
                      />
                    )}
                </div>

                <div
                  className="user-description-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {/* User Designation */}
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '400',
                      lineHeight: '16px',
                    }}
                  >
                    {singleProfile?.headline && (
                      <span>{singleProfile?.headline || '-'} </span>
                    )}
                  </div>

                  {/* User Address */}
                  <div
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '400',
                      lineHeight: '16px',
                    }}
                  >
                    {singleProfile?.locality && (
                      <span>{singleProfile?.locality || '-'}</span>
                    )}
                  </div>

                  {/* Social Media Icons */}

                  <div className="social-media-icons">
                    <span
                      style={{
                        display: 'flex',
                        gap: '6px',
                        height: '16px',
                        alignItems: 'center',
                      }}
                    >
                      {singleProfile?.links?.facebook && (
                        <a
                          href={singleProfile?.links?.facebook}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M8.97261 15.433C12.3782 14.9596 15 12.036 15 8.5C15 4.63401 11.866 1.5 8 1.5C4.13401 1.5 1 4.63401 1 8.5C1 11.9501 3.49603 14.8173 6.78083 15.3942V10.6408H5V8.66505H6.78083V7.15922C6.78083 5.44647 7.82742 4.5 9.43013 4.5C10.1973 4.5 11 4.6335 11 4.6335V6.31553H10.1151C9.24383 6.31553 8.97261 6.84285 8.97261 7.3835V8.66505H10.9178L10.6069 10.6408H8.97261V15.433Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.linkedin && (
                        <a
                          href={singleProfile?.links?.linkedin}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M8 1.5C4.13401 1.5 1 4.63401 1 8.5C1 12.366 4.13401 15.5 8 15.5C11.866 15.5 15 12.366 15 8.5C15 4.63401 11.866 1.5 8 1.5ZM6.30928 5.34607C6.30928 5.81335 5.90426 6.19215 5.40464 6.19215C4.90502 6.19215 4.5 5.81335 4.5 5.34607C4.5 4.8788 4.90502 4.5 5.40464 4.5C5.90426 4.5 6.30928 4.8788 6.30928 5.34607ZM4.62371 6.81405H6.1701V11.5H4.62371V6.81405ZM7.1134 6.81405H8.65979V7.41525C8.91936 7.08503 9.4177 6.72004 10.2217 6.72004C11.5754 6.72004 11.9869 7.44769 12 9.02686V11.5H10.4536C10.4536 11.1944 10.4515 10.8871 10.4494 10.5799V10.5798V10.5797C10.4464 10.1442 10.4434 9.70877 10.4464 9.27855C10.4504 8.71727 10.4555 7.99277 9.60309 7.99277C8.84883 7.99277 8.65979 8.54881 8.65979 9.10243V11.5H7.1134V6.81405Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.twitter && (
                        <a
                          href={singleProfile?.links?.twitter}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              d="M5.89437 14.5C4.27687 14.5 2.76909 14.0295 1.5 13.2178C2.5775 13.2875 4.47903 13.1206 5.66179 11.9924C3.88254 11.9108 3.08013 10.5461 2.97547 9.96298C3.12665 10.0213 3.84765 10.0913 4.25467 9.92799C2.20795 9.41481 1.89396 7.61866 1.96374 7.07049C2.3475 7.33874 2.99873 7.43205 3.25457 7.40872C1.3474 6.04412 2.03351 3.99138 2.37076 3.54817C3.73941 5.44433 5.7906 6.50929 8.32819 6.56852C8.28034 6.35868 8.25508 6.14021 8.25508 5.91582C8.25508 4.30546 9.55671 3 11.1623 3C12.0013 3 12.7572 3.35638 13.2878 3.92642C13.8485 3.79505 14.6922 3.48753 15.1046 3.2216C14.8967 3.96805 14.2495 4.59075 13.858 4.82154C13.8548 4.81365 13.8612 4.82939 13.858 4.82154C14.2019 4.76952 15.1324 4.59068 15.5 4.34128C15.3182 4.76063 14.632 5.45786 14.0689 5.84821C14.1736 10.469 10.6382 14.5 5.89437 14.5Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.stackoverflow && (
                        <a
                          href={singleProfile?.links?.stackoverflow}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M10.7475 12.7909H4.75635V11.6593H10.7475V12.7909ZM10.6959 11.3061L4.87607 10.0846L5.11564 8.92302L10.9353 10.1445L10.6959 11.3061ZM11.0312 9.80919L5.64252 7.2945L6.14541 6.21675L11.5341 8.73143L11.0312 9.80919ZM11.7137 8.456L7.13931 4.6481L7.89365 3.73805L12.4801 7.54595L11.7137 8.456ZM9.127 2.54045L10.0851 1.83398L13.6295 6.61191L12.6716 7.31838L9.127 2.54045ZM11.8815 13.9227V10.4147H13.1239V15.1675H2.37354V10.4147H3.61832V13.9227H11.8815Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.github && (
                        <a
                          href={singleProfile?.links?.github}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              d="M8.00016 1.9668C4.31905 1.9668 1.3335 4.9518 1.3335 8.63346C1.3335 11.579 3.2435 14.0779 5.89294 14.9596C6.22572 15.0212 6.3335 14.8146 6.3335 14.639V13.3979C4.47905 13.8012 4.09294 12.6112 4.09294 12.6112C3.78961 11.8407 3.35239 11.6357 3.35239 11.6357C2.74739 11.2218 3.3985 11.2307 3.3985 11.2307C4.06794 11.2774 4.42016 11.9179 4.42016 11.9179C5.01461 12.9368 5.97961 12.6424 6.36016 12.4718C6.41961 12.0412 6.59239 11.7468 6.7835 11.5807C5.30294 11.4112 3.74627 10.8396 3.74627 8.28569C3.74627 7.55735 4.00683 6.96291 4.43294 6.49624C4.36405 6.32791 4.13572 5.64957 4.49794 4.7318C4.49794 4.7318 5.05794 4.55291 6.33183 5.41513C6.8635 5.26735 7.4335 5.19346 8.00016 5.19069C8.56683 5.19346 9.13738 5.26735 9.67016 5.41513C10.9429 4.55291 11.5018 4.7318 11.5018 4.7318C11.8646 5.65013 11.6363 6.32846 11.5674 6.49624C11.9952 6.96291 12.2535 7.55791 12.2535 8.28569C12.2535 10.8462 10.6941 11.4101 9.20961 11.5751C9.4485 11.7818 9.66683 12.1874 9.66683 12.8096V14.639C9.66683 14.8162 9.7735 15.0246 10.1118 14.959C12.7591 14.0762 14.6668 11.5779 14.6668 8.63346C14.6668 4.9518 11.6818 1.9668 8.00016 1.9668Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.quora && (
                        <a
                          href={singleProfile?.links?.quora}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              d="M8.40041 12.229C7.93882 11.32 7.39589 10.3989 6.33849 10.3989C6.12926 10.3965 5.92172 10.4366 5.72846 10.5168L5.36854 9.79698C5.80573 9.42079 6.51337 9.12594 7.40199 9.12594C8.81524 9.12594 9.54118 9.80714 10.1187 10.6775C10.4603 9.93525 10.623 8.93276 10.623 7.68829C10.623 4.58524 9.65302 3.01135 7.38572 3.01135C5.14893 3.01135 4.1871 4.60558 4.1871 7.68829C4.1871 10.771 5.15299 12.351 7.38572 12.351C7.71406 12.3553 8.04135 12.3129 8.35771 12.2249L8.40041 12.229ZM8.95351 13.3128C8.45612 13.4464 7.94345 13.5148 7.42842 13.5162C4.45349 13.5182 1.53955 11.1431 1.53955 7.69032C1.53955 4.20702 4.45349 1.83398 7.42842 1.83398C10.4522 1.83398 13.3336 4.19279 13.3336 7.69032C13.3411 8.57023 13.1438 9.43982 12.7574 10.2304C12.3709 11.0209 11.8059 11.7107 11.1069 12.2452C11.5136 12.8838 11.9732 13.3087 12.5853 13.3087C13.2522 13.3087 13.5206 12.7922 13.5674 12.3876H14.4377C14.4886 12.9265 14.2181 15.1653 11.7881 15.1653C10.3159 15.1653 9.53711 14.3133 8.95351 13.3128Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.aboutme && (
                        <a
                          href={singleProfile?.links?.aboutme}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M2.48768 6.631C2.48259 6.63519 2.47603 6.64057 2.46724 6.64808V6.52499V6.08747C2.46724 6.08072 2.46728 6.07397 2.46732 6.06722C2.46742 6.04968 2.46753 6.03213 2.46693 6.01459C2.46547 5.97324 2.4614 5.9697 2.41635 5.96777C2.40637 5.96736 2.39635 5.96743 2.38635 5.9675C2.38246 5.96753 2.37858 5.96756 2.3747 5.96756L1.42677 5.96761C1.40596 5.96761 1.38511 5.96798 1.36436 5.96923C1.34335 5.97048 1.33449 5.98393 1.33407 6.00359C1.33355 6.02788 1.33355 6.05218 1.33355 6.07647V6.38897L1.3335 11.0348C1.3335 11.0479 1.33357 11.0611 1.33364 11.0742C1.33375 11.0923 1.33385 11.1104 1.33376 11.1285C1.33365 11.1549 1.34856 11.1651 1.3726 11.1654C1.39695 11.1657 1.42124 11.1657 1.44554 11.1657C1.53364 11.1657 1.62174 11.1658 1.70984 11.1658C1.92381 11.1659 2.13778 11.166 2.35176 11.1656C2.41757 11.1655 2.44641 11.1692 2.45878 11.1566C2.47125 11.144 2.46698 11.1148 2.46698 11.0486C2.46726 10.1779 2.46723 9.30715 2.4672 8.43639C2.46719 8.17521 2.46719 7.91402 2.46719 7.65283C2.46719 7.64412 2.46729 7.6354 2.4674 7.62669C2.46764 7.60762 2.46787 7.58856 2.46698 7.56951C2.46536 7.53641 2.47694 7.50961 2.49732 7.4838C2.69731 7.23085 2.9423 7.03664 3.24432 6.92033C3.47705 6.83071 3.71724 6.81262 3.96004 6.87362C4.18672 6.9306 4.34735 7.06761 4.43713 7.28527C4.46237 7.34638 4.48009 7.40956 4.49406 7.47411C4.51846 7.58703 4.51966 7.70147 4.51966 7.81611V11.0348C4.51966 11.0468 4.51974 11.0589 4.51982 11.0709C4.51994 11.0901 4.52006 11.1093 4.51987 11.1286C4.51966 11.1551 4.53468 11.1651 4.55861 11.1655C4.5789 11.1658 4.59915 11.1658 4.61939 11.1658C4.62344 11.1658 4.62749 11.1658 4.63155 11.1658C4.71787 11.1658 4.80419 11.1658 4.89051 11.1659C5.10626 11.1659 5.32202 11.166 5.53777 11.1656C5.60302 11.1655 5.63178 11.1694 5.64422 11.157C5.65677 11.1445 5.65268 11.1153 5.65268 11.0483C5.65296 10.1779 5.65293 9.30752 5.6529 8.43711C5.65289 8.17559 5.65288 7.91408 5.65288 7.65257C5.65288 7.64605 5.65304 7.63952 5.6532 7.63299C5.65355 7.61865 5.6539 7.60429 5.65257 7.59011C5.64809 7.54204 5.6666 7.50424 5.69543 7.4666C5.89959 7.20019 6.1587 7.00953 6.47663 6.90234C6.69518 6.82868 6.919 6.81736 7.14365 6.87273C7.38254 6.93154 7.54968 7.0759 7.63977 7.30597C7.6574 7.35096 7.6709 7.39789 7.68247 7.44486C7.71167 7.56347 7.72012 7.68442 7.72012 7.80636C7.71986 8.68961 7.71992 9.5729 7.71998 10.4562C7.71999 10.6527 7.72 10.8493 7.72001 11.0459C7.72001 11.0771 7.72038 11.1083 7.72105 11.1396C7.72142 11.1564 7.7319 11.164 7.74749 11.1646C7.77178 11.1655 7.79608 11.1657 7.82037 11.1657H8.74745C8.75614 11.1657 8.76481 11.1656 8.77349 11.1656C8.78564 11.1655 8.79779 11.1655 8.80996 11.1655C8.83399 11.1657 8.84943 11.1573 8.84891 11.13C8.84857 11.112 8.84871 11.0941 8.84885 11.0761C8.84893 11.0663 8.84901 11.0565 8.84901 11.0467C8.84901 10.8089 8.84901 10.5711 8.84901 10.3334C8.84902 9.38019 8.84903 8.42701 8.84891 7.47379C8.84891 7.46419 8.84892 7.45459 8.84893 7.44499C8.84901 7.38513 8.84909 7.32522 8.84604 7.26552C8.83744 7.09873 8.81403 6.93414 8.7658 6.77367C8.62368 6.30081 8.31368 6.00468 7.83268 5.89092C7.52007 5.81699 7.2059 5.81517 6.89418 5.89301C6.37851 6.02183 5.95225 6.29033 5.63151 6.71877C5.62887 6.7223 5.6265 6.72614 5.62409 6.73003C5.61552 6.74386 5.60645 6.7585 5.58339 6.7633C5.58014 6.75482 5.57691 6.74625 5.57366 6.73763C5.56653 6.71871 5.5593 6.69955 5.55164 6.68056C5.4043 6.31525 5.14618 6.06391 4.77398 5.93425C4.44454 5.8195 4.10628 5.80563 3.76792 5.88044C3.26961 5.99066 2.8448 6.23314 2.50379 6.61664C2.50006 6.62084 2.49567 6.62444 2.48768 6.631ZM10.6767 8.93876H14.6569L14.6569 8.93881C14.6589 8.93235 14.6606 8.92738 14.6619 8.92336C14.6642 8.91666 14.6657 8.91255 14.6657 8.90841C14.6681 8.62381 14.6692 8.33957 14.6213 8.05715C14.5628 7.71233 14.46 7.38331 14.2889 7.07743C13.9844 6.53314 13.5399 6.15422 12.9444 5.96341C12.4998 5.82098 12.0455 5.80132 11.5871 5.89037C11.0155 6.00136 10.5357 6.27481 10.1522 6.71233C9.76963 7.1487 9.56067 7.66259 9.49691 8.23618C9.45192 8.6406 9.48424 9.04053 9.59816 9.43169C9.78798 10.0834 10.1691 10.5901 10.7587 10.9319C11.1437 11.1551 11.563 11.2673 12.0063 11.2907C12.4257 11.3128 12.8377 11.2702 13.2396 11.1438C13.6179 11.0248 13.9624 10.8442 14.2607 10.5801C14.2644 10.5768 14.2683 10.5737 14.2723 10.5706C14.2871 10.5589 14.3022 10.547 14.3049 10.5256C14.1113 10.2245 13.8512 9.85931 13.7877 9.80065C13.6864 9.89559 13.5777 9.98162 13.4577 10.052C13.0741 10.277 12.66 10.386 12.2154 10.3697C11.9704 10.3607 11.7336 10.3081 11.514 10.1959C11.0451 9.95617 10.7788 9.56641 10.6818 9.05491C10.6804 9.04711 10.6783 9.03924 10.6763 9.03125C10.6689 9.00264 10.6612 8.97255 10.6767 8.93876ZM13.4519 8.13087H12.1201L12.1201 8.13082H10.7779C10.7705 8.13082 10.7632 8.13085 10.7559 8.13089C10.7355 8.13098 10.7151 8.13107 10.6947 8.13046C10.6658 8.12957 10.6552 8.12034 10.6582 8.09401C10.6588 8.08876 10.6594 8.0835 10.66 8.07825C10.6656 8.0284 10.6713 7.97843 10.6816 7.92953C10.7476 7.61583 10.8896 7.34327 11.1267 7.1243C11.3258 6.94042 11.5617 6.83135 11.8285 6.78819C12.0962 6.74491 12.3621 6.75644 12.6203 6.83923C13.0771 6.98573 13.3662 7.30125 13.5125 7.75284C13.5467 7.85852 13.5695 7.96717 13.5767 8.07842C13.5799 8.12592 13.5757 8.12941 13.5247 8.13072C13.5077 8.13115 13.4907 8.13106 13.4737 8.13096C13.4664 8.13091 13.4592 8.13087 13.4519 8.13087Z"
                              fill="#6B7280"
                            />
                          </svg>
                        </a>
                      )}

                      {singleProfile?.links?.angelist && (
                        <a
                          href={singleProfile?.links?.angelist}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="17"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              d="M11.0968 7.5205C11.6482 7.60532 12.03 7.85985 12.2421 8.19925C12.4542 8.53861 12.5815 9.13254 12.5815 9.89611C12.5815 11.4233 12.1149 12.696 11.1816 13.6717C10.2483 14.6474 9.06046 15.1564 7.61814 15.1564C7.06662 15.1564 6.51513 15.0716 5.96365 14.8595C5.41216 14.6474 4.98795 14.3504 4.60614 14.0111C4.18193 13.6292 3.84257 13.1626 3.63044 12.7384C3.46076 12.2718 3.3335 11.8051 3.3335 11.3385C3.3335 10.8294 3.46076 10.4052 3.67285 10.1082C3.88498 9.81129 4.26675 9.64157 4.73341 9.51434C4.62648 9.24692 4.43646 8.92075 4.43646 8.62346C4.43646 8.36893 4.56373 8.07198 4.86068 7.77503C5.15763 7.47808 5.41216 7.35082 5.6667 7.35082C5.79397 7.35082 5.87883 7.35082 6.0061 7.39323C6.13336 7.43564 6.26063 7.47805 6.43031 7.60532C6.04851 6.33267 5.6667 5.27211 5.45458 4.55095C5.24249 3.82978 5.15763 3.36316 5.15763 3.06617C5.15763 2.68437 5.24249 2.38742 5.45458 2.17533C5.62433 1.96317 5.92127 1.83594 6.26067 1.83594C6.81215 1.83594 7.53332 3.10862 8.4242 5.69633C8.59387 6.12058 8.6787 6.45994 8.76355 6.71447C8.84841 6.5448 8.93323 6.24781 9.0605 5.90845C9.95131 3.36312 10.7149 2.09047 11.3088 2.09047C11.6058 2.09047 11.8603 2.1753 12.0724 2.38742C12.2421 2.59955 12.3694 2.8965 12.3694 3.23585C12.3694 3.49039 12.2845 3.99946 12.0724 4.72063C11.8179 5.44183 11.521 6.37508 11.0968 7.5205ZM4.5637 11.2537C4.64855 11.3385 4.77582 11.5082 4.90309 11.7203C5.2849 12.2717 5.6667 12.5687 6.0061 12.5687C6.13336 12.5687 6.21819 12.5263 6.30304 12.4414C6.38787 12.3565 6.43031 12.2717 6.43031 12.2293C6.43031 12.1445 6.38786 11.9748 6.26063 11.7627C6.13336 11.5505 5.96369 11.296 5.75156 11.0415C5.49702 10.7445 5.2849 10.49 5.15766 10.3627C4.98795 10.2355 4.86072 10.1506 4.77582 10.1506C4.56373 10.1506 4.35161 10.2779 4.18193 10.49C4.01225 10.7021 3.92739 10.999 3.92739 11.296C3.92739 11.5505 3.96984 11.8051 4.09711 12.1445C4.22437 12.4414 4.39405 12.7808 4.64859 13.0777C5.03036 13.502 5.45461 13.8838 6.0061 14.1383C6.55758 14.3928 7.10906 14.5201 7.78778 14.5201C8.97561 14.5201 9.95131 14.0959 10.7574 13.205C11.5634 12.3141 11.9452 11.2112 11.9452 9.85366C11.9452 9.42945 11.9027 9.1325 11.8603 8.87793C11.8179 8.62343 11.6906 8.45375 11.5634 8.36889C11.3088 8.15676 10.8422 7.98709 10.121 7.81741C9.39986 7.64773 8.63625 7.56287 7.87264 7.56287C7.66055 7.56287 7.49087 7.60528 7.40601 7.69014C7.32115 7.775 7.27874 7.90226 7.27874 8.07194C7.27874 8.49616 7.49087 8.79311 7.9575 8.96279C8.42412 9.1325 9.18773 9.25973 10.2059 9.25973H10.5876C10.6725 9.25973 10.7574 9.30218 10.7998 9.34463C10.8422 9.42945 10.8846 9.51427 10.8846 9.64157C10.7997 9.7264 10.5877 9.85366 10.2483 9.98093C9.9089 10.1082 9.69681 10.2355 9.52713 10.3627C9.14529 10.6173 8.84834 10.9566 8.63625 11.3384C8.42412 11.7202 8.29685 12.0596 8.29685 12.399C8.29685 12.6111 8.3393 12.8232 8.42412 13.1202C8.50902 13.4171 8.55139 13.5868 8.55139 13.6292V13.7989C8.29685 13.7989 8.08476 13.6292 7.91509 13.3323C7.74537 13.0353 7.70296 12.6535 7.70296 12.1445V12.0596C7.54708 12.2155 7.3335 12.1675 7.06662 12.1445C7.06662 12.2701 7.10906 12.3956 7.10906 12.5263C7.10906 12.7384 7.02421 12.9505 6.85453 13.1202C6.68485 13.2898 6.47272 13.3747 6.21819 13.3747C5.83638 13.3747 5.45461 13.205 5.0304 12.8232C4.72225 12.5151 4.14937 11.7627 4.5637 11.2537ZM7.32112 11.4657C7.40598 11.4657 7.53324 11.4233 7.61807 11.3385C7.70296 11.2536 7.74533 11.1263 7.74533 11.0415C7.74533 10.9143 7.66051 10.6597 7.49083 10.2355C7.32112 9.81129 7.10899 9.38707 6.85449 9.00527C6.68481 8.70832 6.47269 8.45378 6.30301 8.32648C6.13333 8.1568 5.96361 8.11443 5.79393 8.11443C5.66667 8.11443 5.5394 8.19925 5.36972 8.36893C5.20004 8.53861 5.15759 8.66587 5.15759 8.83555C5.15759 8.96282 5.24245 9.21739 5.36972 9.51434C5.5394 9.81129 5.70908 10.1082 5.96361 10.4476C6.29556 10.8901 6.70324 11.4657 7.32112 11.4657ZM8.21196 7.05383L7.19385 4.21155C6.93935 3.49039 6.76963 2.98132 6.59995 2.76923C6.47269 2.5571 6.34542 2.42983 6.17574 2.42983C6.04847 2.42983 5.96361 2.47228 5.87879 2.5571C5.75152 2.68437 5.70908 2.81164 5.70908 2.98132C5.70908 3.27826 5.83634 3.74493 6.04847 4.42368C6.2606 5.10243 6.59995 6.03572 7.02421 7.13869C7.19202 6.80263 7.92303 7.00569 8.21196 7.05383ZM9.23011 9.81125C8.97557 9.81125 8.72107 9.76884 8.46653 9.72643C8.212 9.68402 7.99987 9.64157 7.78774 9.55675C7.87264 9.76884 7.95746 9.93856 8.04232 10.1506C8.12714 10.3628 8.16959 10.5325 8.212 10.7445C8.33927 10.5749 8.50894 10.4052 8.67862 10.2355C8.89075 10.0658 9.06046 9.93852 9.23011 9.81125ZM10.4603 7.35078C10.8846 6.24781 11.1815 5.31456 11.4361 4.59336C11.6482 3.8722 11.7754 3.44798 11.7754 3.2783C11.7754 3.10859 11.733 2.98135 11.6482 2.85405C11.5633 2.76923 11.4785 2.72682 11.3512 2.72682C11.1815 2.72682 11.0118 2.85405 10.8421 3.15103C10.6725 3.44798 10.4603 3.8722 10.2483 4.50854L9.31497 7.13869L10.4603 7.35078Z"
                              fill="#6B7280"
                              stroke="#6B7280"
                              // stroke-width="0.2"
                              // stroke-linejoin="round"
                            />
                          </svg>
                        </a>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="masked-with-btn"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div
                  style={{
                    padding: '0px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* View Email Btn */}
                  {singleProfile.id && !singleProfile.isRevealed && (
                    <Button
                      variant="primary"
                      className="w-100 py-2"
                      data-tooltip-id="my-tooltip-1"
                      style={{
                        fontSize: '14px',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        height: '32px',
                        alignItems: 'center',
                        fontWeight: '500',
                        lineHeight: '20px',
                        background: '#1D4ED8',
                        gap: '8px',
                      }}
                      disabled={isRevealing}
                      onClick={hadnleViewEmailBtn}
                    >
                      {!isRevealing && (
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 17 17"
                            fill="none"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.83357 4.49544C3.46538 4.49544 3.1669 4.79392 3.1669 5.16211V11.8288C3.1669 12.197 3.46538 12.4954 3.83357 12.4954H13.1669C13.5351 12.4954 13.8336 12.197 13.8336 11.8288V5.16211C13.8336 4.79392 13.5351 4.49544 13.1669 4.49544H3.83357ZM1.83357 5.16211C1.83357 4.05754 2.729 3.16211 3.83357 3.16211H13.1669C14.2715 3.16211 15.1669 4.05754 15.1669 5.16211V11.8288C15.1669 12.9333 14.2715 13.8288 13.1669 13.8288H3.83357C2.729 13.8288 1.83357 12.9333 1.83357 11.8288V5.16211Z"
                              fill="white"
                            />
                            <path
                              // fill-rule="evenodd"
                              // clip-rule="evenodd"
                              d="M1.94553 4.80229C2.14977 4.49594 2.56368 4.41316 2.87003 4.61739L8.50023 8.37086L14.1304 4.61739C14.4368 4.41316 14.8507 4.49594 15.0549 4.80229C15.2592 5.10864 15.1764 5.52256 14.87 5.72679L8.87003 9.72679C8.6461 9.87608 8.35437 9.87608 8.13043 9.72679L2.13043 5.72679C1.82408 5.52256 1.7413 5.10864 1.94553 4.80229Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      )}
                      <span>
                        {isRevealing && revealType === 'email' ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'View Email'
                        )}
                      </span>
                    </Button>
                  )}

                  {/* View Email + Phone Btn */}

                  {singleProfile.id &&
                    (!singleProfile.isRevealed ||
                      (singleProfile.isRevealed && singleProfile.reReveal)) && (
                      <Button
                        variant="primary"
                        className="w-100 py-2"
                        data-tooltip-id="my-tooltip-2"
                        onMouseEnter={() => setIsViewEmailPhoneHover(true)}
                        onMouseLeave={() => setIsViewEmailPhoneHover(false)}
                        style={
                          isRevealing && revealType === 'email'
                            ? {
                                cursor: 'not-allowed',
                                opacity: '0.35',
                                fontSize: '14px',
                                padding: '6px 16px',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: '500',
                                lineHeight: '20px',
                                color: '#1D4ED8',
                                backgroundColor: '#fff',
                                gap: '8px',
                              }
                            : {
                                fontSize: '14px',
                                padding: '6px 16px',
                                borderRadius: '4px',
                                height: '32px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: '500',
                                lineHeight: '20px',
                                color: '#1D4ED8',
                                background: isViewEmailPhoneHover
                                  ? '#EFF6FF'
                                  : '#fff',
                                border: '1px solid #1D4ED8',
                                gap: '8px',
                              }
                        }
                        disabled={isRevealing && revealType === 'email'}
                        onClick={handleViewEmailPhoneAndFindPhoneBtn}
                      >
                        {!isRevealing && (
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 17"
                              fill="none"
                            >
                              <path
                                // fill-rule="evenodd"
                                // clip-rule="evenodd"
                                d="M13.9998 10.7879V12.7897C13.9998 13.8943 13.1044 14.7897 11.9998 14.7897H2.6665C1.56193 14.7897 0.666504 13.8943 0.666504 12.7897V6.14214V6.12269C0.666697 5.01828 1.56205 4.12305 2.6665 4.12305H5.7762C5.85288 4.5819 5.96861 5.02752 6.11987 5.45638H2.6665C2.40603 5.45638 2.18045 5.60576 2.07075 5.82352L7.33317 9.3318L8.27418 8.70445C8.62106 9.02114 8.99592 9.30769 9.39461 9.55997L7.70297 10.6877C7.47904 10.837 7.1873 10.837 6.96337 10.6877L1.99984 7.37871V12.7897C1.99984 13.1579 2.29831 13.4564 2.6665 13.4564H11.9998C12.368 13.4564 12.6665 13.1579 12.6665 12.7897V10.7329C12.9941 10.7737 13.3278 10.7948 13.6664 10.7948C13.7781 10.7948 13.8893 10.7925 13.9998 10.7879Z"
                                fill="#1D4ED8"
                              />
                              <path
                                // fill-rule="evenodd"
                                // clip-rule="evenodd"
                                d="M7.60832 2.42316C7.52541 2.42316 7.4459 2.45609 7.38728 2.51472C7.33204 2.56995 7.29961 2.64373 7.29605 2.72142C7.40354 4.39498 8.11685 5.97246 9.30306 7.15867C10.4893 8.34488 12.0667 9.05819 13.7403 9.16569C13.818 9.16212 13.8918 9.12969 13.947 9.07446C14.0056 9.01583 14.0386 8.93632 14.0386 8.85341V7.39662L12.5778 6.81231L12.1473 7.52975C11.979 7.81026 11.6237 7.91479 11.3303 7.77009C10.1843 7.20492 9.25682 6.27742 8.69164 5.13144C8.54695 4.83805 8.65147 4.48272 8.93198 4.31442L9.64943 3.88395L9.06511 2.42316H7.60832ZM6.49834 1.62578C6.79273 1.3314 7.192 1.16602 7.60832 1.16602H9.49067C9.7477 1.16602 9.97883 1.3225 10.0743 1.56114L11.0155 3.91408C11.13 4.20053 11.0198 4.52779 10.7552 4.68652L10.1067 5.07567C10.4431 5.58348 10.8783 6.01863 11.3861 6.35507L11.7752 5.70648C11.9339 5.44194 12.2612 5.33169 12.5477 5.44627L14.9006 6.38744C15.1392 6.4829 15.2957 6.71403 15.2957 6.97106V8.85341C15.2957 9.26973 15.1303 9.66901 14.8359 9.96339C14.5416 10.2578 14.1423 10.4232 13.726 10.4232C13.7133 10.4232 13.7005 10.4228 13.6878 10.422C11.699 10.3011 9.82308 9.45655 8.41413 8.04761C7.00518 6.63866 6.1606 4.76278 6.03973 2.77389C6.03896 2.7612 6.03857 2.74848 6.03857 2.73576C6.03857 2.31944 6.20396 1.92017 6.49834 1.62578Z"
                                fill="#1D4ED8"
                              />
                            </svg>
                          </div>
                        )}
                        <span>
                          {isRevealing && revealType === 'emailphone' ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            'View Email + Phone'
                          )}
                        </span>
                      </Button>
                    )}
                </div>

                <div
                  className="all-masked"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '0px 16px',
                  }}
                >
                  {/* Emails */}
                  {singleProfile?.emails?.map((email) => (
                    <div
                      key={email.email}
                      className="email"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        height: '16px',
                        alignItems: 'center',
                      }}
                      onMouseEnter={() => setIsEmailCopyIconDisplay(true)}
                      onMouseLeave={() => setIsEmailCopyIconDisplay(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                      >
                        <path
                          // fill-rule="evenodd"
                          // clip-rule="evenodd"
                          d="M3.33325 4.49544C2.96506 4.49544 2.66659 4.79392 2.66659 5.16211V11.8288C2.66659 12.197 2.96506 12.4954 3.33325 12.4954H12.6666C13.0348 12.4954 13.3333 12.197 13.3333 11.8288V5.16211C13.3333 4.79392 13.0348 4.49544 12.6666 4.49544H3.33325ZM1.33325 5.16211C1.33325 4.05754 2.22868 3.16211 3.33325 3.16211H12.6666C13.7712 3.16211 14.6666 4.05754 14.6666 5.16211V11.8288C14.6666 12.9333 13.7712 13.8288 12.6666 13.8288H3.33325C2.22868 13.8288 1.33325 12.9333 1.33325 11.8288V5.16211Z"
                          fill="#9CA3AF"
                        />
                        <path
                          // fill-rule="evenodd"
                          // clip-rule="evenodd"
                          d="M1.44529 4.8028C1.64952 4.49644 2.06344 4.41366 2.36979 4.6179L7.99999 8.37136L13.6302 4.6179C13.9365 4.41366 14.3505 4.49644 14.5547 4.8028C14.7589 5.10915 14.6761 5.52306 14.3698 5.7273L8.36979 9.7273C8.14586 9.87659 7.85412 9.87659 7.63019 9.7273L1.63019 5.7273C1.32384 5.52306 1.24105 5.10915 1.44529 4.8028Z"
                          fill="#9CA3AF"
                        />
                      </svg>
                      <span
                        style={{
                          color: '#1f2937',
                          fontSize: '14px',
                          fontWeight: '400',
                          lineHeight: '16px',
                        }}
                      >
                        {email.email ? (
                          <span>
                            <span>{email.email || null}</span>
                          </span>
                        ) : (
                          <>
                            <span>
                              &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                            </span>
                            @{email}
                          </>
                        )}
                      </span>
                      {/* valid icon */}
                      {singleProfile.isRevealed === true && (
                        <>
                          {singleProfile.emails ? (
                            <span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="17"
                                viewBox="0 0 16 17"
                                fill="none"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.00016 3.16732C5.05464 3.16732 2.66683 5.55513 2.66683 8.50065C2.66683 11.4462 5.05464 13.834 8.00016 13.834C10.9457 13.834 13.3335 11.4462 13.3335 8.50065C13.3335 5.55513 10.9457 3.16732 8.00016 3.16732ZM1.3335 8.50065C1.3335 4.81875 4.31826 1.83398 8.00016 1.83398C11.6821 1.83398 14.6668 4.81875 14.6668 8.50065C14.6668 12.1826 11.6821 15.1673 8.00016 15.1673C4.31826 15.1673 1.3335 12.1826 1.3335 8.50065Z"
                                  fill="#047857"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M10.4716 6.70112C10.7319 6.96147 10.7319 7.38358 10.4716 7.64393L7.8049 10.3106C7.54455 10.5709 7.12244 10.5709 6.86209 10.3106L5.52876 8.97726C5.26841 8.71691 5.26841 8.2948 5.52876 8.03445C5.78911 7.7741 6.21122 7.7741 6.47157 8.03445L7.3335 8.89638L9.52876 6.70112C9.78911 6.44077 10.2112 6.44077 10.4716 6.70112Z"
                                  fill="#047857"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span>
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
                                  fill="#D97706"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.00016 4.66981C8.36835 4.66981 8.66683 4.96829 8.66683 5.33648V8.00315C8.66683 8.37134 8.36835 8.66981 8.00016 8.66981C7.63197 8.66981 7.3335 8.37134 7.3335 8.00315V5.33648C7.3335 4.96829 7.63197 4.66981 8.00016 4.66981Z"
                                  fill="#D97706"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M7.3335 10.6648C7.3335 10.2966 7.63197 9.99816 8.00016 9.99816H8.00683C8.37502 9.99816 8.6735 10.2966 8.6735 10.6648C8.6735 11.033 8.37502 11.3315 8.00683 11.3315H8.00016C7.63197 11.3315 7.3335 11.033 7.3335 10.6648Z"
                                  fill="#D97706"
                                />
                              </svg>
                            </span>
                          )}
                          {/* Copy icon */}
                          <span
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEmailCopy(email?.email)}
                            data-tooltip-id="my-tooltip-Email-Copy"
                          >
                            {isEmailCopyiconDisplay && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="17"
                                viewBox="0 0 16 17"
                                fill="none"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.66667 6.49588C6.29848 6.49588 6 6.79435 6 7.16254V12.4959C6 12.8641 6.29848 13.1625 6.66667 13.1625H12C12.3682 13.1625 12.6667 12.8641 12.6667 12.4959V7.16254C12.6667 6.79435 12.3682 6.49588 12 6.49588H6.66667ZM4.66667 7.16254C4.66667 6.05797 5.5621 5.16254 6.66667 5.16254H12C13.1046 5.16254 14 6.05797 14 7.16254V12.4959C14 13.6004 13.1046 14.4959 12 14.4959H6.66667C5.5621 14.4959 4.66667 13.6004 4.66667 12.4959V7.16254Z"
                                  fill="#9CA3AF"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M2.58579 3.09165C2.96086 2.71657 3.46957 2.50586 4 2.50586H9.33333C9.86377 2.50586 10.3725 2.71657 10.7475 3.09165C11.1226 3.46672 11.3333 3.97543 11.3333 4.50586V5.83919C11.3333 6.20738 11.0349 6.50586 10.6667 6.50586C10.2985 6.50586 10 6.20738 10 5.83919V4.50586C10 4.32905 9.92976 4.15948 9.80474 4.03445C9.67971 3.90943 9.51014 3.83919 9.33333 3.83919H4C3.82319 3.83919 3.65362 3.90943 3.5286 4.03445C3.40357 4.15948 3.33333 4.32905 3.33333 4.50586V9.83919C3.33333 10.016 3.40357 10.1856 3.5286 10.3106C3.65362 10.4356 3.82319 10.5059 4 10.5059H5.33333C5.70152 10.5059 6 10.8043 6 11.1725C6 11.5407 5.70152 11.8392 5.33333 11.8392H4C3.46957 11.8392 2.96086 11.6285 2.58579 11.2534C2.21071 10.8783 2 10.3696 2 9.83919V4.50586C2 3.97543 2.21071 3.46672 2.58579 3.09165Z"
                                  fill="#9CA3AF"
                                />
                              </svg>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  ))}

                  {/* PhoneNumber */}
                  {singleProfile?.phones?.length > 0 &&
                    singleProfile?.phones?.map((phone, phoneIndex) => (
                      <div
                        className="phone1"
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                        onMouseEnter={() => {
                          setIsPhoneCopyIconDisplay(true);
                        }}
                        onMouseLeave={() => {
                          setIsPhoneCopyIconDisplay(false);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.33325 3.83898C3.15644 3.83898 2.98687 3.90921 2.86185 4.03424C2.74086 4.15523 2.67117 4.31794 2.6668 4.48855C2.82013 6.91784 3.85431 9.20812 5.57588 10.9297C7.29744 12.6513 9.58772 13.6854 12.017 13.8388C12.1876 13.8344 12.3503 13.7647 12.4713 13.6437C12.5963 13.5187 12.6666 13.3491 12.6666 13.1723V10.957L10.2795 10.0022L9.57158 11.182C9.39307 11.4795 9.01621 11.5903 8.70504 11.4369C7.12575 10.658 5.84756 9.37981 5.06868 7.80052C4.91522 7.48935 5.02608 7.11249 5.32359 6.93398L6.50341 6.22609L5.54856 3.83898H3.33325ZM1.91904 3.09143C2.29411 2.71636 2.80282 2.50564 3.33325 2.50564H5.99992C6.27252 2.50564 6.51766 2.67161 6.6189 2.92472L7.95224 6.25805C8.07376 6.56186 7.95683 6.90895 7.67625 7.0773L6.56025 7.7469C7.10949 8.64265 7.86291 9.39607 8.75866 9.94531L9.42826 8.82931C9.59661 8.54873 9.9437 8.4318 10.2475 8.55332L13.5808 9.88666C13.834 9.9879 13.9999 10.233 13.9999 10.5056V13.1723C13.9999 13.7027 13.7892 14.2115 13.4141 14.5865C13.0391 14.9616 12.5304 15.1723 11.9999 15.1723C11.9864 15.1723 11.9729 15.1719 11.9595 15.1711C9.19646 15.0032 6.59042 13.8299 4.63307 11.8725C2.67571 9.91514 1.50239 7.3091 1.33448 4.54608C1.33366 4.53262 1.33325 4.51913 1.33325 4.50564C1.33325 3.97521 1.54397 3.4665 1.91904 3.09143Z"
                            fill="#9CA3AF"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.33325 5.17231C9.33325 4.80412 9.63173 4.50564 9.99992 4.50564C10.5304 4.50564 11.0391 4.71636 11.4141 5.09143C11.7892 5.4665 11.9999 5.97521 11.9999 6.50564C11.9999 6.87383 11.7014 7.17231 11.3333 7.17231C10.9651 7.17231 10.6666 6.87383 10.6666 6.50564C10.6666 6.32883 10.5963 6.15926 10.4713 6.03424C10.3463 5.90921 10.1767 5.83898 9.99992 5.83898C9.63173 5.83898 9.33325 5.5405 9.33325 5.17231Z"
                            fill="#9CA3AF"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.33325 2.50065C9.33325 2.13246 9.63173 1.83398 9.99992 1.83398C11.2376 1.83398 12.4246 2.32565 13.2998 3.20082C14.1749 4.07599 14.6666 5.26297 14.6666 6.50065C14.6666 6.86884 14.3681 7.16732 13.9999 7.16732C13.6317 7.16732 13.3333 6.86884 13.3333 6.50065C13.3333 5.6166 12.9821 4.76875 12.3569 4.14363C11.7318 3.51851 10.884 3.16732 9.99992 3.16732C9.63173 3.16732 9.33325 2.86884 9.33325 2.50065Z"
                            fill="#9CA3AF"
                          />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            height: '20px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span
                              style={{
                                color: '#1f2937',
                                fontSize: '14px',
                                fontWeight: '400',
                                lineHeight: '16px',
                              }}
                            >
                              {phone?.number?.includes('X') ? (
                                <>
                                  {phone?.number?.slice(0, 3)}
                                  <span className="list-dots">
                                    &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                                  </span>
                                </>
                              ) : (
                                phone?.number
                              )}
                            </span>

                            {/* Phone Number Copy Icon */}
                            {!phone?.number?.includes('X') && (
                              <span
                                style={{
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  handlePhoneNumberCopy(phone?.number)
                                }
                                data-tooltip-id="my-tooltip-Email-Copy"
                              >
                                {isPhoneCopyiconDisplay && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="17"
                                    viewBox="0 0 16 17"
                                    fill="none"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M6.66667 6.49588C6.29848 6.49588 6 6.79435 6 7.16254V12.4959C6 12.8641 6.29848 13.1625 6.66667 13.1625H12C12.3682 13.1625 12.6667 12.8641 12.6667 12.4959V7.16254C12.6667 6.79435 12.3682 6.49588 12 6.49588H6.66667ZM4.66667 7.16254C4.66667 6.05797 5.5621 5.16254 6.66667 5.16254H12C13.1046 5.16254 14 6.05797 14 7.16254V12.4959C14 13.6004 13.1046 14.4959 12 14.4959H6.66667C5.5621 14.4959 4.66667 13.6004 4.66667 12.4959V7.16254Z"
                                      fill="#9CA3AF"
                                    />
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M2.58579 3.09165C2.96086 2.71657 3.46957 2.50586 4 2.50586H9.33333C9.86377 2.50586 10.3725 2.71657 10.7475 3.09165C11.1226 3.46672 11.3333 3.97543 11.3333 4.50586V5.83919C11.3333 6.20738 11.0349 6.50586 10.6667 6.50586C10.2985 6.50586 10 6.20738 10 5.83919V4.50586C10 4.32905 9.92976 4.15948 9.80474 4.03445C9.67971 3.90943 9.51014 3.83919 9.33333 3.83919H4C3.82319 3.83919 3.65362 3.90943 3.5286 4.03445C3.40357 4.15948 3.33333 4.32905 3.33333 4.50586V9.83919C3.33333 10.016 3.40357 10.1856 3.5286 10.3106C3.65362 10.4356 3.82319 10.5059 4 10.5059H5.33333C5.70152 10.5059 6 10.8043 6 11.1725C6 11.5407 5.70152 11.8392 5.33333 11.8392H4C3.46957 11.8392 2.96086 11.6285 2.58579 11.2534C2.21071 10.8783 2 10.3696 2 9.83919V4.50586C2 3.97543 2.21071 3.46672 2.58579 3.09165Z"
                                      fill="#9CA3AF"
                                    />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Find Phone  */}
                          {phoneIndex === 0 &&
                            singleProfile?.isRevealed &&
                            singleProfile?.reReveal && (
                              <div
                                style={
                                  isRevealing
                                    ? {
                                        opacity: '0.35',
                                        cursor: 'not-allowed',
                                        padding: '2px 4px',
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: '2px',
                                        border: '1px solid #BFDBFE',
                                        backgroundColor: '#EFF6FF',
                                      }
                                    : {
                                        backgroundColor: '#EFF6FF',
                                        borderRadius: '4px',
                                        border: '1px solid #BFDBFE',
                                        cursor: 'pointer',
                                        padding: '2px 4px',
                                        alignItems: 'center',
                                        display: 'flex',
                                        gap: '2px',
                                      }
                                }
                                onClick={() => {
                                  if (!isRevealing) {
                                    handleViewEmailPhoneAndFindPhoneBtn();
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="13"
                                  viewBox="0 0 12 13"
                                  fill="none"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5 2.5C3.34315 2.5 2 3.84315 2 5.5C2 7.15685 3.34315 8.5 5 8.5C6.65685 8.5 8 7.15685 8 5.5C8 3.84315 6.65685 2.5 5 2.5ZM1 5.5C1 3.29086 2.79086 1.5 5 1.5C7.20914 1.5 9 3.29086 9 5.5C9 7.70914 7.20914 9.5 5 9.5C2.79086 9.5 1 7.70914 1 5.5Z"
                                    fill="#1D4ED8"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M7.14645 7.64645C7.34171 7.45118 7.65829 7.45118 7.85355 7.64645L10.8536 10.6464C11.0488 10.8417 11.0488 11.1583 10.8536 11.3536C10.6583 11.5488 10.3417 11.5488 10.1464 11.3536L7.14645 8.35355C6.95118 8.15829 6.95118 7.84171 7.14645 7.64645Z"
                                    fill="#1D4ED8"
                                  />
                                </svg>
                                <span
                                  className="find-phone-txt"
                                  style={{
                                    color: '#1D4ED8',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    lineHeight: '16px',
                                  }}
                                >
                                  Find Phone
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
                <div
                  style={{
                    border: '1.2px solid #F3F4F6',
                    width: '300px',
                    marginLeft: '16px',
                  }}
                />

                {/* DropDown */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    opacity:
                      isRevealing && revealType === 'email' ? '0.35' : '1',
                    pointerEvents:
                      isRevealing && revealType === 'email' ? 'none' : 'auto',
                    cursor:
                      isRevealing && revealType === 'email'
                        ? 'not-allowed'
                        : 'default',
                  }}
                >
                  {singleProfile?.id && (
                    <div style={{ display: 'flex', padding: '0px 16px' }}>
                      <AddToSequence
                        sequenceOptionLabels={sequenceOptions}
                        stepOptions={stepOptions}
                        tagOptions={tagOptions}
                        clientSequenceOptions={clientOptions}
                        clientAssociatedSequenceValue={selectedClient}
                        ClientAssociatedSequenceOnChange={setSelectedClient}
                        selectedSequenceValue={selectedSequence}
                        SelectedSequenceOnChange={setSelectedSequence}
                        selectedStepValue={selectedStep}
                        SelectedStepOnChange={setSelectedStep}
                        selectedTagsValue={sequenceTags}
                        SelectedTagsOnChange={setSequenceTags}
                        clientSequences={clientSequences}
                        handleOnSave={handleOnSave}
                        recentSequence={singleProfile?.sequences}
                        isExpanded={expandedSection === 'sequence'}
                        setIsExpanded={handleExpandedSection}
                        btnLoadingStatus={btnLoadingStatus.addToSequence}
                        isAgency={isAgency}
                      />
                    </div>
                  )}
                  {singleProfile.id && singleProfile.isRevealed && (
                    <div style={{ display: 'flex', padding: '0px 16px' }}>
                      <AddTagsSelect
                        tagOptions={tagOptions}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        isExpanded={expandedSection === 'tags'}
                        setIsExpanded={handleExpandedSection}
                        saveTags={saveTags}
                        btnLoadingStatus={btnLoadingStatus.saveTags}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ))}

      {/* Render ToolTip */}

      <ReactTooltip
        id="my-tooltip-1"
        place="bottom"
        content="1 Credits Required"
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
        id="my-tooltip-2"
        place="bottom"
        content={
          isRevealing && revealType === 'email'
            ? "You can't take this action as lead reveal is in progress"
            : '2 Credits Required'
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
        id="my-tooltip-Email-Copy"
        place="bottom"
        content={isCopied ? 'Copied' : 'Copy'}
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
    </>
  );
};

export default SingleProfile;
