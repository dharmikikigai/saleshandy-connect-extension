import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { DateTime } from 'luxon';
import { CustomButton } from './add-tags';
import cross from '../../assets/icons/cross.svg';
import prospectsInstance from '../../config/server/finder/prospects';

export const getCurrentTimeInUTC = () => DateTime.local();

export const DateFilter = {
  YESTERDAY: 'Yesterday',
  TODAY: 'Today',
  LAST_WEEK: 'The last week',
  THIS_WEEK: 'This week',
  LAST_MONTH: 'The last month',
  THIS_MONTH: 'This month',
  LAST_YEAR: 'The last year',
  THIS_YEAR: 'This year',
};
export const dateFilterOptions = [
  {
    value: 'Today',
    label: 'Today',
  },
  {
    value: 'Yesterday',
    label: 'Yesterday',
  },
  {
    value: 'last week',
    label: 'last week',
  },
  {
    value: 'This week',
    label: 'This week',
  },
  {
    value: 'last month',
    label: 'last month',
  },
  {
    value: 'This month',
    label: 'This month',
  },
  {
    value: 'last year',
    label: 'last year',
  },
  {
    value: 'This year',
    label: 'This year',
  },
  {
    value: 'Custom',
    label: 'Custom',
  },
];

const ProspectFilterModal = ({
  showModal,
  onClose,
  selectedTags,
  setSelectedTags,
  dateFilterValue,
  setDateFilterValue,
  applyFilters,
  clearFilters,
}) => {
  const [tagOptions, setTagOptions] = useState([]);

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

  useEffect(() => {
    if (showModal) {
      fetchTags();
    }
  }, [showModal]);

  return (
    <div className={`custom-modal-overlay ${showModal ? 'show' : ''}`}>
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">Add Tags</h3>
          <button
            type="button"
            className="custom-modal-close"
            onClick={onClose}
          >
            <img src={cross} alt="close" />
          </button>
        </div>
        <div className="custom-modal-body">
          <div className="filter-section-container">
            <div className="prospect-filter">
              <span>Tags</span>
              <Select
                isMulti
                options={tagOptions}
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Select Tags"
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
            </div>
            <div className="prospect-filter">
              <span>Date</span>
              <Select
                options={dateFilterOptions}
                value={dateFilterValue}
                onChange={setDateFilterValue}
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
            </div>
          </div>

          <div className="filter-action-buttons">
            <div className="clear-filter-button" onClick={clearFilters}>
              Clear All
            </div>
            <CustomButton
              variant="primary"
              className="action-button filter-apply-button"
              onClick={applyFilters}
              disabled={selectedTags.length === 0 || dateFilterValue === null}
            >
              Apply
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectFilterModal;
