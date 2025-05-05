import React, { useEffect, useState } from 'react';
import { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import cross from '../../assets/icons/cross.svg';
import prospectsInstance from '../../config/server/finder/prospects';

export const CustomButton = ({
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
      {loading ? (
        <div
          className={`spinner ${variant === 'primary' ? 'spinner-white' : ''}`}
        />
      ) : (
        children
      )}
    </button>
  );
};

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

const AddTagsModal = ({
  showModal,
  onClose,
  selectedTags,
  selectedProspects,
  setSelectedTags,
  onApplyTags,
  onIgnoreTags,
  isLoading,
  revealType,
  isTagsModalForRevealedProspects,
}) => {
  const [tagOptions, setTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

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
      // Keep using fallback tags if API call fails
    } finally {
      setIsLoadingTags(false);
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
        <div
          className={`custom-modal-body ${
            isTagsModalForRevealedProspects ? 'revealed-tag-modal-body' : ''
          }`}
        >
          {!isTagsModalForRevealedProspects && (
            <span>
              Apply a tag before disclosing emails
              {revealType === 'emailphone' ? ' & phone ' : ' '}for{' '}
              {selectedProspects.length} leads; this will assist you in locating
              them later.
            </span>
          )}
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <CreatableSelect
              isMulti
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Enter a tag"
              isLoading={isLoadingTags}
              components={{
                MultiValueRemove: CustomMultiValueRemove,
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  border: state.isFocused
                    ? '1px solid #1d4ed8'
                    : '1px solid #d1d5db',
                  boxShadow: 'none',
                  borderRadius: '4px',
                  '&:hover': {
                    borderColor: 'none',
                  },
                  cursor: 'pointer',
                  minHeight: '34px',
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
                  backgroundColor: state.isFocused ? '#eff6ff' : 'transparent',
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
          </div>
        </div>
        <div className="custom-modal-footer">
          {!isTagsModalForRevealedProspects && (
            <CustomButton
              variant="outline"
              className="ignore-button"
              onClick={onIgnoreTags}
              disabled={
                isLoading.ignore ||
                isLoading.apply ||
                selectedProspects.length === 0
              }
              loading={isLoading.ignore}
            >
              Ignore
            </CustomButton>
          )}
          <CustomButton
            variant="primary"
            className="action-button"
            onClick={onApplyTags}
            disabled={
              selectedTags.length === 0 ||
              isLoading.ignore ||
              isLoading.apply ||
              selectedProspects.length === 0
            }
            loading={isLoading.apply}
          >
            Apply
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddTagsModal;
