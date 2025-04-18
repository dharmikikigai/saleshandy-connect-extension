import React, { useEffect, useState } from 'react';
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
                  height: '14px',
                  width: '14px',
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
              disabled={isLoading.ignore || isLoading.apply}
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
              selectedTags.length === 0 || isLoading.ignore || isLoading.apply
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
