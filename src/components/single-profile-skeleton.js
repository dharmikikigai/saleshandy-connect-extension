import React from 'react';
import SkeletonLoading from './skeleton-loading';
import HeaderSkeleton from './header-skeleton';

const SingleProfileSkeleton = () => (
  <>
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '16px 0px',
      }}
    >
      <HeaderSkeleton />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          marginTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '0px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              gap: '8px',
            }}
          >
            <SkeletonLoading circle width={32} height={32} />

            <span>
              <SkeletonLoading width={102} height={20} />
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div>
              <span>
                <SkeletonLoading width={176.09375} height={16} />
              </span>
            </div>

            <div>
              <span>
                <SkeletonLoading width={154} height={16} />
              </span>
            </div>

            <div>
              <span
                style={{
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
                <SkeletonLoading circle width={16} height={16} />
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
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
            <SkeletonLoading width={300} height={32} baseColor="#F9FAFB" />

            <SkeletonLoading width={300} height={32} baseColor="#F9FAFB" />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0px 16px',
            }}
          >
            {/* Emails */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
              }}
            >
              <SkeletonLoading
                circle
                width={16}
                height={16}
                baseColor="#F9FAFB"
              />

              <span>
                <SkeletonLoading
                  width={176.09375}
                  height={16}
                  baseColor="#F9FAFB"
                />
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <SkeletonLoading
                  circle
                  width={16}
                  height={16}
                  baseColor="#F9FAFB"
                />
                <span>
                  <SkeletonLoading
                    width={176.09375}
                    height={16}
                    baseColor="#F9FAFB"
                  />
                </span>
              </div>
              <div
                style={{
                  borderBottom: '1px solid #F3F4F6',
                }}
              />
              <div>
                <SkeletonLoading width={300} height={32} baseColor="#F9FAFB" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SingleProfileSkeleton;
