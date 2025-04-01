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

  function getInitials(firstName, lastName) {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return firstInitial + lastInitial;
  }

  const getMetaData = async () => {
    const element = document.getElementById('react-root');

    if (element && element.style.display === 'none') {
      return;
    }

    if (!chrome?.storage?.local) {
      return;
    }
    const metaData = (await mailboxInstance.getMetaData()).payload;

    if (metaData) {
      localStorage.setItem(
        'isEmailTrackerEnabled',
        metaData?.isEmailTrackerEnabled,
      );
      localStorage.setItem(
        'isTrackingNotificationEnabled',
        metaData?.isTrackingNotificationEnabled,
      );
      localStorage.setItem('leadFinderCredits', metaData?.leadFinderCredits);

      localStorage.setItem('userEmail', metaData?.user?.email);

      localStorage.setItem(
        'nameInitials',
        getInitials(metaData?.user?.firstName, metaData?.user?.lastName),
      );

      localStorage.setItem('firstName', metaData?.user?.firstName);
      localStorage.setItem('lastName', metaData?.user?.lastName);
    }
  };

  const authCheck = () => {
    const element = document.getElementById('react-root');

    const authenticationToken = element?.getAttribute('authToken');

    let checkFurther = true;

    setShowProfilePage(showProfilePageState);
    setShowProfilePageState(false);

    const logoutTriggered = localStorage.getItem('logoutTriggered');

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
      } else {
        setIsSaleshandyLoggedIn(false);
      }
    }
  };

  const pageCheck = () => {
    const element = document.getElementById('react-root');
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
    getMetaData();
  }, []);

  if (!isSaleshandyLoggedIn) {
    return <Login />;
  }

  if (showProfilePage) {
    return <Profile />;
  }

  if (isSingleViewActive) {
    // return 'Hare Krishna';
    return <CommonSearchPeople />;
  }

  if (isBulkPagViewActive) {
    return 'Hare Ramma';
  }

  if (isBulkViewActive) {
    return 'Hanuman';
  }

  if (isFeatureAvailable) {
    return <NotAvailableFeature />;
  }

  if (isCommonPeopleScreenActive) {
    return <CommonSearchPeople />;
  }

  if (isCommonSearchScreenActive) {
    return <CommonSearch />;
  }
};

export default Main;
