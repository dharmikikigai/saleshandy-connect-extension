import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Login from './login';
import Profile from './profile';
import CommonSearch from './common-search';
import CommonSearchPeople from './common-search-people';
import NotAvailableFeature from './feature-na';
import { profilePageState } from './state';
import mailboxInstance from '../config/server/tracker/mailbox';

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
    const element = document.getElementById('saleshandy-window');

    if (element && element.style.display === 'none') {
      return;
    }

    if (!chrome?.storage?.local) {
      return;
    }

    const metaData = (await mailboxInstance.getMetaData())?.payload;

    if (metaData) {
      chrome.storage.local.set({ saleshandyMetaData: metaData });

      if (metaData.user?.isAgency) {
        console.log('isAgency');
        setIsFeatureAvailable(true);
      }
    }
  };

  const authCheck = () => {
    const element = document.getElementById('saleshandy-window');

    const authenticationToken = element?.getAttribute('authToken');

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
  };

  const pageCheck = () => {
    const element = document.getElementById('saleshandy-window');
    const activeUrl = element?.getAttribute('activeUrl');

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
    // return 'Hare Krishna';
    return <CommonSearchPeople />;
  }

  if (isBulkPagViewActive) {
    // return 'Hare Ramma';
    return <CommonSearchPeople />;
  }

  if (isBulkViewActive) {
    // return 'Hanuman';
    return <CommonSearchPeople />;
  }

  if (isCommonPeopleScreenActive) {
    return <CommonSearchPeople />;
  }

  if (isCommonSearchScreenActive) {
    return <CommonSearch />;
  }
};

export default Main;
