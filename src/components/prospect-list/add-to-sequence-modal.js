/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select, { components } from 'react-select';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import cross from '../../assets/icons/cross.svg';
import { CustomButton } from './add-tags';
import prospectsInstance from '../../config/server/finder/prospects';

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
  const shouldShowTooltip = fullLabel.length > 30;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 30)}..`
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
        padding: '4px 12px',
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
  const shouldShowTooltip = fullLabel.length > 29;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 29)}....`
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
  const shouldShowTooltip = fullLabel.length > 10;
  const truncatedLabel = shouldShowTooltip
    ? `${fullLabel.slice(0, 10)}....`
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

const AddToSequenceModal = ({
  showModal,
  onClose,
  handleAddToSequence,
  isAgency,
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
        setClientSequences(customSequenceOptions);
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
      if (isAgency) {
        fetchAgencyClients();
      }
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
        <div className="custom-modal-body">
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
                    gap: '8px',
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
                    components={{ Option: CustomOption }}
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
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      lineHeight: '16px',
                      textAlign: 'center',
                      borderRadius: '4px',
                      backgroundColor: '#1F2937',
                      padding: '8px',
                      zIndex: '99',
                    }}
                  />
                </div>
              )}

              <div
                style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}
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
                  components={{ Option: customOptionSequenceName }}
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
                      // textTransform: 'uppercase',
                      // backgroundColor: '#f9fafb',
                    }),
                  }}
                />
                <ReactTooltip
                  id="step-option-tooltip"
                  place="bottom"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#1F2937',
                    padding: '8px',
                    zIndex: '99',
                  }}
                />
              </div>

              <div
                style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}
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
                  components={{ Option: CustomOption }}
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
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#1F2937',
                    padding: '8px',
                    zIndex: '99',
                  }}
                />
              </div>

              <div
                style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}
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
                        ? `${data.label.slice(0, 10)}....`
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
                    }),
                    multiValue: (base) => ({
                      ...base,
                      display: 'flex',
                      height: '25px',
                      padding: '4px 8px',
                      alignItems: 'center',
                      borderRadius: '4px',
                      background: '#DBEAFE',
                      margin: '4px',
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
                      borderRadius: '50%',
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
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#1F2937',
                    padding: '8px',
                    zIndex: '99',
                  }}
                />
                <ReactTooltip
                  id="chip-tooltip"
                  place="bottom"
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    lineHeight: '16px',
                    textAlign: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#1F2937',
                    padding: '8px',
                    zIndex: '99',
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
