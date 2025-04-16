/* eslint-disable react/destructuring-assignment */
import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { components } from 'react-select';
import { Button, Spinner } from 'react-bootstrap';

// const tagOptions = [
//   { value: 'tag1', label: 'Tag 1' },
//   { value: 'tag2', label: 'Tag 2' },
//   { value: 'tag3', label: 'Tag 3' },
// ];

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
        'data-tooltip-id': 'option-tooltip',
        'data-tooltip-content': fullLabel,
      })}
    >
      <components.Option {...props} innerProps={{ ...props.innerProps }}>
        {truncatedLabel}
      </components.Option>
    </div>
  );
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    border: state.isFocused ? '1px solid #1d4ed8' : '1px solid #d1d5db',
    boxShadow: state.isFocused ? '0px 0px 0px 2px #DBEAFE' : 'none',
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
  option: (base, state) => ({
    ...base,
    padding: '6px 16px',
    backgroundColor: state.isFocused ? '#eff6ff' : 'transparent',
    color: '#1F2937',
    fontFamily: 'Inter',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
    cursor: 'pointer',
  }),
  multiValue: () => ({
    display: 'none',
  }),
};

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  // marginRight: '8px',
  // marginBottom: '8px',
  borderRadius: '4px',
  backgroundColor: '#EFF6FF',
  color: '#1F2937',
  fontSize: '14px',
  fontWeight: 400,
  fontFamily: 'Inter',
  lineHeight: '20px',
};

const AddTagsSelect = ({
  tagOptions,
  selectedTags,
  setSelectedTags,
  isExpanded,
  setIsExpanded,
  saveTags,
  btnLoadingStatus,
  isFreePlanUser,
}) => (
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
      cursor: isFreePlanUser ? 'not-allowed' : 'pointer',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      {...(!isFreePlanUser && {
        onClick: () => {
          setIsExpanded('tags');
        },
      })}
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
            d="M4.66732 3.16732C4.13688 3.16732 3.62818 3.37803 3.2531 3.7531C2.87803 4.12818 2.66732 4.63688 2.66732 5.16732V7.55784L8.45541 13.3459C8.51498 13.395 8.58987 13.422 8.66732 13.422C8.74477 13.422 8.81965 13.395 8.87922 13.3459L12.8459 9.37922C12.895 9.31965 12.922 9.24477 12.922 9.16732C12.922 9.08987 12.895 9.01498 12.8459 8.95541L7.05784 3.16732H4.66732ZM2.31029 2.81029C2.93542 2.18517 3.78326 1.83398 4.66732 1.83398H7.33398C7.5108 1.83398 7.68036 1.90422 7.80539 2.02925L13.8054 8.02925C13.8141 8.038 13.8226 8.04699 13.8309 8.05621C14.1042 8.36178 14.2553 8.75736 14.2553 9.16732C14.2553 9.57728 14.1042 9.97286 13.8309 10.2784C13.8226 10.2877 13.8141 10.2966 13.8054 10.3054L9.80539 14.3054C9.79664 14.3141 9.78765 14.3226 9.77843 14.3309C9.47286 14.6042 9.07728 14.7553 8.66732 14.7553C8.25736 14.7553 7.86178 14.6042 7.55621 14.3309C7.54699 14.3226 7.538 14.3141 7.52925 14.3054L1.52925 8.30539C1.40422 8.18036 1.33398 8.0108 1.33398 7.83398V5.16732C1.33398 4.28326 1.68517 3.43542 2.31029 2.81029Z"
            fill="#6B7280"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.00065 5.83898C5.63246 5.83898 5.33398 6.13745 5.33398 6.50564C5.33398 6.87383 5.63246 7.17231 6.00065 7.17231C6.36884 7.17231 6.66732 6.87383 6.66732 6.50564C6.66732 6.13745 6.36884 5.83898 6.00065 5.83898ZM4.00065 6.50564C4.00065 5.40107 4.89608 4.50564 6.00065 4.50564C7.10522 4.50564 8.00065 5.40107 8.00065 6.50564C8.00065 7.61021 7.10522 8.50564 6.00065 8.50564C4.89608 8.50564 4.00065 7.61021 4.00065 6.50564Z"
            fill="#6B7280"
          />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>
          Add Tags
        </span>
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

    {/* Tag Chips */}
    {selectedTags.length > 0 && !isExpanded && (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          height: '16px',
        }}
      >
        {/* {selectedTags.slice(0, 3).map((tag) => (
            <div key={tag.value} style={chipStyle}>
              {tag.label}
            </div>
          ))} */}

        {selectedTags.slice(0, 3).map((tag) => {
          const showTooltip = tag.label.length > 10;
          const displayLabel = showTooltip
            ? `${tag.label.slice(0, 10)}....`
            : tag.label;
          return (
            <div
              key={tag.value}
              style={chipStyle}
              {...(showTooltip && {
                'data-tooltip-id': 'chip-tooltip',
                'data-tooltip-content': tag.label,
              })}
            >
              {displayLabel}
            </div>
          );
        })}
        {selectedTags.length > 3 && (
          <div
            style={{
              ...chipStyle,
              backgroundColor: '#eff6ff',
              color: '#1f2937',
              cursor: 'pointer',
            }}
            onClick={() => setIsExpanded('tags')}
          >
            +{selectedTags.length - 3}
          </div>
        )}
      </div>
    )}

    {/* Expanded View */}
    {isExpanded && (
      <>
        <CreatableSelect
          isMulti
          options={tagOptions}
          value={selectedTags}
          onChange={(val) => setSelectedTags(val || [])}
          placeholder="Select"
          components={{ Option: CustomOptionTags }}
          styles={customStyles}
        />

        {/* Chips Below Input */}
        {selectedTags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '88px',
              overflowY: 'auto',
            }}
          >
            {selectedTags.map((tag) => {
              const showTooltip = tag.label.length > 10;
              const displayLabel = showTooltip
                ? `${tag.label.slice(0, 10)}....`
                : tag.label;
              return (
                <div
                  key={tag.value}
                  style={chipStyle}
                  {...(showTooltip && {
                    'data-tooltip-id': 'chip-tooltip',
                    'data-tooltip-content': tag.label,
                  })}
                >
                  {displayLabel}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            className="py-2"
            disabled={selectedTags.length === 0 || btnLoadingStatus}
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
              width: '100px',
            }}
            onClick={saveTags}
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
);

export default AddTagsSelect;
