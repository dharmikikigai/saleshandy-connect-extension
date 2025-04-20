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

  // Toaster state
  const [showToaster, setShowToaster] = useState(false);
  const [toasterData, setToasterData] = useState({
    header: '',
    body: '',
    type: 'danger',
  });

  const getMetaData = async () => {
    if (!chrome?.storage?.local) {
      return;
    }

    try {
      const response = await mailboxInstance.getMetaData();

      if (response?.error) {
        // Show error toast
        setToasterData({
          header: 'Error',
          body:
            response?.error?.message ||
            'Failed to fetch user metadata. Please try again later.',
          type: 'danger',
        });
        setShowToaster(true);
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
    } catch (error) {
      // Show error toast for any exception
      setToasterData({
        header: 'Error',
        body: 'An unexpected error occurred while fetching metadata.',
        type: 'danger',
      });
      setShowToaster(true);
      console.error('Error fetching metadata:', error);
    }
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

      setAuthCheckLoading(false);
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

      setPageCheckLoading(false);
    });
  };

  useEffect(() => {
    authCheck();
    pageCheck();
  }, []);

  if (authCheckLoading || pageCheckLoading) {
    return <SingleProfileSkeleton />;
  }

  if (!isSaleshandyLoggedIn) {
    return <Login />;
  }

  if (showProfilePage) {
    return <Profile />;
  }

  if (isFeatureAvailable) {
    return <NotAvailableFeature />;
  }

  // Render the appropriate component based on the current state
  let componentToRender;

  if (isSingleViewActive) {
    componentToRender = <SingleProfile userMetaData={userMetaData} />;
  } else if (isBulkPagViewActive || isBulkViewActive) {
    componentToRender = (
      <ProspectList
        pageType={isBulkPagViewActive ? 'pagination' : 'continuous'}
        userMetaData={userMetaData}
      />
    );
  } else if (isCommonPeopleScreenActive) {
    componentToRender = <CommonSearchPeople />;
  } else if (isCommonSearchScreenActive) {
    componentToRender = <CommonSearch />;
  }

  // Return the component with the toaster
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
      {componentToRender}
    </>
  );
};

export default Main;
