import React from 'react';

// Enum-like object for ContactStatusType
const ContactStatusType = {
  Active: 'active',
  Inactive: 'inactive',
  Failed: 'failed',
  Replied: 'replied',
  Bounced: 'bounced',
  Unsubscribed: 'unsubscribed',
  Blacklisted: 'blacklisted',
  Paused: 'paused',
  Finished: 'finished',
  Completed: 'completed',
  Waiting: 'waiting',
};

// Display names for each status
const ContactStatusTypeDisplayName = {
  [ContactStatusType.Active]: 'Active',
  [ContactStatusType.Inactive]: 'Inactive',
  [ContactStatusType.Failed]: 'Failed',
  [ContactStatusType.Replied]: 'Replied',
  [ContactStatusType.Bounced]: 'Bounced',
  [ContactStatusType.Unsubscribed]: 'Unsubscribed',
  [ContactStatusType.Blacklisted]: 'Blacklisted',
  [ContactStatusType.Paused]: 'Paused',
  [ContactStatusType.Finished]: 'Finished',
  [ContactStatusType.Completed]: 'Completed',
  [ContactStatusType.Waiting]: 'Waiting',
};

const STATUS_STYLES = {
  [ContactStatusType.Active]: {
    backgroundColor: '#DBEAFE',
  },
  [ContactStatusType.Inactive]: {
    backgroundColor: '#F3f4f6',
  },
  [ContactStatusType.Replied]: {
    backgroundColor: '#D1FAE5',
  },
  [ContactStatusType.Bounced]: {
    backgroundColor: '#FEE2E2',
  },
  [ContactStatusType.Unsubscribed]: {
    backgroundColor: '#FEE2E2',
  },
  [ContactStatusType.Blacklisted]: {
    backgroundColor: '#F3F4F6',
  },
  [ContactStatusType.Paused]: {
    backgroundColor: '#F3F4F6',
  },
  [ContactStatusType.Finished]: {
    backgroundColor: '#EFF6FF',
  },
  [ContactStatusType.Completed]: {
    backgroundColor: '#E0E7FF',
  },
  [ContactStatusType.Waiting]: {
    backgroundColor: '#FFEDD5',
  },
};

const baseStyle = {
  display: 'inline-block',
  padding: '0px 8px',
  borderRadius: '100px',
  fontSize: '12px',
  fontWeight: '400',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  lineHeight: '18px',
  // marginRight: '6px',
  textTransform: 'capitalize',
  color: '1f2937',
};

const ContactStatusTag = ({ status }) => {
  const style = {
    ...baseStyle,
    ...(STATUS_STYLES[status] || {}),
  };

  let capitalizedStatus = ContactStatusTypeDisplayName[status] || '';

  if (capitalizedStatus) {
    capitalizedStatus =
      capitalizedStatus.charAt(0).toUpperCase() + capitalizedStatus.slice(1);
  }

  return <span style={style}>{capitalizedStatus}</span>;
};

export default ContactStatusTag;
