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
import SingleProfileSkeleton from './single-profile-skeleton';
import Toaster from './toaster';

import './prospect-list/prospect-list.css';

const VIEW_TYPES = {
  LOADING: 'LOADING',
  LOGIN: 'LOGIN',
  PROFILE: 'PROFILE',
  FEATURE_NA: 'FEATURE_NA',
  SINGLE_PROFILE: 'SINGLE_PROFILE',
  PROSPECT_LIST: 'PROSPECT_LIST',
  COMMON_SEARCH_PEOPLE: 'COMMON_SEARCH_PEOPLE',
  COMMON_SEARCH: 'COMMON_SEARCH',
};

const Main = () => {
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [pageCheckLoading, setPageCheckLoading] = useState(true);
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
  const [userMetaData, setUserMetaData] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW_TYPES.LOADING);
  const [isMetaDataLoaded, setIsMetaDataLoaded] = useState(false);

  // Toaster state
  const [showToaster, setShowToaster] = useState(false);
  const [toasterData, setToasterData] = useState({
    header: '',
    body: '',
    type: 'danger',
  });

  const getMetaData = async () => {
    if (!chrome?.storage?.local) {
      setIsMetaDataLoaded(true);
      return;
    }

    try {
      const response = await mailboxInstance.getMetaData();

      if (response?.error) {
        setToasterData({
          header: 'Error',
          body:
            response?.error?.message ||
            'Failed to fetch user metadata. Please try again later.',
          type: 'danger',
        });
        setShowToaster(true);
        setIsMetaDataLoaded(true);
        return;
      }

      const metaData = response?.payload;

      if (metaData) {
        chrome.storage.local.set({ saleshandyMetaData: metaData });
        setUserMetaData(metaData);

        if (metaData.user?.isUserRestricted) {
          setIsFeatureAvailable(true);
        }
      }
      setIsMetaDataLoaded(true);
    } catch (error) {
      setToasterData({
        header: 'Error',
        body: 'An unexpected error occurred while fetching metadata.',
        type: 'danger',
      });
      setShowToaster(true);
      console.error('Error fetching metadata:', error);
      setIsMetaDataLoaded(true);
    }
  };

  const authCheck = () => {
    chrome.storage.local.get(['authToken'], (result1) => {
      const authenticationToken = result1?.authToken;

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
            setIsMetaDataLoaded(true);
          }
        }
      });

      setAuthCheckLoading(false);
    });
  };

  const pageCheck = () => {
    chrome.storage.local.get(['activeUrl'], (result) => {
      const activeUrl = result?.activeUrl;

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

      setPageCheckLoading(false);
    });
  };

  useEffect(() => {
    authCheck();
    pageCheck();
  }, []);

  useEffect(() => {
    if (!authCheckLoading && !pageCheckLoading && isMetaDataLoaded) {
      if (!isSaleshandyLoggedIn) {
        setCurrentView(VIEW_TYPES.LOGIN);
      } else if (showProfilePage) {
        setCurrentView(VIEW_TYPES.PROFILE);
      } else if (isFeatureAvailable) {
        setCurrentView(VIEW_TYPES.FEATURE_NA);
      } else if (isSingleViewActive) {
        setCurrentView(VIEW_TYPES.SINGLE_PROFILE);
      } else if (isBulkPagViewActive || isBulkViewActive) {
        setCurrentView(VIEW_TYPES.PROSPECT_LIST);
      } else if (isCommonPeopleScreenActive) {
        setCurrentView(VIEW_TYPES.COMMON_SEARCH_PEOPLE);
      } else if (isCommonSearchScreenActive) {
        setCurrentView(VIEW_TYPES.COMMON_SEARCH);
      }
    }
  }, [
    authCheckLoading,
    pageCheckLoading,
    isMetaDataLoaded,
    isSaleshandyLoggedIn,
    showProfilePage,
    isFeatureAvailable,
    isSingleViewActive,
    isBulkPagViewActive,
    isBulkViewActive,
    isCommonPeopleScreenActive,
    isCommonSearchScreenActive,
  ]);

  const renderContent = () => {
    switch (currentView) {
      case VIEW_TYPES.LOADING:
        return <SingleProfileSkeleton />;
      case VIEW_TYPES.LOGIN:
        return <Login />;
      case VIEW_TYPES.PROFILE:
        return <Profile />;
      case VIEW_TYPES.FEATURE_NA:
        return <NotAvailableFeature />;
      case VIEW_TYPES.SINGLE_PROFILE:
        return <SingleProfile userMetaData={userMetaData} />;
      case VIEW_TYPES.PROSPECT_LIST:
        return (
          <ProspectList
            pageType={isBulkPagViewActive ? 'pagination' : 'continuous'}
            userMetaData={userMetaData}
          />
        );
      case VIEW_TYPES.COMMON_SEARCH_PEOPLE:
        return <CommonSearchPeople />;
      case VIEW_TYPES.COMMON_SEARCH:
        return <CommonSearch />;
      default:
        return <SingleProfileSkeleton />;
    }
  };

  return (
    <>
      {showToaster && (
        <Toaster
          header={toasterData.header}
          body={toasterData.body}
          type={toasterData.type}
          onClose={() => setShowToaster(false)}
        />
      )}
      {renderContent()}
    </>
  );
};

export default Main;
