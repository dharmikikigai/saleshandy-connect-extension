/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select, { components } from 'react-select';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import cross from '../../assets/icons/cross.svg';
import { CustomButton } from './add-tags';
import prospectsInstance from '../../config/server/finder/prospects';
import downChevron from '../../assets/icons/chevronDown.svg';

const getStatusDotColor = (status) => {
  switch (status) {
    case 1:
      return '#059669'; // green
    case 2:
      return '#B91C1C'; // red
    case 3:
      return '#9CA3AF'; // gray
    default:
      return '#9CA3AF'; // fallback gray
  }
};

// Custom option render in sequence name dropdown
const customOptionSequenceName = (props) => {
  const { data, innerRef, innerProps, isFocused } = props;

  const fullLabel = data.label;
  const shouldShowTooltip = fullLabel.length > 25;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 25)}..`
    : fullLabel;

  return (
    <>
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          backgroundColor: isFocused ? '#eff6ff' : 'white',
          color: '#1f2937',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
        }}
        {...(shouldShowTooltip && {
          'data-tooltip-id': 'step-option-tooltip',
          'data-tooltip-content': fullLabel,
        })}
      >
        {truncatedLabel}
        <span
          style={{
            height: 8,
            width: 8,
            borderRadius: '50%',
            backgroundColor: getStatusDotColor(data.status),
          }}
        />
      </div>

      {/* Optional: render a separator if it's the last in group */}
      {data.isLastInGroup && (
        <div
          style={{
            borderTop: '1px solid #D1D5DB',
            margin: '4px 0',
          }}
        />
      )}
    </>
  );
};

// Title for sequence name dropdown
const formatGroupLabel = (data) => (
  <div>
    <div
      style={{
        padding: '0px 12px 4px 12px',
        fontSize: '12px',
        color: '#6B7280',
        textTransform: 'none',
        fontWeight: '500',
        lineHeight: '16px',
      }}
    >
      {data.label}
    </div>
  </div>
);

const CustomOption = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const fullLabel = props.label;
  const shouldShowTooltip = fullLabel.length > 30;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 30)}..`
    : fullLabel;

  return (
    <div
      {...(shouldShowTooltip && {
        'data-tooltip-id': 'step-option-tooltip',
        'data-tooltip-content': fullLabel,
      })}
    >
      <components.Option {...props} innerProps={{ ...props.innerProps }}>
        {truncatedLabel}
      </components.Option>
    </div>
  );
};

const CustomOptionTags = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const fullLabel = props.label;
  const shouldShowTooltip = fullLabel.length > 25;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 25)}..`
    : fullLabel;

  return (
    <div
      {...(shouldShowTooltip && {
        'data-tooltip-id': 'step-option-tooltip',
        'data-tooltip-content': fullLabel,
      })}
    >
      <components.Option {...props} innerProps={{ ...props.innerProps }}>
        {truncatedLabel}
      </components.Option>
    </div>
  );
};

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <img src={downChevron} alt="down-chevron" />
  </components.DropdownIndicator>
);

const CustomMultiValueRemove = (props) => (
  <components.MultiValueRemove {...props}>
    <div className="custom-multi-value-remove">
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
          d="M10.9118 3.58687C11.1396 3.81468 11.1396 4.18402 10.9118 4.41183L3.91183 11.4118C3.68402 11.6396 3.31468 11.6396 3.08687 11.4118C2.85906 11.184 2.85906 10.8147 3.08687 10.5869L10.0869 3.58687C10.3147 3.35906 10.684 3.35906 10.9118 3.58687Z"
          fill="#1F2937"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.08687 3.58687C3.31468 3.35906 3.68402 3.35906 3.91183 3.58687L10.9118 10.5869C11.1396 10.8147 11.1396 11.184 10.9118 11.4118C10.684 11.6396 10.3147 11.6396 10.0869 11.4118L3.08687 4.41183C2.85906 4.18402 2.85906 3.81468 3.08687 3.58687Z"
          fill="#1F2937"
        />
      </svg>
    </div>
  </components.MultiValueRemove>
);

const AddToSequenceModal = ({
  showModal,
  onClose,
  handleAddToSequence,
  isLoading,
}) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  // const [sequences, setSequences] = useState([]);
  const [isLoadingSequences, setIsLoadingSequences] = useState(false);
  const [sequenceOptions, setSequenceOptions] = useState([]);
  const [clientSequences, setClientSequences] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [stepOptions, setStepOptions] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [isAgency, setIsAgency] = useState(false);

  const fetchTags = async () => {
    try {
      setIsLoadingTags(true);
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
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoadingTags(false);
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
    } catch (error) {
      console.error('Error fetching agency clients:', error);
    }
  };

  const fetchSequences = async () => {
    try {
      setIsLoadingSequences(true);
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
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    } finally {
      setIsLoadingSequences(false);
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
        const isSelectedSequenceInClientSequences = res.payload.some(
          (sequence) => sequence.id === selectedSequence?.value,
        );
        if (!isSelectedSequenceInClientSequences) {
          setSelectedSequence(null);
        }
        setClientSequences(customSequenceOptions);
      } else {
        setClientSequences([]);
        setSelectedSequence(null);
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    } finally {
      setIsLoadingSequences(false);
    }
  };
  const handleOnSave = () => {
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

  const handleClose = () => {
    setSelectedClient(null);
    setSelectedSequence(null);
    setSelectedStep(null);
    setSelectedTags([]);
    onClose();
  };

  useEffect(() => {
    if (showModal) {
      fetchTags();
      fetchSequences();
      fetchAgencyClients();
    }
  }, [showModal]);

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
      setSelectedStep(null);
    } else {
      setSelectedStep(null);
      setStepOptions([]);
    }
  }, [selectedSequence]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientSequences();
    }
  }, [selectedClient]);

  const processedSequenceOptions = sequenceOptions.map((group) => {
    if (group.options) {
      const updatedGroupOptions = group.options.map((opt, index, arr) => ({
        ...opt,
        isLastInGroup: index === arr.length - 1,
      }));
      return {
        ...group,
        options: updatedGroupOptions,
      };
    }
    return group;
  });

  const processedClientSequencesOptions = clientSequences.map((group) => {
    if (group.options) {
      const updatedGroupOptions = group.options.map((opt, index, arr) => ({
        ...opt,
        isLastInGroup: index === arr.length - 1,
      }));
      return {
        ...group,
        options: updatedGroupOptions,
      };
    }
    return group;
  });

  return (
    <div className={`custom-modal-overlay ${showModal ? 'show' : ''}`}>
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h3 className="custom-modal-title"> Add to Sequence</h3>
          <button
            type="button"
            className="custom-modal-close"
            onClick={handleClose}
          >
            <img src={cross} alt="close" />
          </button>
        </div>
        <div className="custom-modal-body add-to-sequence-modal-body">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}
            >
              {isAgency && (
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    flexDirection: 'column',
                  }}
                >
                  <span
                    style={{
                      color: '#9ca3af',
                      fontFamily: 'Inter',
                      fontStyle: 'normal',
                      fontSize: '12px',
                      fontWeight: '500',
                      lineHeight: '16px',
                    }}
                  >
                    Client Associated (Optional)
                  </span>
                  <Select
                    options={clientOptions}
                    value={selectedClient}
                    onChange={setSelectedClient}
                    isClearable
                    placeholder="Select"
                    components={{
                      Option: CustomOption,
                      DropdownIndicator,
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        border: state.isFocused
                          ? '1px solid #1d4ed8'
                          : '1px solid #d1d5db',
                        boxShadow: state.isFocused
                          ? '0px 0px 0px 2px #DBEAFE'
                          : 'none',
                        borderRadius: '4px',
                        '&:hover': {
                          borderColor: 'none',
                        },
                        cursor: 'pointer',
                        height: '32px',
                        minHeight: '32px',
                        flexWrap: 'no-wrap',
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none',
                      }),
                      input: (base) => ({
                        ...base,
                        color: '#1F2937',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '20px',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#9CA3AF',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '20px',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#1F2937',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '20px',
                      }),
                      option: (base, state) => ({
                        ...base,
                        padding: '6px 16px',
                        backgroundColor: state.isFocused
                          ? '#eff6ff'
                          : 'transparent',
                        color: '#1F2937',
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '20px',
                        cursor: 'pointer',
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        padding: '0px',
                      }),
                    }}
                  />
                  <ReactTooltip
                    id="step-option-tooltip"
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
                      zIndex: '99',
                      display: 'flex',
                      width: '184px',
                      textWrap: 'wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  />
                </div>
              )}

              <div
                style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}
              >
                <span
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                  }}
                >
                  Sequence Name
                </span>
                <Select
                  options={
                    selectedClient
                      ? processedClientSequencesOptions
                      : processedSequenceOptions
                  }
                  value={selectedSequence}
                  onChange={(value) => setSelectedSequence(value)}
                  components={{
                    Option: customOptionSequenceName,
                    DropdownIndicator,
                  }}
                  placeholder="Select"
                  formatGroupLabel={formatGroupLabel}
                  isLoading={isLoadingSequences}
                  isDisabled={isLoadingSequences}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: state.isFocused
                        ? '1px solid #1d4ed8'
                        : '1px solid #d1d5db',
                      boxShadow: state.isFocused
                        ? '0px 0px 0px 2px #DBEAFE'
                        : 'none',
                      borderRadius: '4px',
                      '&:hover': {
                        borderColor: 'none',
                      },
                      cursor: 'pointer',
                      height: '32px',
                      minHeight: '32px',
                      flexWrap: 'no-wrap',
                      backgroundColor: 'hsl(0, 0%, 100%)',
                    }),
                    indicatorSeparator: (base) => ({
                      ...base,
                      display: 'none',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9CA3AF',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      padding: '6px 16px',
                      backgroundColor: state.isFocused
                        ? '#eff6ff'
                        : 'transparent',
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                      cursor: 'pointer',
                      height: '32px',
                      minHeight: '32px',
                    }),
                    groupHeading: (base) => ({
                      ...base,
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#9ca3af',
                      paddingLeft: '0px',
                      paddingTop: '0px',
                      marginTop: '0px',
                      // textTransform: 'uppercase',
                      // backgroundColor: '#f9fafb',
                    }),
                  }}
                />
                <ReactTooltip
                  id="step-option-tooltip"
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
                    zIndex: '99',
                    display: 'flex',
                    width: '184px',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />
              </div>

              <div
                style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}
              >
                <span
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                  }}
                >
                  Sequence Steps
                </span>
                <Select
                  options={stepOptions}
                  value={selectedStep}
                  onChange={setSelectedStep}
                  placeholder="Select"
                  components={{
                    Option: CustomOption,
                    DropdownIndicator,
                  }}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: state.isFocused
                        ? '1px solid #1d4ed8'
                        : '1px solid #d1d5db',
                      boxShadow: state.isFocused
                        ? '0px 0px 0px 2px #DBEAFE'
                        : 'none',
                      borderRadius: '4px',
                      '&:hover': {
                        borderColor: 'none',
                      },
                      cursor: 'pointer',
                      height: '32px',
                      minHeight: '32px',
                      flexWrap: 'no-wrap',
                      backgroundColor: 'hsl(0, 0%, 100%)',
                    }),
                    indicatorSeparator: (base) => ({
                      ...base,
                      display: 'none',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9CA3AF',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      padding: '6px 16px',
                      backgroundColor: state.isFocused
                        ? '#eff6ff'
                        : 'transparent',
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                      cursor: 'pointer',
                      height: '32px',
                      minHeight: '32px',
                    }),
                  }}
                />
                <ReactTooltip
                  id="step-option-tooltip"
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
                    zIndex: '99',
                    display: 'flex',
                    width: '184px',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />
              </div>

              <div
                style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}
              >
                <span
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                  }}
                >
                  Add Tags (Optional)
                </span>
                <CreatableSelect
                  isMulti
                  options={tagOptions}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  isLoading={isLoadingTags}
                  components={{
                    Option: CustomOptionTags,
                    // eslint-disable-next-line react/no-unstable-nested-components
                    MultiValueLabel: ({ data, ...props }) => {
                      const showTooltip = data.label.length > 10;
                      const displayLabel = showTooltip
                        ? `${data.label.slice(0, 10)}..`
                        : data.label;

                      return (
                        <div
                          {...(showTooltip && {
                            'data-tooltip-id': 'chip-tooltip',
                            'data-tooltip-content': data.label,
                          })}
                        >
                          <components.MultiValueLabel {...props}>
                            {displayLabel}
                          </components.MultiValueLabel>
                        </div>
                      );
                    },
                    MultiValueRemove: CustomMultiValueRemove,
                  }}
                  placeholder="Select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: state.isFocused
                        ? '1px solid #1d4ed8'
                        : '1px solid #d1d5db',
                      boxShadow: state.isFocused
                        ? '0px 0px 0px 2px #DBEAFE'
                        : 'none',
                      borderRadius: '4px',
                      '&:hover': {
                        borderColor: 'none',
                      },
                      cursor: 'pointer',
                      minHeight: '32px',
                      flexWrap: 'no-wrap',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      display: 'none',
                    }),
                    indicatorSeparator: (base) => ({
                      ...base,
                      display: 'none',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#9CA3AF',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      padding: '6px 16px',
                      backgroundColor: state.isFocused
                        ? '#eff6ff'
                        : 'transparent',
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                      cursor: 'pointer',
                      height: '32px',
                      maxHeight: '58px',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      display: 'flex',
                      height: '25px',
                      padding: '4px 8px',
                      alignItems: 'center',
                      borderRadius: '4px',
                      background: '#DBEAFE',
                      margin: '2px 4px',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#1F2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '20px',
                      paddingLeft: 0, // remove default padding
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      padding: '0px',
                      borderRadius: '2px',
                      ':hover': {
                        backgroundColor: '#BFDBFE',
                      },
                    }),
                    clearIndicator: (base) => ({
                      ...base,
                      display: 'none',
                    }),
                  }}
                />
                <ReactTooltip
                  id="option-tooltip"
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
                    zIndex: '99',
                    display: 'flex',
                    width: '184px',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />
                <ReactTooltip
                  id="chip-tooltip"
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
                    zIndex: '99',
                    display: 'flex',
                    width: '184px',
                    textWrap: 'wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="custom-modal-footer">
          <CustomButton
            variant="primary"
            className="action-button"
            onClick={handleOnSave}
            disabled={selectedSequence === null || selectedStep === null}
            loading={isLoading.save}
          >
            Save
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddToSequenceModal;
