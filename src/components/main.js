import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Login from './login';
import Profile from './profile';
import CommonSearch from './common-search';
import CommonSearchPeople from './common-search-people';
import NotAvailableFeature from './feature-na';
import { profilePageState } from './state';
import mailboxInstance from '../config/server/tracker/mailbox';
import SingleProfile from './single-profile';
import ProspectList from './prospect-list/prospect-list';

const Main = () => {
  const [isSaleshandyLoggedIn, setIsSaleshandyLoggedIn] = useState(false);
  const [isSingleViewActive, setIsSingleViewActive] = useState(false);
  const [isBulkPagViewActive, setIsBulkPagViewActive] = useState(false);
  const [isBulkViewActive, setIsBulkViewActive] = useState(false);
  const [isFeatureAvailable, setIsFeatureAvailable] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [isCommonSearchScreenActive, setIsCommonSearchScreenActive] = useState(
    false,
  );
  const [isCommonPeopleScreenActive, setIsCommonPeopleScreenActive] = useState(
    false,
  );
  const [showProfilePageState, setShowProfilePageState] = useRecoilState(
    profilePageState,
  );

  const getMetaData = async () => {
    if (!chrome?.storage?.local) {
      return;
    }

    chrome.storage.local.get(['saleshandyMetaData'], async (result) => {
      const saleshandyMetaData = result?.saleshandyMetaData;

      if (saleshandyMetaData || saleshandyMetaData?.user) {
        return;
      }

      const metaData = (await mailboxInstance.getMetaData())?.payload;

      if (metaData) {
        chrome.storage.local.set({ saleshandyMetaData: metaData });

        if (metaData.user?.isUserRestricted) {
          setIsFeatureAvailable(true);
        }
      }
    });
  };

  const authCheck = () => {
    chrome.storage.local.get(['authToken'], (result1) => {
      const authenticationToken = result1?.authToken;

      console.log('authToken', authenticationToken);

      let checkFurther = true;

      setShowProfilePage(showProfilePageState);
      setShowProfilePageState(false);

      chrome.storage.local.get(['logoutTriggered'], (result) => {
        const logoutTriggered = result?.logoutTriggered;

        if (logoutTriggered && logoutTriggered === 'true') {
          setIsSaleshandyLoggedIn(false);
          checkFurther = false;
        }

        if (checkFurther) {
          if (
            authenticationToken !== undefined &&
            authenticationToken !== null &&
            authenticationToken !== ''
          ) {
            setIsSaleshandyLoggedIn(true);
            getMetaData();
          } else {
            setIsSaleshandyLoggedIn(false);
          }
        }
      });
    });
  };

  const pageCheck = () => {
    chrome.storage.local.get(['activeUrl'], (result) => {
      const activeUrl = result?.activeUrl;

      console.log('activeUrl', activeUrl);

      if (!activeUrl || activeUrl === '') {
        setIsCommonSearchScreenActive(true);
        setIsSingleViewActive(false);
        setIsBulkPagViewActive(false);
        setIsBulkViewActive(false);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(false);
      } else if (activeUrl.includes('linkedin.com/in/')) {
        setIsCommonSearchScreenActive(false);
        setIsSingleViewActive(true);
        setIsBulkPagViewActive(false);
        setIsBulkViewActive(false);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(false);
      } else if (activeUrl.includes('linkedin.com/search/results/people/')) {
        setIsCommonSearchScreenActive(false);
        setIsSingleViewActive(false);
        setIsBulkPagViewActive(true);
        setIsBulkViewActive(false);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(false);
      } else if (
        activeUrl.includes('linkedin.com/company/') &&
        activeUrl.includes('/people')
      ) {
        setIsCommonSearchScreenActive(false);
        setIsSingleViewActive(false);
        setIsBulkPagViewActive(false);
        setIsBulkViewActive(true);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(false);
      } else if (activeUrl.includes('linkedin.com/search/results/all')) {
        setIsCommonSearchScreenActive(false);
        setIsSingleViewActive(false);
        setIsBulkPagViewActive(false);
        setIsBulkViewActive(false);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(true);
      } else {
        setIsCommonSearchScreenActive(true);
        setIsSingleViewActive(false);
        setIsBulkPagViewActive(false);
        setIsBulkViewActive(false);
        setIsFeatureAvailable(false);
        setIsCommonPeopleScreenActive(false);
      }
    });
  };

  useEffect(() => {
    authCheck();
    pageCheck();
  }, []);

  if (!isSaleshandyLoggedIn) {
    return <Login />;
  }

  if (showProfilePage) {
    return <Profile />;
  }

  if (isFeatureAvailable) {
    return <NotAvailableFeature />;
  }

  if (isSingleViewActive) {
    return <SingleProfile />;
  }

  if (isBulkPagViewActive || isBulkViewActive) {
    return <ProspectList />;
  }

  if (isCommonPeopleScreenActive) {
    return <CommonSearchPeople />;
  }

  if (isCommonSearchScreenActive) {
    return <CommonSearch />;
  }
};

export default Main;
