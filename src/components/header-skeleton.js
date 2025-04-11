/* eslint-disable no-unused-vars */
import React from 'react';
import Main from './main';
import SkeletonLoading from './skeleton-loading';

const handleClose = () => {
  const element = document.getElementById('react-root');
  if (element) {
    element.style.display = 'none';
  }
};

const HeaderSkeleton = () => (
  <>
    <div
      className="d-flex"
      style={{
        width: '100%',
        minHeight: '32px',
        alignItems: 'baseline',
        borderBottom: '1px solid #E5E7EB',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SkeletonLoading width={50} height={16} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SkeletonLoading width={50} height={20} />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SkeletonLoading width={16} height={16} />
          </div>

          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={handleClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                // fill-rule="evenodd"
                // clip-rule="evenodd"
                d="M2.66699 8.00065C2.66699 7.63246 2.96547 7.33398 3.33366 7.33398H12.667C13.0352 7.33398 13.3337 7.63246 13.3337 8.00065C13.3337 8.36884 13.0352 8.66732 12.667 8.66732H3.33366C2.96547 8.66732 2.66699 8.36884 2.66699 8.00065Z"
                fill="#6B7280"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </>
);

export default HeaderSkeleton;
