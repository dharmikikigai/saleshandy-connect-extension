/* eslint-disable react/destructuring-assignment */
import React from 'react';
import CreatableSelect from 'react-select/creatable';
import Select, { components } from 'react-select';
import { Button, Spinner } from 'react-bootstrap';
import { Tooltip as ReactTooltip } from 'react-tooltip';

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

// const sequenceOptions = [
//   {
//     label: 'Recent Sequences',
//     options: [
//       { value: 'sequence_2', label: 'Another Sequence', status: 1 },
//       { value: 'sequence_3', label: 'Sequence 3', status: 2 },
//       // Add more if needed
//     ],
//   },
//   {
//     value: 'abhishek_first',
//     label: "Abhishek's First Sequence 🚀 (Current Sequence)",
//     status: 3,
//   },
//   { value: 'sequence_2', label: 'Another Sequence' },
// ];

// const clientSequenceOptions = [
//   {
//     value: 'abhishek_first',
//     label: "Abhishek's First Sequence 🚀 (Current Sequence)",
//     status: 3,
//   },
//   { value: 'sequence_2', label: 'Another Sequence' },
// ];

// const recentSequence = [
//   {
//     value: 'abhishek_first',
//     label: "Abhishek's First Sequence",
//   },
//   { value: 'sequence_2', label: 'Another Sequence' },
// ];

// const stepOptions = [
//   { value: 'step_1', label: 'Step 1: Email' },
//   { value: 'step_2', label: 'Step 2: Follow-up' },
// ];

// const tagOptions = [
//   { value: 'tag1', label: 'Tag 1' },
//   { value: 'tag2', label: 'Tag 2' },
//   { value: 'tag3', label: 'Tag 3' },
// ];

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
  // const isCurrentSequenceGroup = data.label !== 'Current Sequence';

  <div>
    {/* {isCurrentSequenceGroup && (
          <div
            style={{
              borderTop: '1px solid #D1D5DB',
              margin: '8px 0',
            }}
          />
        )} */}
    <div
      style={{
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
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

const AddToSequence = ({
  sequenceOptionLabels,
  stepOptions,
  tagOptions,
  clientSequenceOptions,
  clientAssociatedSequenceValue,
  ClientAssociatedSequenceOnChange,
  selectedSequenceValue,
  SelectedSequenceOnChange,
  selectedStepValue,
  SelectedStepOnChange,
  selectedTagsValue,
  SelectedTagsOnChange,
  clientSequences,
  handleOnSave,
  recentSequence,
  isExpanded,
  setIsExpanded,
  btnLoadingStatus,
  isAgency,
}) => {
  // const [isExpanded, setIsExpanded] = useState(false);
  // const [clientAssociatedSequence, setClientAssociatedSequence] = useState(
  //   null,
  // );
  // const [selectedSequence, setSelectedSequence] = useState(null);
  // const [selectedStep, setSelectedStep] = useState(null);
  // const [selectedTags, setSelectedTags] = useState([]);

  // Dropdown sequence name option (To add partition between recent and current sequence)
  const processedSequenceOptions = sequenceOptionLabels.map((group) => {
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
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        width: '320px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '16px',
        }}
        onClick={() => setIsExpanded('sequence')}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                d="M14.4711 2.02927C14.7315 2.28961 14.7315 2.71172 14.4711 2.97207L7.13779 10.3054C6.87744 10.5658 6.45533 10.5658 6.19498 10.3054C5.93463 10.0451 5.93463 9.62295 6.19498 9.3626L13.5283 2.02927C13.7887 1.76892 14.2108 1.76892 14.4711 2.02927Z"
                fill="#6B7280"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.4711 2.02927C14.6539 2.21204 14.7145 2.48399 14.6268 2.7271L10.2934 14.7271C10.2871 14.7445 10.2801 14.7616 10.2724 14.7784C10.19 14.9583 10.0577 15.1107 9.89115 15.2176C9.72463 15.3244 9.53092 15.3813 9.33306 15.3813C9.13519 15.3813 8.94148 15.3244 8.77496 15.2176C8.61242 15.1133 8.48245 14.9656 8.39966 14.7913L6.16948 10.3309L1.70914 8.10073C1.53485 8.01795 1.38713 7.88798 1.28282 7.72543C1.17595 7.55891 1.11914 7.3652 1.11914 7.16734C1.11914 6.96947 1.17595 6.77576 1.28282 6.60924C1.38968 6.44271 1.54211 6.31037 1.72199 6.22794C1.73879 6.22024 1.75591 6.21324 1.77329 6.20697L13.7733 1.87363C14.0164 1.78584 14.2884 1.84649 14.4711 2.02927ZM2.91423 7.21257L6.96453 9.23772C7.09355 9.30223 7.19816 9.40684 7.26267 9.53586L9.28782 13.5862L12.8903 3.6101L2.91423 7.21257Z"
                fill="#6B7280"
              />
            </svg>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Add to Sequence
            </span>
          </div>
        </div>
        {isExpanded ? (
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
              d="M7.52827 6.02925C7.78862 5.7689 8.21073 5.7689 8.47108 6.02925L12.4711 10.0292C12.7314 10.2896 12.7314 10.7117 12.4711 10.9721C12.2107 11.2324 11.7886 11.2324 11.5283 10.9721L7.99967 7.44346L4.47108 10.9721C4.21073 11.2324 3.78862 11.2324 3.52827 10.9721C3.26792 10.7117 3.26792 10.2896 3.52827 10.0292L7.52827 6.02925Z"
              fill="#6B7280"
            />
          </svg>
        ) : (
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
              d="M3.52876 6.02925C3.78911 5.7689 4.21122 5.7689 4.47157 6.02925L8.00016 9.55784L11.5288 6.02925C11.7891 5.7689 12.2112 5.7689 12.4716 6.02925C12.7319 6.2896 12.7319 6.71171 12.4716 6.97206L8.47157 10.9721C8.21122 11.2324 7.78911 11.2324 7.52876 10.9721L3.52876 6.97206C3.26841 6.71171 3.26841 6.2896 3.52876 6.02925Z"
              fill="#6B7280"
            />
          </svg>
        )}
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <>
          {recentSequence.length > 0 && (
            <>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <span
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '16px',
                  }}
                >
                  Already in {recentSequence.length} Sequence
                  {recentSequence.length > 1 ? 's' : ''}:
                </span>

                {recentSequence.map((sequence) => (
                  <span
                    key={sequence?.id}
                    style={{
                      color: '#1f2937',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '20px',
                    }}
                  >
                    {sequence.sequenceName}
                  </span>
                ))}
              </div>
              <div
                style={{
                  // marginTop: '5%',
                  border: '1.2px solid #F3F4F6',
                  // width: '300px',
                }}
              />
            </>
          )}

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
                    Client Associated
                  </span>
                  <Select
                    options={clientSequenceOptions}
                    value={clientAssociatedSequenceValue}
                    onChange={ClientAssociatedSequenceOnChange}
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
                    clientAssociatedSequenceValue
                      ? processedClientSequencesOptions
                      : processedSequenceOptions
                  }
                  value={selectedSequenceValue}
                  onChange={(value) => SelectedSequenceOnChange(value)}
                  components={{ Option: customOptionSequenceName }}
                  placeholder="Select"
                  formatGroupLabel={formatGroupLabel}
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
                  value={selectedStepValue}
                  onChange={SelectedStepOnChange}
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
                  value={selectedTagsValue}
                  onChange={SelectedTagsOnChange}
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
                      minHeight: '32px',
                      flexWrap: 'no-wrap',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      display: 'flex',
                      flexWrap: 'wrap',
                      maxHeight: '58px',
                      overflowY: 'auto',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
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
                    input: (base) => ({
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
                      maxHeight: '58px',
                    }),
                    multiValue: (base) => ({
                      ...base,
                      display: 'flex',
                      height: '22px',
                      padding: '0px 6px',
                      alignItems: 'center',
                      borderRadius: '4px',
                      background: '#eff6ff',
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
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              className="py-2"
              disabled={
                !selectedSequenceValue || !selectedStepValue || btnLoadingStatus
              }
              style={{
                fontSize: '14px',
                padding: '6px 16px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                fontWeight: '500',
                lineHeight: '20px',
                background: '#1D4ED8',
                gap: '8px',
                maxHeight: '32px',
                alignItems: 'center',
                width: '100px',
              }}
              onClick={handleOnSave}
              isLoading={btnLoadingStatus}
            >
              {btnLoadingStatus ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <span>Save</span>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddToSequence;
