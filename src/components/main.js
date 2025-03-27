/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Login from './login';
import Header from './header';
import Profile from './profile';
import CommonSearch from './common-search';
import CommonSearchPeople from './common-search-people';
import NoResult from './no-result';
import NotAvailableFeature from './feature-na';
import prospectsInstance from '../config/server/finder/prospects';

const Main = () => {
  const [isSaleshandyLoggedIn, setIsSaleshandyLoggedIn] = useState(false);
  // const [authToken, setAuthToken] = useState('');
  const [isSingleViewActive, setIsSingleViewActive] = useState(false);
  const [isBulkPagViewActive, setIsBulkPagViewActive] = useState(false);
  const [isBulkViewActive, setIsBulkViewActive] = useState(false);
  const [isNoResultFound, setIsNoResultFound] = useState(false);
  const [isFeatureAvailable, setIsFeatureAvailable] = useState(false);
  const [isCommonSearchScreenActive, setIsCommonSearchScreenActive] = useState(
    false,
  );
  const [isCommonPeopleScreenActive, setIsCommonPeopleScreenActive] = useState(
    false,
  );

  const authCheck = () => {
    const element = document.getElementById('react-root');

    const authenticationToken = element?.getAttribute('authToken');

    if (
      authenticationToken !== undefined &&
      authenticationToken !== null &&
      authenticationToken !== ''
    ) {
      setIsSaleshandyLoggedIn(true);
      // setAuthToken(authenticationToken);
    } else {
      setIsSaleshandyLoggedIn(false);
    }
  };

  const fetchMetaData = async () => {
    const prospectFields = (await prospectsInstance.getProspectsFields())
      .payload;
    console.log(prospectFields, 'prospectFields');
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
    console.log('Inside React App');
    // fetchMetaData();
  }, []);

  if (!isSaleshandyLoggedIn) {
    return (
      <div
        style={{
          backgroundColor: '#DCE1FE',
          height: '686px',
          width: '332px',
        }}
      >
        <Login />
      </div>
    );
  }

  return (
    <>
      <Profile />
    </>
  );
};

export default Main;
