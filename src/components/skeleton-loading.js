import React from 'react';
import './skeleton-loading.css';

const SkeletonLoading = ({
  baseColor = '#F3F4F6',
  highlightColor = '#E2E4E8',
  width = 50,
  height = 14,
  borderRadius = 4,
  circle = false,
}) => {
  const style = {};
  if (typeof width === 'string' || typeof width === 'number')
    style.width = width;
  if (typeof height === 'string' || typeof height === 'number')
    style.height = height;
  if (typeof borderRadius === 'string' || typeof borderRadius === 'number')
    style.borderRadius = borderRadius;
  if (circle) style.borderRadius = '50%';
  if (typeof baseColor !== 'undefined') style['--base-color'] = baseColor;
  if (typeof highlightColor !== 'undefined')
    style['--highlight-color'] = highlightColor;

  return <span className="skeleton-loading" style={style} />;
};

export default SkeletonLoading;
