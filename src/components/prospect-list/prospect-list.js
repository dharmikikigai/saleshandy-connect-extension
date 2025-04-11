/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './prospect-list.css';

import minusIcon from '../../assets/icons/minus.svg';
import shConnectLogo from '../../assets/icons/shConnectLogo.svg';
import diamondIcon from '../../assets/icons/diamond.svg';
import dotsVerticalIcon from '../../assets/icons/dotsVertical.svg';
import email from '../../assets/icons/email.svg';
import emailPhone from '../../assets/icons/emailPhone.svg';
import send from '../../assets/icons/send.svg';
import chevronDown from '../../assets/icons/chevronDown.svg';
import chevronUp from '../../assets/icons/chevronUp.svg';
import mail from '../../assets/icons/mail.svg';
import phoneSignal from '../../assets/icons/phoneSignal.svg';
import alertCircle from '../../assets/icons/alertCircle.svg';
import checkbox from '../../assets/icons/checkbox.svg';
import checkboxChecked from '../../assets/icons/checkboxChecked.svg';
import circleCheck from '../../assets/icons/circleCheck.svg';
import tagIcon from '../../assets/icons/tag.svg';

import SkeletonLoading from '../skeleton-loading/skeleton-loading';
import prospectsInstance from '../../config/server/finder/prospects';
import AddTagsModal from './add-tags';
import AddToSequenceModal from './add-to-sequence-modal';

const CustomButton = ({
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
      {loading ? <div className="spinner" /> : children}
    </button>
  );
};

// const tempProspects = [
//   {
//     id: 7501604371,
//     status: 'complete',
//     name: 'Deepansh Pahuja',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
//     links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
//     linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
//     emails: ['desaleshandy.com', 'gmail.com'],
//     phones: [{ number: '637698XXXX', is_premium: true }],
//     first_name: 'Deepansh',
//     last_name: 'Pahuja',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti I create impactful functions and experiences. My designs prioriti',
//   },
//   {
//     id: 542018412,
//     status: 'complete',
//     name: 'Prabhav Dogra',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/b89027d5bc662183904015695f6eb73d',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/prabhav-dogra',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/prabhav-dogra',
//     emails: [
//       {
//         email: 'prabhav.dogra.something@blinkit.com',
//         smtp_valid: 'valid',
//         type: 'professional',
//         last_validation_check: '2025-04-10',
//         grade: 'A-',
//       },
//       {
//         email: 'prabhav.dogra.somethingelse@blinkit.com',
//         smtp_valid: 'valid',
//         type: 'professional',
//         last_validation_check: '2025-04-10',
//         grade: 'A-',
//       },
//     ],
//     phones: [],
//     first_name: 'Prabhav',
//     last_name: 'Dogra',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: true,
//     revealType: 'email',
//     isCreditRefunded: false,
//     contactId: 39741876,
//     prospectStatus: 1,
//     isProspectCreated: true,
//     tags: [],
//     sequences: [],
//     description: 'SDE II@Blinkit',
//   },
//   {
//     id: 3882926612,
//     status: 'complete',
//     name: 'Harsh Vaghela',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     emails: [],
//     phones: [{ number: '951041XXXX', is_premium: true }],
//     first_name: 'Harsh',
//     last_name: 'Vaghela',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     name: 'Deepansh Pahuja',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
//     links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
//     linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
//     first_name: 'Deepansh',
//     last_name: 'Pahuja',
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 3882926614,
//     status: 'complete',
//     name: 'Harsh Vaghela',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
//     phones: [],
//     first_name: 'Harsh',
//     last_name: 'Vaghela',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 7501604375,
//     status: 'complete',
//     name: 'Deepansh Pahuja',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
//     links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
//     linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
//     emails: [],
//     phones: [],
//     first_name: 'Deepansh',
//     last_name: 'Pahuja',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 3882926616,
//     status: 'complete',
//     name: 'Harsh Vaghela',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
//     phones: [{ number: '951041XXXX', is_premium: true }],
//     first_name: 'Harsh',
//     last_name: 'Vaghela',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 7501604377,
//     status: 'complete',
//     name: 'Deepansh Pahuja',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
//     links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
//     linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
//     emails: ['saleshandy.com', 'gmail.com'],
//     phones: [{ number: '637698XXXX', is_premium: true }],
//     first_name: 'Deepansh',
//     last_name: 'Pahuja',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 3882926618,
//     status: 'complete',
//     name: 'Harsh Vaghela',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
//     phones: [{ number: '951041XXXX', is_premium: true }],
//     first_name: 'Harsh',
//     last_name: 'Vaghela',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 7501604379,
//     status: 'complete',
//     name: 'Deepansh Pahuja',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/4b17b7e6f78051176a7d1f6e55f57f3a',
//     links: { linkedin: 'https://www.linkedin.com/in/deepansh-pahuja' },
//     linkedin_url: 'https://www.linkedin.com/in/deepansh-pahuja',
//     emails: ['saleshandy.com', 'gmail.com'],
//     phones: [{ number: '637698XXXX', is_premium: true }],
//     first_name: 'Deepansh',
//     last_name: 'Pahuja',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
//   {
//     id: 3882926620,
//     status: 'complete',
//     name: 'Harsh Vaghela',
//     profile_pic:
//       'https://d2gjqh9j26unp0.cloudfront.net/profilepic/9302db1315d528ba22648637787a30cd',
//     links: {
//       linkedin: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     },
//     linkedin_url: 'https://www.linkedin.com/in/harsh-vaghela-169059201',
//     emails: ['saleshandy.com', 'gmail.com', 'ikigai.co.in'],
//     phones: [{ number: '951041XXXX', is_premium: true }],
//     first_name: 'Harsh',
//     last_name: 'Vaghela',
//     isRevealed: true,
//     isRevealing: false,
//     reReveal: false,
//     revealType: null,
//     contactId: null,
//     isProspectCreated: false,
//     description:
//       'I create impactful functions and experiences. My designs prioriti..',
//   },
// ];

const tempBulkInfo = {
  oldurl: 'https://www.linkedin.com/company/letsblinkit/people/',
  people: [
    {
      description: 'SDEI@ Blinkit',
      firstname: 'Pranjal',
      lastname: 'Mishra',
      logo:
        'https://media.licdn.com/dms/image/v2/C4E03AQG-rzxr8YtM0w/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1623038589430?e=1749686400&v=beta&t=O52_Kx1dfjL0x-TOuJlYcETzVS_zjWnpSHBgfCyupS4',
      name: 'Pranjal Mishra',
      source_id: '907177006',
      source_id_2: 'pranjal-mishra-83a98a213',
    },
    {
      description: "Software Developer | Blinkit | IIT Kgp' 23",
      firstname: 'Ekansh',
      lastname: 'Jain',
      logo:
        'https://media.licdn.com/dms/image/v2/D5603AQFdj3Ew7JI--A/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1703931476765?e=1749686400&v=beta&t=-VZxpPEN8L4hc23x7wlGq8T_kY_PM6zQV87MgvnR9PU',
      name: 'Ekansh Jain',
      source_id: '702810098',
      source_id_2: 'ekansh-jain-982452177',
    },
    {
      description: 'Product @ Swish | Prev Blinkit',
      firstname: 'Pranav',
      lastname: 'Sharma',
      logo:
        'https://media.licdn.com/dms/image/v2/D5603AQFS_qIc8B0auA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1707728573099?e=1749686400&v=beta&t=sipcAbLtf8Acp74AOFY967JAIkkhQeuEEDUGVRJj_ec',
      name: 'Pranav Sharma',
      source_id: '783986355',
      source_id_2: 'pranav-sharma-nsut',
    },
    {
      description: 'SWE at Blinkit',
      firstname: 'Tushar',
      lastname: 'Singh',
      logo:
        'https://media.licdn.com/dms/image/v2/C4D03AQE7JAs9yjCHNg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1662950208681?e=1749686400&v=beta&t=Ksk7Ri_BJma1hM3kYhft1EyhgHPODp2zto8hPStj_u8',
      name: 'Tushar Singh',
      source_id: '650860457',
      source_id_2: 'thatfedupguy',
    },
    {
      description: 'SDE -2 @ Blinkit | ex-Razorpay',
      firstname: 'Arpit',
      lastname: 'Mishra',
      logo:
        'https://media.licdn.com/dms/image/v2/D5603AQE6kqiLd9WKSg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1726320766819?e=1749686400&v=beta&t=yUQ4Wxn5brN4DekxW1t8w8NCs3LUzzcSV2sLeOybruo',
      name: 'Arpit Mishra',
      source_id: '582977193',
      source_id_2: 'mishrrag',
    },
    {
      description: 'Building Seller Hub at Blinkit | Engineering Manager',
      firstname: 'Sahil',
      lastname: 'Jain',
      logo:
        'https://media.licdn.com/dms/image/v2/D4D03AQFwueNMJD7pjw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1665750967997?e=1749686400&v=beta&t=cpKCuCwBBOTDQCb0cbJqv5zXLuoFtVGijttown7WGFg',
      name: 'Sahil Jain',
      source_id: '522783743',
      source_id_2: 'iam-sahil',
    },
    {
      description:
        "Building Bistro @BlinkIt || 2 x ICPC Regionalist '24 '22 || Expert@Codeforces || Guardian@Leetcode",
      firstname: 'Vikas',
      lastname: 'Kumar Sharma',
      logo:
        'https://media.licdn.com/dms/image/v2/D5603AQEBNCcf_0RNpg/profile-displayphoto-shrink_100_100/B56ZXgdpdaGoAU-/0/1743227625069?e=1749686400&v=beta&t=y_yiOyGJc_QIzbWLc5lnxpdXwJE4APgCaFcV38nSEqA',
      name: 'Vikas Kumar Sharma',
      source_id: '959714640',
      source_id_2: 'vikaskumarsharma2005',
    },
    {
      description: 'HR executive',
      firstname: 'Ashish',
      lastname: 'Sharma',
      logo:
        'https://media.licdn.com/dms/image/v2/D4E35AQEj4V-sZ4-D_g/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1715757920543?e=1744786800&v=beta&t=XUW-gT0ndFwIPg6phHXAlogcaHLAV9Cv6uJe8rMmbWY',
      name: 'Ashish Sharma',
      source_id: '1166379500',
      source_id_2: 'ashish-sharma-178750286',
    },
    {
      description: 'SDE 2 at Blinkit',
      firstname: 'Nikhil',
      lastname: 'Kumar',
      logo:
        'https://media.licdn.com/dms/image/v2/D5603AQGvSq6WgKFszg/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1710153884522?e=1749686400&v=beta&t=ppUfCVYtjxQBlO0C6EyXLEtBNCgXuu2W6Nrs0YfETeE',
      name: 'Nikhil Kumar',
      source_id: '755921429',
      source_id_2: 'nikhilkmtnk28',
    },
    {
      description: 'Area Manager - Gujarat',
      firstname: 'Anil',
      lastname: 'Gupta',
      logo:
        'https://media.licdn.com/dms/image/v2/D4D35AQFct1vrrjL3kw/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1695060894235?e=1744786800&v=beta&t=2A9E29TT3IgbNO7EbmnlBPELQGA7Sv5aDUyH1hTZCUk',
      name: 'Anil Gupta',
      source_id: '574195191',
      source_id_2: 'anil-gupta-a73368140',
    },
  ],
};

// const sequenceOptionLabels = [
//   {
//     label: 'Recent Sequences',
//     options: [
//       { value: 'sequence_2', label: 'Another Sequence', status: 1 },
//       { value: 'sequence_3', label: 'Sequence 3', status: 2 },
//       // Add more if needed
//     ],
//   },
//   {
//     value: 'abhishek_first',
//     label: "Abhishek's First Sequence 🚀 (Current Sequence)",
//     status: 3,
//   },
//   { value: 'sequence_2', label: 'Another Sequence' },
// ];

// const stepOptions = [
//   { value: 'step_1', label: 'Step 1: Email' },
//   { value: 'step_2', label: 'Step 2: Follow-up' },
// ];

// const tagOptions = [
//   { value: 'tag1', label: 'Tag 1' },
//   { value: 'tag2', label: 'Tag 2' },
//   { value: 'tag3', label: 'Tag 3' },
// ];

const BULK_ACTION_TIMEOUT = 7000;
const MAX_POLLING_LIMIT = 20;

const ProspectList = () => {
  // const [isLoading, setIsLoading] = useState(true);
  const [prospects, setProspects] = useState([]);

  const [activeTab, setActiveTab] = useState('leads');
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRevealType, setSelectedRevealType] = useState('email');
  const [expendedProspect, setExpendedProspect] = useState(null);
  const [revealingProspects, setRevealingProspects] = useState({});
  const [revealProspectLoading, setRevealProspectLoading] = useState({
    ignore: false,
    apply: false,
    save: false,
  });

  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [isFirstPollRequest, setIsFirstPollRequest] = useState(true);
  const pollingAttemptsRef = useRef(0);

  const [showAddToSequenceModal, setShowAddToSequenceModal] = useState(false);

  const [isAgency, setIsAgency] = useState(false);

  const selectableProspects = prospects.filter(
    (prospect) => prospect.id && !prospect.isRevealing,
  );

  const isAllEmailRevealed = selectableProspects.every(
    (prospect) => prospect.isRevealed,
  );

  const isAllEmailPhoneRevealed = selectableProspects.every(
    (prospect) => prospect.isRevealed && !prospect.reReveal,
  );

  console.log('selectedTags', selectedTags);

  const setProspectsData = (data, rawData) => {
    if (
      data.payload &&
      data.payload.profiles &&
      data.payload.profiles.length > 0
    ) {
      console.log('rawData', rawData);
      const prospectsData = rawData.map((item) => {
        const prospect = data.payload.profiles.find(
          (profile) =>
            profile.linkedin_url ===
            `https://www.linkedin.com/in/${item.source_id_2}`,
        );
        console.log('prospect', prospect);
        if (prospect) {
          return {
            ...prospect,
            description: item.description,
            logo: item.logo,
          };
        }
        return item;
      });
      setProspects(prospectsData);
    }
  };

  const fetchProspects = async () => {
    // const bulkInfo = chrome.storage.local.get(['bulkInfo']);
    const bulkInfo = tempBulkInfo.people;
    if (bulkInfo && bulkInfo.length > 0) {
      const linkedinUrls = bulkInfo.map(
        (item) => `https://www.linkedin.com/in/${item.source_id_2}`,
      );
      const payload = {
        start: 1,
        take: linkedinUrls.length,
        link: linkedinUrls,
      };
      console.log('payload', payload);
      const response = await prospectsInstance.getProspects(payload);
      console.log('response', response);
      setProspectsData(response, bulkInfo);
    }
  };

  const handleApplyTags = async () => {
    const tagIds = [];
    const newTags = [];

    selectedTags.forEach((tag) => {
      // eslint-disable-next-line no-underscore-dangle
      if (tag.__isNew__) {
        newTags.push(tag.value);
      } else {
        tagIds.push(tag.value);
      }
    });

    const payload = {
      leadIds: selectedProspects,
      revealType: selectedRevealType,
      tagIds,
      newTags,
    };
    console.log('payload', payload);
    setRevealProspectLoading({
      ignore: false,
      apply: true,
      save: false,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        // if (bulkRevealRes?.payload?.shouldPoll) {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        console.log('newRevealingProspects', newRevealingProspects);
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
        // }
        console.log(
          'success',
          message ||
            'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
        );
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setSelectedTags([]);
    setShowTagsModal(false);
  };

  const handleIgnoreTags = async () => {
    const payload = {
      leadIds: selectedProspects,
      revealType: selectedRevealType,
    };
    console.log('payload', payload);
    setRevealProspectLoading({
      ignore: true,
      apply: false,
      save: false,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        // if (bulkRevealRes?.payload?.shouldPoll) {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        console.log('newRevealingProspects', newRevealingProspects);
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
        // }
        console.log(
          'success',
          message ||
            'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
        );
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setSelectedTags([]);
    setShowTagsModal(false);
  };

  const handleAddToSequence = async (data) => {
    console.log('handleAddToSequence', data);
    const payload = {
      leadIds: selectedProspects,
      revealType: 'email',
      tagIds: data.tagIds,
      newTags: data.newTags,
      sequenceId: data.sequenceId,
      stepId: data.stepId,
    };
    console.log('payload', payload);
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: true,
    });
    const bulkRevealRes = await prospectsInstance.bulkRevealProspects(payload);
    if (bulkRevealRes) {
      const { message, status } = bulkRevealRes.payload;
      if (status === 0) {
        console.log('error', message);
      } else if (status === 2) {
        console.log('warning', message);
      } else {
        // if (bulkRevealRes?.payload?.shouldPoll) {
        const newRevealingProspects = {
          ...revealingProspects,
          ...Object.fromEntries(selectedProspects.map((id) => [id, true])),
        };
        console.log('newRevealingProspects', newRevealingProspects);
        setRevealingProspects(newRevealingProspects);
        setIsPollingEnabled(true);
        // }
        console.log(
          'success',
          message ||
            'Bulk reveal for leads are started. This can take few moments, You will be notified once the process is completed. ',
        );
      }
    }
    setRevealProspectLoading({
      ignore: false,
      apply: false,
      save: false,
    });
    setSelectedProspects([]);
    setShowAddToSequenceModal(false);
  };

  const handleViewContact = (type) => {
    setSelectedRevealType(type);
    setShowTagsModal(true);
  };

  const handleFetchLead = async () => {
    const allRevealingProspectIds = Object.keys(revealingProspects)
      .filter((id) => revealingProspects[id] === true)
      .map(Number);
    console.log('allRevealingProspectIds', allRevealingProspectIds);
    const payload = {
      leadIds: allRevealingProspectIds,
      revealType: selectedRevealType,
      isBulkAction: true,
    };
    console.log('payload', payload);
    const response = await prospectsInstance.leadStatus(payload);
    if (
      response &&
      response.payload &&
      response.payload.profiles &&
      response.payload.profiles.length > 0
    ) {
      const updatedRevealingProspects = { ...revealingProspects };
      const updatedProspects = [...prospects];
      response.payload.profiles.forEach((profile) => {
        if (profile.isRevealed && !profile.isRevealing) {
          updatedRevealingProspects[profile.id] = false;
          const prospectIndex = updatedProspects.findIndex(
            (p) => p.id === profile.id,
          );
          if (prospectIndex !== -1) {
            updatedProspects[prospectIndex] = profile;
          }
        }
      });
      const remainingProspects = Object.keys(updatedRevealingProspects).filter(
        (id) => updatedRevealingProspects[id],
      );
      if (remainingProspects.length > 0) {
        setRevealingProspects(updatedRevealingProspects);
        setProspects(updatedProspects);
      } else {
        setIsPollingEnabled(false);
      }
    }
  };

  const refreshProspects = async () => {
    console.log('revealingProspects', revealingProspects);
    const linkedinUrls = [];
    Object.keys(revealingProspects).forEach((id) => {
      // Convert id to number for comparison if prospects have numeric IDs
      const prospect = prospects.find(
        (p) => p.id === Number(id) || p.id === id,
      );
      if (prospect) {
        linkedinUrls.push(prospect.linkedin_url);
      }
    });
    console.log('linkedinUrls', linkedinUrls);
    if (linkedinUrls.length > 0) {
      const payload = {
        start: 1,
        take: linkedinUrls.length,
        link: linkedinUrls,
      };
      const response = await prospectsInstance.getProspects(payload);
      console.log('response', response);
      setRevealingProspects({});
      const updatedProspects = [...prospects];
      response.payload.profiles.forEach((profile) => {
        const prospectIndex = updatedProspects.findIndex(
          (p) => p.id === profile.id,
        );
        if (prospectIndex !== -1) {
          updatedProspects[prospectIndex] = profile;
        }
      });
      setProspects(updatedProspects);
    }
  };

  useEffect(() => {
    fetchProspects();
    setIsAgency(true);
    // setMetaData();  TODO for header
  }, []);

  // Add effect to handle body scroll lock
  useEffect(() => {
    if (showTagsModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showTagsModal]);

  useEffect(() => {
    console.log('isPollingEnabled', isPollingEnabled);
    let intervalId = null;

    if (isPollingEnabled) {
      intervalId = setInterval(() => {
        pollingAttemptsRef.current++;
        if (pollingAttemptsRef.current >= MAX_POLLING_LIMIT) {
          setIsPollingEnabled(false);
        }
        const shouldContinuePolling =
          isFirstPollRequest || pollingAttemptsRef.current < MAX_POLLING_LIMIT;

        if (shouldContinuePolling) {
          handleFetchLead();
        }
      }, BULK_ACTION_TIMEOUT);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPollingEnabled, revealingProspects]);

  // Separate useEffect for handling polling completion
  useEffect(() => {
    if (!isPollingEnabled && pollingAttemptsRef.current > 0) {
      // Only refresh prospects when polling is actually stopped
      refreshProspects();
      setIsFirstPollRequest(true);
      pollingAttemptsRef.current = 0;
    }
  }, [isPollingEnabled]);

  const toggleProspectSelection = (prospectId) => {
    setSelectedProspects((prev) =>
      prev.includes(prospectId)
        ? prev.filter((id) => id !== prospectId)
        : [...prev, prospectId],
    );
  };

  const toggleAllProspectsSelection = () => {
    setSelectedProspects(
      selectedProspects.length === selectableProspects.length
        ? []
        : selectableProspects.map((prospect) => prospect.id),
    );
  };

  const loading = false;

  const getProspectHeaderSkeleton = () => (
    <div className="prospect-list-header">
      <div className="prospect-list-header-title">
        <SkeletonLoading width={60} height={16} />
      </div>
      <div className="prospect-list-header-actions">
        <SkeletonLoading width={50} height={20} borderRadius={2} />
        <SkeletonLoading width={16} height={16} borderRadius={2} />
        <img src={minusIcon} alt="minus" />
      </div>
    </div>
  );

  const getProspectTabsSkeleton = () => (
    <div className="prospect-tabs prospect-tabs-skeleton">
      <SkeletonLoading width={54} height={16} />
      <SkeletonLoading width={54} height={16} />
    </div>
  );

  const getProspectListItemsSkeleton = () => (
    <div className="prospect-list-items-container prospect-list-items-container-skeleton">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="prospect-item" key={index}>
          <SkeletonLoading width={16} height={16} borderRadius={2} />
          <div className="prospect-item-info">
            <div className="prospect-image">
              <SkeletonLoading width={32} height={32} circle />
            </div>
            <div className="prospect-item-details">
              <SkeletonLoading width={102} height={20} />
              <SkeletonLoading width={176} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getProspectDescription = (prospect) => {
    if (!prospect.id || (prospect.isRevealed && prospect.emails.length === 0)) {
      return (
        <div className="prospect-email-unavailable">
          <img
            className="prospect-email-unavailable-icon"
            src={mail}
            alt="email"
          />
          <span className="prospect-email-unavailable-text">
            Email unavailable
          </span>
          <div className="tooltip-container">
            <img src={alertCircle} alt="alert" />
            <div className="custom-tooltip tooltip-bottom">
              Email is not available your
              <br />
              credit is refunded
            </div>
          </div>
        </div>
      );
    }
    if (prospect.isRevealed && prospect.emails.length > 0) {
      return (
        <div className="prospect-description-revealed">
          <img src={mail} alt="email" />
          <span className="prospect-description-revealed-email">
            {prospect.emails[0].email}
          </span>
          <img src={circleCheck} alt="circle-check" />
        </div>
      );
    }
    return (
      <div className="prospect-description">
        <span>{prospect.description}</span>
      </div>
    );
  };

  const getViewContactButton = (type) => (
    <div className="tooltip-container">
      <CustomButton
        variant={type === 'email' ? 'primary' : 'outline'}
        className={type === 'email' ? 'action-button' : 'action-icon-button'}
        onClick={() => handleViewContact(type)}
        disabled={selectedProspects.length === 0}
      >
        <img src={type === 'email' ? email : emailPhone} alt="email" />
        {type === 'email' ? 'View Email' : ''}
      </CustomButton>
      <div className="custom-tooltip tooltip-bottom">
        {type === 'email' ? (
          '1 Credit Required for each'
        ) : (
          <>
            View Email + Phone:
            <br />
            2 Credit Required
            <br />
            for each
          </>
        )}
      </div>
    </div>
  );

  const getAddToSequenceButton = (isExpanded = false) => (
    <CustomButton
      variant="outline"
      className={isExpanded ? 'action-button' : 'action-icon-button'}
      disabled={selectedProspects.length === 0}
      onClick={() => setShowAddToSequenceModal(true)}
    >
      <img src={send} alt="send" />
      {isExpanded ? 'Sequence' : ''}
    </CustomButton>
  );

  const getTagButton = () => (
    <CustomButton
      variant="outline"
      className="action-icon-button"
      disabled={selectedProspects.length === 0}
    >
      <img src={tagIcon} alt="tag" />
    </CustomButton>
  );

  const getActionButtons = () => {
    console.log('isAllEmailRevealed', isAllEmailRevealed);
    console.log('isAllEmailPhoneRevealed', isAllEmailPhoneRevealed);
    if (isAllEmailRevealed && isAllEmailPhoneRevealed) {
      return (
        <>
          {getAddToSequenceButton('expanded')}
          {getTagButton()}
        </>
      );
    }
    if (isAllEmailRevealed && !isAllEmailPhoneRevealed) {
      return (
        <>
          {getAddToSequenceButton('expanded')}
          {getViewContactButton('emailphone')}
          {getTagButton()}
        </>
      );
    }
    return (
      <>
        {getViewContactButton('email')}
        {getViewContactButton('emailphone')}
        {getAddToSequenceButton()}
      </>
    );
  };

  if (loading) {
    // skeleton ui
    return (
      <div className="prospect-list-container">
        {getProspectHeaderSkeleton()}
        <div className="prospect-tabs-container">
          {getProspectTabsSkeleton()}
          <div className="prospect-tab-actions-skeleton" />
          {getProspectListItemsSkeleton()}
        </div>
      </div>
    );
  }
  // actual ui
  return (
    <>
      <div className="prospect-list-container">
        <div className="prospect-list-header">
          <div className="prospect-list-header-title">
            <img src={shConnectLogo} alt="sh-logo" />
          </div>
          <div className="prospect-list-header-actions">
            <div className="lf-credits-box">
              <img src={diamondIcon} alt="diamond" />
              100
            </div>
            <img src={dotsVerticalIcon} alt="options" />
            <img src={minusIcon} alt="minus" />
          </div>
        </div>
        <div className="prospect-tabs-container">
          {prospects.length === 0 ? (
            <>
              {getProspectTabsSkeleton()}
              <div className="prospect-tab-actions-skeleton" />
              {getProspectListItemsSkeleton()}
            </>
          ) : (
            <>
              <div className="prospect-tabs">
                <div
                  className={`prospect-tab ${
                    activeTab === 'leads' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('leads')}
                >
                  <span>Leads Available</span>
                </div>
                <div
                  className={`prospect-tab ${
                    activeTab === 'saved' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('saved')}
                >
                  <span>Saved</span>
                  <span className="prospect-saved-count">100</span>
                </div>
                <div
                  className={`prospect-tab-highlight ${
                    activeTab === 'leads' ? 'leads' : 'saved'
                  }`}
                />
              </div>
              <div className="prospect-tab-actions">
                <div className="action-checkbox">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleAllProspectsSelection()}
                  >
                    <img
                      src={
                        selectedProspects.length === selectableProspects.length
                          ? checkboxChecked
                          : checkbox
                      }
                      alt="checkbox"
                    />
                  </div>
                  <span>
                    {selectedProspects.length > 0
                      ? selectedProspects.length
                      : 'All'}
                  </span>
                </div>
                <div className="action-divider" />
                {getActionButtons()}
              </div>
              <div className="prospect-list-items-container">
                {prospects.map((prospect, index) => (
                  <div className="prospect-item-container" key={index}>
                    <div
                      className={`prospect-item ${
                        expendedProspect === prospect.id ? 'expanded' : ''
                      }`}
                    >
                      <div className="prospect-item-checkbox">
                        {prospect.isRevealing ||
                        revealingProspects[prospect.id] ? (
                          <div className="spinner" />
                        ) : (
                          <div
                            className={`cursor-pointer ${
                              !prospect.id ? 'checkbox-disabled' : ''
                            }`}
                            {...(prospect.id && {
                              onClick: () =>
                                toggleProspectSelection(prospect.id),
                            })}
                          >
                            <img
                              src={
                                prospect.id &&
                                selectedProspects.includes(prospect.id)
                                  ? checkboxChecked
                                  : checkbox
                              }
                              alt="checkbox"
                            />
                          </div>
                        )}
                      </div>
                      <div className="prospect-item-info">
                        <div className="prospect-image">
                          <img
                            src={
                              prospect.profile_pic
                                ? prospect.profile_pic
                                : prospect.logo
                            }
                            alt="profile"
                          />
                        </div>
                        <div
                          className={`prospect-item-details ${
                            !prospect.id || prospect.isRevealed
                              ? 'prospect-item-details-unavailable'
                              : ''
                          }`}
                        >
                          <div className="prospect-name">
                            <span>{prospect.name}</span>
                            {prospect.id &&
                              (prospect.emails.length > 0 ||
                                prospect.phones.length > 0) && (
                                <div
                                  className="prospect-item-expand-icon"
                                  onClick={() =>
                                    setExpendedProspect(
                                      expendedProspect === prospect.id
                                        ? null
                                        : prospect.id,
                                    )
                                  }
                                >
                                  <img
                                    src={
                                      expendedProspect === prospect.id
                                        ? chevronUp
                                        : chevronDown
                                    }
                                    alt="chevron-down"
                                  />
                                </div>
                              )}
                          </div>
                          {getProspectDescription(prospect)}
                        </div>
                      </div>
                    </div>
                    {expendedProspect === prospect.id && (
                      <div className="prospect-item-expanded">
                        {prospect.emails.length > 0 &&
                          (prospect.isRevealed
                            ? prospect.emails.slice(1).map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span className="prospect-description-revealed-email">
                                    {e.email}
                                  </span>
                                  <img src={circleCheck} alt="circle-check" />
                                </div>
                              ))
                            : prospect.emails.map((e, i) => (
                                <div
                                  className="prospect-item-expanded-email"
                                  key={i}
                                >
                                  <img src={mail} alt="email" />
                                  <span>
                                    {e.email ? (
                                      e.email
                                    ) : (
                                      <span className="list-dots">
                                        &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                                        @{e}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )))}
                        {prospect.phones.length > 0 &&
                          prospect.phones.map((phone) => (
                            <div
                              className="prospect-item-expanded-phone"
                              key={phone.number}
                            >
                              <img src={phoneSignal} alt="phone-signal" />
                              <span>
                                {phone?.number?.slice(0, 3)}
                                <span className="list-dots">
                                  &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
                                </span>
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Tags Modal */}
      <AddTagsModal
        showModal={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        selectedTags={selectedTags}
        selectedProspects={selectedProspects}
        setSelectedTags={setSelectedTags}
        onApplyTags={handleApplyTags}
        onIgnoreTags={handleIgnoreTags}
        isLoading={revealProspectLoading}
      />

      <AddToSequenceModal
        showModal={showAddToSequenceModal}
        onClose={() => setShowAddToSequenceModal(false)}
        isAgency={isAgency}
        handleAddToSequence={handleAddToSequence}
        isLoading={revealProspectLoading}
      />
    </>
  );
};

export default ProspectList;
