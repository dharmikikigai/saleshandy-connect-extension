/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { DateTime } from 'luxon';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
import { CustomButton } from './add-tags';
import cross from '../../assets/icons/cross.svg';
import ChevronLeft from '../../assets/icons/chevronLeft.svg';
import ChevronRight from '../../assets/icons/chevronRight.svg';
import ChevronDown from '../../assets/icons/chevronDown.svg';
import prospectsInstance from '../../config/server/finder/prospects';
import 'react-datepicker/dist/react-datepicker.css';

export const getCurrentTimeInUTC = () => DateTime.local();

const CustomOption = (props) => {
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
    <img src={ChevronDown} alt="down-chevron" />
  </components.DropdownIndicator>
);

export const DateFilter = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  LAST_7_DAYS: 'Last 7 days',
  LAST_14_DAYS: 'Last 14 days',
  LAST_30_DAYS: 'Last 30 days',
  LAST_90_DAYS: 'Last 90 days',
  CUSTOM: 'Custom',
};
export const dateFilterOptions = [
  {
    value: 'Today',
    label: 'Today',
    startDate: getCurrentTimeInUTC(),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Yesterday',
    label: 'Yesterday',
    startDate: getCurrentTimeInUTC().minus({ days: 1 }),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Last 7 days',
    label: 'Last 7 days',
    startDate: getCurrentTimeInUTC().minus({ days: 7 }),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Last 14 days',
    label: 'Last 14 days',
    startDate: getCurrentTimeInUTC().minus({ days: 14 }),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Last 30 days',
    label: 'Last 30 days',
    startDate: getCurrentTimeInUTC().minus({ days: 30 }),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Last 90 days',
    label: 'Last 90 days',
    startDate: getCurrentTimeInUTC().minus({ days: 90 }),
    endDate: getCurrentTimeInUTC(),
  },
  {
    value: 'Custom',
    label: 'Custom',
    startDate: null,
    endDate: null,
  },
];

const ProspectFilterModal = ({
  showModal,
  onClose,
  selectedTags,
  setSelectedTags,
  dateFilterValue,
  setDateFilterValue,
  dateFilterCustomValue,
  setDateFilterCustomValue,
  applyFilters,
  clearFilters,
  isLoading,
}) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);

  const getFormattedDate = (date) => moment(date).format('MMM DD, YYYY');

  const getMonth = (date) => moment(date).format('MMMM YYYY');

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
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Keep using fallback tags if API call fails
    }
  };

  const getCustomDateFilterValue = () => {
    let startDate = '';
    let endDate = '';

    if (dateFilterCustomValue && dateFilterCustomValue[0]) {
      startDate = getFormattedDate(dateFilterCustomValue[0]);
    }
    if (dateFilterCustomValue && dateFilterCustomValue[1]) {
      endDate = getFormattedDate(dateFilterCustomValue[1]);
    }

    return {
      label: `${startDate} ${endDate ? `- ${endDate}` : ''}`.trim(),
      value: 'Custom',
    };
  };

  useEffect(() => {
    if (showModal) {
      fetchTags();
    }
  }, [showModal]);

  return (
    <div className={`filter-modal ${showModal ? 'show' : ''}`}>
      <div className="custom-modal-header">
        <h3 className="custom-modal-title">Add Tags</h3>
        <button type="button" className="custom-modal-close" onClick={onClose}>
          <img src={cross} alt="close" />
        </button>
      </div>
      <div className="custom-modal-body filter-modal-body">
        <div className="filter-section-container">
          <div className="prospect-filter">
            <span>Tags</span>
            <Select
              isMulti
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select Tags"
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
                  minHeight: '32px',
                  flexWrap: 'no-wrap',
                  backgroundColor: '#F9FAFB',
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
                multiValue: (base) => ({
                  ...base,
                  display: 'flex',
                  height: '22px',
                  padding: '0px 6px',
                  alignItems: 'center',
                  borderRadius: '4px',
                  background: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  margin: '2px',
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
                maxWidth: '184px',
                textWrap: 'wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          </div>
          <div className="prospect-filter date-filter">
            <span>Date</span>
            <Select
              options={dateFilterOptions}
              value={
                dateFilterValue?.value === 'Custom'
                  ? getCustomDateFilterValue()
                  : dateFilterValue
              }
              onChange={(value) => {
                setDateFilterValue(value);
                if (value?.value === 'Custom') {
                  setShowCustomDateInput(true);
                } else {
                  setShowCustomDateInput(false);
                }
              }}
              components={{
                Option: CustomOption,
                DropdownIndicator,
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
                  backgroundColor: '#F9FAFB',
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
                  backgroundColor: state.isFocused ? '#eff6ff' : 'transparent',
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
            {dateFilterValue?.value === 'Custom' && showCustomDateInput && (
              <DatePicker
                dateFormat="MMM d, yyyy"
                selected={
                  dateFilterCustomValue?.[0]
                    ? new Date(dateFilterCustomValue[0])
                    : null
                }
                startDate={
                  dateFilterCustomValue?.[0]
                    ? new Date(dateFilterCustomValue[0])
                    : null
                }
                endDate={
                  dateFilterCustomValue?.[1]
                    ? new Date(dateFilterCustomValue[1])
                    : null
                }
                onChange={(dates) => {
                  const [start, end] = dates;
                  setDateFilterCustomValue([start, end]);

                  if (end) {
                    setTimeout(() => {
                      setShowCustomDateInput(false);
                    }, 100);
                  }
                }}
                inline
                showDisabledMonthNavigation
                selectsRange
                calendarStartDay={1}
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="pick-date-and-time-header">
                    <p>{getMonth(date)}</p>
                    <div className="pick-date-and-time-action-btns">
                      <button
                        type="button"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                      >
                        <img src={ChevronLeft} alt="chevronLeft" />
                      </button>
                      <button
                        type="button"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                      >
                        <img src={ChevronRight} alt="chevronRight" />
                      </button>
                    </div>
                  </div>
                )}
              />
            )}
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
                maxWidth: '184px',
                textWrap: 'wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          </div>
        </div>

        <div className="filter-action-buttons">
          <div className="clear-filter-button" onClick={clearFilters}>
            Clear All
          </div>
          <CustomButton
            variant="primary"
            className="filter-apply-button"
            onClick={applyFilters}
            disabled={
              (selectedTags.length === 0 && dateFilterValue === null) ||
              isLoading
            }
            loading={isLoading}
          >
            Apply
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ProspectFilterModal;
