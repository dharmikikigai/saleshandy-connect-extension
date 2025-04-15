import React from 'react';

// Enum-like object for ContactStatusType
const ContactStatusType = {
  Active: 1,
  Paused: 2,
  Replied: 3,
  Unsubscribed: 4,
  Finished: 5,
  BlackListed: 6,
  Bounced: 7,
  Opened: 8,
};

// Display names for each status
const ContactStatusTypeDisplayName = {
  [ContactStatusType.Active]: 'Active',
  [ContactStatusType.Paused]: 'Paused',
  [ContactStatusType.Replied]: 'Replied',
  [ContactStatusType.Unsubscribed]: 'Unsubscribed',
  [ContactStatusType.Finished]: 'Finished',
  [ContactStatusType.BlackListed]: 'Blacklisted',
  [ContactStatusType.Bounced]: 'Bounced',
  [ContactStatusType.Opened]: 'Opened',
};

const STATUS_STYLES = {
  [ContactStatusType.Active]: {
    backgroundColor: '#DBEAFE',
  },
  [ContactStatusType.Paused]: {
    backgroundColor: '#F3F4F6',
  },
  [ContactStatusType.Replied]: {
    backgroundColor: '#D1FAE5',
  },
  [ContactStatusType.Unsubscribed]: {
    backgroundColor: '#FEE2E2',
  },
  [ContactStatusType.Finished]: {
    backgroundColor: '#EFF6FF',
  },
  [ContactStatusType.BlackListed]: {
    backgroundColor: '#F3F4F6',
  },
  [ContactStatusType.Bounced]: {
    backgroundColor: '#FEE2E2',
  },
  [ContactStatusType.Opened]: {
    backgroundColor: '#E0E7FF',
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
