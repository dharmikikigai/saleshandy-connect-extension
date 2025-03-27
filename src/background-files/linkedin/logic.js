/*global chrome*/
// todo-dharmik : use constants for external API URLs

const MAIN_PROFILE_INFO = 'com.linkedin.voyager.dash.identity.profile.Profile';
const USER_LOCATION = 'com.linkedin.voyager.common.NormBasicLocation';

const USER_SKILLS = 'com.linkedin.voyager.dash.identity.profile.Skill';

const USER_POSITIONS = 'com.linkedin.voyager.identity.profile.Position';

const SEARCH_PROFILES_IDENT =
  'com.linkedin.voyager.identity.shared.MiniProfile';

const REG_JSON_BLOCKS_P = /<code.+?>([\s\S]+?)<\/code>/gi;
const REG_JSON_BLOCKS = /<code.+?>([\s\S]+?)<\/code>/gi;
const COMPANIES_IDENT = 'com.linkedin.voyager.organization.Company';
const RegPageLang = /<meta\sname="i18nLocale"\scontent="(.*?)">/i;
var csrfToken = false;
var isDefIntP = false;

const REG_EMAILS = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;
var isRecruterIntP = false;
var isSalesNavIntP = false;
var person = {};
// todo-dharmik : remove duplicate declaration
var csrfToken = false;
var current_tab_url = null;

function currentCompany(comp, tabId) {
  function retrieveCompany(tkk, cUrl) {
    chrome.tabs.sendMessage(
      tabId,
      {
        method: 'getPersonData',
        tk: tkk,
        url: cUrl,
      },
      function (response) {
        if (!chrome.runtime.lastError) {
          if (csrfToken) {
            if (response && response.data) {
              var resp = JSON.parse(response.data);
            }
          } else {
            if (response && response.data) {
              var resp = response.data
                .replace(/&quot;/gi, '"')
                .replace(/&#92;/gi, '\\');
            }
          }
          if (isRecruterIntP) {
          } else {
            if (isSalesNavIntP) {
            } else {
              var company = getCompanyInfo(resp);
              chrome.storage.local.set(
                { companyLink: company.url },
                function () {},
              );
            }
          }

          if (company && company.name && company.source_id) {
            void 0;
            person.currentCompanyInfo = company;
          }
        }
      },
    );
  }

  if (comp.source_id) {
    if (isRecruterIntP) {
      var cUrl = 'https://www.linkedin.com/recruiter/company/' + comp.source_id;
      retrieveCompany(null, cUrl);
    } else {
      if (isSalesNavIntP) {
        chrome.storage.local.get(['csrfToken'], function (request) {
          if (request.csrfToken) {
            csrfToken = true;
            var cUrl =
              'https://www.linkedin.com/sales-api/salesApiCompanies/' +
              comp.source_id;
            cUrl +=
              '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
            retrieveCompany(request.csrfToken, cUrl);
          } else {
            var cUrl =
              'https://www.linkedin.com/sales/accounts/insights?companyId=' +
              comp.source_id;
            retrieveCompany(null, cUrl);
          }
        });
      } else {
        chrome.storage.local.get(['csrfToken'], function (request) {
          if (request.csrfToken) {
            var cUrl =
              'https://www.linkedin.com/voyager/api/organization/companies?' +
              'decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-18&q=universalName&universalName=' +
              comp.source_id;
            retrieveCompany(request.csrfToken, cUrl);
          } else {
            var cUrl =
              'https://www.linkedin.com/company/' + comp.source_id + '/';
            retrieveCompany(null, cUrl);
          }
        });
      }
    }
  }
}

function retriveContactdata(id, tabId) {
  function callMiniStep() {
    chrome.tabs.sendMessage(tabId, {
      method: 'getInnerHTML',
    });
  }
  chrome.storage.local.get(['csrfToken'], function (request) {
    if (request.csrfToken) {
      var mUrl = 'https://www.linkedin.com/voyager/api/identity/profiles/' + id;
      mUrl += '/profileContactInfo';
      chrome.tabs.sendMessage(
        tabId,
        {
          method: 'getPersonData',
          tk: request.csrfToken,
          url: mUrl,
        },
        function (response) {
          if (!chrome.runtime.lastError) {
            if (response && response.data) {
              getConInfo(JSON.parse(response.data));
            }
          }
        },
      );
    }
  });
}

function BGActionDo(tab, tabId) {
  chrome.storage.local.get(['csrfToken'], function (request) {
    if (request.csrfToken) {
      let source_id_2 = findDescr_P(tab.url, /in\/(.+?)(\/|$)/i);
      let apiUrl =
        'https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=' +
        source_id_2 +
        '&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-91';
      chrome.tabs.sendMessage(
        tab.id,
        { method: 'getPersonData', tk: request.csrfToken, url: apiUrl },
        function (response) {
          if (!chrome.runtime.lastError) {
            chrome.storage.local.set({ newData: true }, function () {});
            void 0;
            if (response && response.data) {
              person = getUserInfo(JSON.parse(response.data));
            }
            if (person) {
              csrfToken = true;
              if (person.name) {
                if (person.current && person.current.length > 0) {
                  if (person.current[0].source_id === undefined) {
                    chrome.storage.local.set(
                      { personInfo: person },
                      function () {},
                    );
                    chrome.storage.local.set(
                      { companyLink: 'link is undefined' },
                      function () {},
                    );
                  } else {
                    currentCompany(person.current[0], tabId);
                    retriveContactdata(source_id_2, tabId);
                    chrome.storage.local.set(
                      { personInfo: person },
                      function () {},
                    );
                  }
                } else {
                  chrome.storage.local.set(
                    { personInfo: person },
                    function () {},
                  );
                  chrome.storage.local.set(
                    { companyLink: 'NA' },
                    function () {},
                  );
                }
              }
            }
          } else {
            chrome.storage.local.set({ newData: false }, function () {});
          }
        },
      );
    }
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tab.status === 'complete') {
      var currentUrl = tab.url;

      if (currentUrl.includes('linkedin.com/in/')) {
        BGActionDo(tab, activeInfo.tabId);
      }
      chrome.storage.local.set({ activeUrl: tab.url });
    }
  });
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    current_tab_url = tab.url;
    if (current_tab_url.includes('linkedin.com/in/')) {
      BGActionDo(tab, tabId);
    }
    chrome.storage.local.set({ activeUrl: tab.url });
  }
});

function findDescr(source, reg) {
  var sTemp = '';
  var fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    if (fnd[1]) {
      sTemp = fnd[1];
    } else {
      if (fnd[2]) {
        sTemp = fnd[2];
      }
    }

    sTemp = sTemp.trim();
    sTemp = convertHtmlToText(sTemp);
    return sTemp;
  } else {
    return '';
  }
}
function getDataFromPage_P(source) {
  var arData = [];
  while ((matches = REG_JSON_BLOCKS_P.exec(source))) {
    if (matches[1]) {
      var obj = {};
      try {
        obj = JSON.parse(matches[1].trim());
        if (obj && obj.data && obj.included && obj.included.length > 10) {
          arData.push(obj);
        }
      } catch (e) {}
    }
  }
  return arData;
}

function getMasByKey_P(field, data, type, name) {
  for (key in data) {
    if (
      key === field &&
      data[key] === type &&
      (!name || (name && name == data.firstName + ' ' + data.lastName))
    ) {
      this.data = data;
      break;
    } else {
      if (typeof data[key] === 'object' || typeof data[key] === 'array') {
        getMasByKey_P(field, data[key], type, name);
      }
    }
  }
  return this.data;
}

function getAll_P(field, data, type) {
  for (key in data) {
    if (typeof data[key] === 'object' || typeof data[key] === 'array') {
      getAll_P(field, data[key], type);
    } else {
      if (key === field && data[key].indexOf(type) !== -1) {
        this.data.push(data);
      }
    }
  }

  return this.data;
}

function searchEmails(input, emailsOld) {
  input = input.replace(/\s/gi, ' ');

  var emails = input.match(REG_EMAILS);

  if (emails && emails.length > 0) {
    for (var iNo = 0; iNo < emails.length; iNo++) {
      if (emailsOld.indexOf(emails[iNo]) == -1) {
        emailsOld.push(emails[iNo]);
      }
    }
  }

  return emailsOld;
}

function parseEmails(data, linkedinMainInfoArray) {
  var res = [];

  if (linkedinMainInfoArray.summary) {
    res = searchEmails(linkedinMainInfoArray.summary, res);
  }

  if (linkedinMainInfoArray.headline) {
    res = searchEmails(linkedinMainInfoArray.headline, res);
  }

  this.data = [];
  var companies = getAll_P('$type', data, USER_POSITIONS);
  for (key in companies) {
    if (companies[key].description) {
      res = searchEmails(companies[key].description, res);
    }
  }
  this.data = [];
  return res;
}

function parseContactInfo(data, linkedinMainInfoArray) {
  var res = {};

  res.e = parseEmails(data, linkedinMainInfoArray);

  return res;
}

function findDescr_P(source, reg) {
  var sTemp = '';
  var fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    sTemp = fnd[1];
    sTemp = sTemp.trim();
    sTemp = convertHtmlToText(sTemp);
    return sTemp;
  } else {
    return '';
  }
}

function getRSimilarProfile(source) {
  similardata = [];
  if (typeof source === 'object') {
    var similarProfile = source.result.profiles;
    if (similarProfile) {
      $.each(similarProfile, function (index, i) {
        sp = {};
        if (i.fullName && i.fullName !== 'LinkedIn Member') {
          sp.firstname = i.firstName;
          sp.lastname = i.lastName;
          sp.name = i.fullName;
          if (i.industry) {
            sp.industry = i.industry;
          } else {
            if (i.industryName) {
              sp.industry = i.industryName;
            }
          }
          if (i.location) {
            sp.locality = i.location;
          }
          if (i.numConnections) {
            sp.len = i.numConnections;
          }
          if (i.isPremiumSubscriber) {
            sp.loc = i.isPremiumSubscriber;
          }
          sp.sid = i.memberId;
          if (
            i.vectorImage &&
            i.vectorImage.artifacts &&
            i.vectorImage.artifacts.length > 0
          ) {
            sp.logo1 =
              i.vectorImage.rootUrl +
              i.vectorImage.artifacts[i.vectorImage.artifacts.length - 1]
                .fileIdentifyingUrlPathSegment;
          }
          if (i.positions && i.positions.length > 0) {
            sp.positions = [];
            $.each(i.positions, function (index, pi) {
              var job = {};
              if (pi.companyName) {
                job.company_name = pi.companyName;
              }
              if (pi.companyId) {
                job.source_id = pi.companyId;
              }
              if (pi.current) {
                job.current = pi.current;
              }
              if (pi.title) {
                job.position = pi.title;
              }
              if (pi.location) {
                job.location = pi.location;
              }
              if (pi.startDateMonth && pi.startDateYear) {
                var startDate = new Date(pi.startDateYear, pi.startDateMonth);
                if (startDate > 1000) {
                  job.start = startDate / 1000;
                }
              }
              if (pi.endDateMonth && pi.endDateYear) {
                var endDate = new Date(pi.endDateYear, pi.endDateMonth);
                if (endDate > 1000) {
                  job.end = endDate / 1000;
                }
              }
              sp.positions.push(job);
            });
          }
          similardata.push(sp);
        }
      });
    }

    return similardata;
  }
}

function getMiniProfile(source) {
  minidata = [];
  if (typeof source === 'object') {
    var miniProfile = source.elements;
    $.each(miniProfile, function (index, i) {
      mp = {};
      mp.firstname = i.miniProfile.firstName;
      mp.lastname = i.miniProfile.lastName;
      mp.designation1 = i.miniProfile.occupation;
      mp.sid = i.miniProfile.objectUrn.replace('urn:li:member:', '');
      mp.sid2 = i.miniProfile.publicIdentifier;
      mp.b = i.memberBadges.premium == true ? 1 : 0;
      minidata.push(mp);
    });
    return minidata;
  }
}
function getSimilarProfile(source) {
  similardata = [];
  if (typeof source === 'object') {
    var similarProfile = source.elements;
    $.each(similarProfile, function (index, i) {
      sp = {};
      if (i.profileUrnResolutionResult) {
        sp.firstname = i.profileUrnResolutionResult.firstName;
        sp.lastname = i.profileUrnResolutionResult.lastName;
        sp.name = i.profileUrnResolutionResult.fullName;
        if (i.profileUrnResolutionResult.industry) {
          sp.industry = i.profileUrnResolutionResult.industry;
        } else {
          if (i.profileUrnResolutionResult.industryName) {
            sp.industry = i.profileUrnResolutionResult.industryName;
          }
        }
        if (i.profileUrnResolutionResult.location) {
          sp.locality = i.profileUrnResolutionResult.location;
        }
        sp.sid = i.profileUrnResolutionResult.objectUrn.replace(
          'urn:li:member:',
          '',
        );
        if (
          i.profileUrnResolutionResult.profilePictureDisplayImage &&
          i.profileUrnResolutionResult.profilePictureDisplayImage.artifacts &&
          i.profileUrnResolutionResult.profilePictureDisplayImage.artifacts
            .length > 0
        ) {
          sp.logo1 =
            i.profileUrnResolutionResult.profilePictureDisplayImage.artifacts[
              i.profileUrnResolutionResult.profilePictureDisplayImage.artifacts
                .length - 1
            ].fileIdentifyingUrlPathSegment;
        }
        if (
          i.profileUrnResolutionResult.positions &&
          i.profileUrnResolutionResult.positions.length > 0
        ) {
          sp.positions = [];
          $.each(i.profileUrnResolutionResult.positions, function (index, pi) {
            var job = {};
            if (pi.companyName) {
              job.company_name = pi.companyName;
            }
            if (pi.companyUrn) {
              job.source_id = pi.companyUrn.replace(
                'urn:li:fs_salesCompany:',
                '',
              );
            }
            if (pi.current) {
              job.current = pi.current;
            }
            if (pi.title) {
              job.position = pi.title;
            }
            if (pi.location) {
              job.location = pi.location;
            }
            if (pi.startedOn) {
              var startDate = new Date(pi.startedOn.year, pi.startedOn.month);
              if (startDate > 1000) {
                job.start = startDate / 1000;
              }
            }
            if (pi.endedOn) {
              var endDate = new Date(pi.endedOn.year, pi.endedOn.month);
              if (endDate > 1000) {
                job.end = endDate / 1000;
              }
            }
            sp.positions.push(job);
          });
        }
        similardata.push(sp);
      }
    });
    return similardata;
  }
}
function getConInfo(source) {
  sd = {};
  if (typeof source === 'object') {
    var data = source;
    if (data.emailAddress === undefined) {
      chrome.storage.local.set({ emailFromLinkedin: 'notFound' });
    } else {
      chrome.storage.local.set({ emailFromLinkedin: data.emailAddress });
    }
    return sd;
  }
}
function getUserInfo(source) {
  function getLinkedinMainInfoArray(field, data, type, parent) {
    for (key in data) {
      if (
        !linkedinMainInfoArray &&
        key === field &&
        data[key] === type &&
        data.objectUrn
      ) {
        linkedinMainInfoArray = data;
        linkedinPerson = parent;
        return;
        break;
      } else {
        if (typeof data[key] === 'object' || typeof data[key] === 'array') {
          getLinkedinMainInfoArray(field, data[key], type, data);
        }
      }
    }
  }

  function getLinkedinMainInfoArray_old(field, data, type, parent) {
    for (key in data) {
      if (!linkedinMainInfoArray && key === field && data[key] === type) {
        linkedinMainInfoArray = data;
        linkedinPerson = parent;
        return;
        break;
      } else {
        if (typeof data[key] === 'object' || typeof data[key] === 'array') {
          getLinkedinMainInfoArray_old(field, data[key], type, data);
        }
      }
    }
  }

  var data = [];
  var linkedinMainInfoArray;
  var linkedinPerson;
  var user = {};

  if (typeof source === 'object') {
    data = source;
    linkedinMainInfoArray = source.elements[0];
  } else {
    data = getDataFromPage_P(source);

    if (!data || data.length == 0) {
      return undefined;
    }

    getLinkedinMainInfoArray('$type', data, MAIN_PROFILE_INFO, data.parent);

    if (!linkedinMainInfoArray || !linkedinMainInfoArray.firstName) {
      getLinkedinMainInfoArray_old(
        '$type',
        data,
        'com.linkedin.voyager.identity.profile.Profile',
        data.parent,
      );

      if (!linkedinMainInfoArray || !linkedinMainInfoArray.firstName) {
        return undefined;
      }
    }
  }

  var user = {};
  user.source = 'linkedIn';

  user.fullInfo = 1;

  if (linkedinMainInfoArray.firstName) {
    user.firstName = linkedinMainInfoArray.firstName;
    user.name = linkedinMainInfoArray.firstName;
  }
  if (linkedinMainInfoArray.lastName) {
    user.lastName = linkedinMainInfoArray.lastName;
    user.name += ' ' + linkedinMainInfoArray.lastName;
  }
  if (linkedinMainInfoArray.industry && linkedinMainInfoArray.industry.name) {
    user.industry = linkedinMainInfoArray.industry.name;
  } else {
    if (linkedinMainInfoArray.industryName) {
      user.industry = linkedinMainInfoArray.industryName;
    }
  }
  if (linkedinMainInfoArray.locationName) {
    user.locality = linkedinMainInfoArray.locationName;
  } else {
    if (linkedinMainInfoArray.geoLocation) {
      if (linkedinMainInfoArray.geoLocation.geo) {
        if (linkedinMainInfoArray.geoLocation.geo.defaultLocalizedName) {
          user.locality =
            linkedinMainInfoArray.geoLocation.geo.defaultLocalizedName;
        }
      }
    }
  }

  if (linkedinMainInfoArray.entityUrn) {
    user.entityUrn = linkedinMainInfoArray.entityUrn.replace(
      'urn:li:fsd_profile:',
      '',
    );
  }

  if (linkedinMainInfoArray.location) {
    if (linkedinMainInfoArray.location.countryCode) {
      user.country = linkedinMainInfoArray.location.countryCode;
    }
  } else {
    var location = getMasByKey_P('$type', data, USER_LOCATION);
    if (location && location.countryCode) {
      user.country = location.countryCode;
    }
  }

  if (linkedinMainInfoArray.objectUrn) {
    user.source_id = linkedinMainInfoArray.objectUrn.replace(
      'urn:li:member:',
      '',
    );
    if (linkedinMainInfoArray.publicIdentifier) {
      user.source_id_2 = linkedinMainInfoArray.publicIdentifier;
      user.source_page =
        'https://www.linkedin.com/in/' + user.source_id_2 + '/';
    }
  } else {
    if (linkedinMainInfoArray.miniProfile) {
      var miniProfile = getMasByKey_P(
        'entityUrn',
        data,
        linkedinMainInfoArray.miniProfile,
      );
    } else {
      var miniProfile = getMasByKey_P(
        '$type',
        data,
        SEARCH_PROFILES_IDENT,
        user.name,
      );
    }

    if (miniProfile) {
      if (miniProfile.publicIdentifier) {
        user.source_id_2 = miniProfile.publicIdentifier.trim();

        if (user.country) {
          user.source_page =
            'https://' +
            user.country +
            '.linkedin.com/in/' +
            user.source_id_2 +
            '/';
        } else {
          user.source_page =
            'https://www.linkedin.com/in/' + user.source_id_2 + '/';
        }
      }

      if (miniProfile.objectUrn) {
        user.source_id = miniProfile.objectUrn.replace('urn:li:member:', '');
      }
    }
  }

  if (linkedinMainInfoArray.profileSkills) {
    var skills = linkedinMainInfoArray.profileSkills.elements;
  } else {
    this.data = [];
    var skills = getAll_P('$type', data, USER_SKILLS);
  }
  if (skills) {
    user.skills = [];
    for (key in skills) {
      if (skills[key].name) {
        user.skills.push(skills[key].name);
      }
    }
  }

  this.data = [];

  user.current = [];
  user.previous = [];

  var companies = getAll_P('$type', data, USER_POSITIONS);
  if (!companies || (companies && companies.length === 0)) {
    var companies = getAll_P(
      'entityUrn',
      data,
      'urn:li:fsd_profilePosition:(' + user.entityUrn,
    );
  }

  for (company in companies) {
    if (companies[company].companyName) {
      var job = {};
      job.company_name = companies[company].companyName.trim();
      job.position = companies[company].title.trim();
      if (companies[company].locationName) {
        job.location = companies[company].locationName;
      }
      if (companies[company].companyUrn) {
        if (
          companies[company].companyUrn.indexOf('urn:li:fs_miniCompany:') !== -1
        ) {
          job.source_id = companies[company].companyUrn.replace(
            'urn:li:fs_miniCompany:',
            '',
          );
        } else {
          if (
            companies[company].companyUrn.indexOf('urn:li:fsd_company:') !== -1
          ) {
            job.source_id = companies[company].companyUrn.replace(
              'urn:li:fsd_company:',
              '',
            );
          }
        }
      }

      if (companies[company].timePeriod) {
        if (typeof companies[company].timePeriod === 'string') {
          var timedPeriod = getMasByKey_P(
            '$id',
            data,
            companies[company].timePeriod,
          );
        } else {
          var timedPeriod = companies[company].timePeriod;
        }

        if (timedPeriod) {
          if (timedPeriod.$id) {
            var position_id = findDescrByRegEx(
              timedPeriod.$id,
              /(\d+)\),timePeriod/i,
            );
            if (position_id) {
              job.position_id = position_id;
            }
          } else {
            void 0;
          }

          if (timedPeriod.startDate) {
            if (typeof timedPeriod.startDate === 'string') {
              var startBlock = getMasByKey_P(
                '$id',
                data,
                timedPeriod.startDate,
              );
            } else {
              var startBlock = timedPeriod.startDate;
            }
            if (startBlock && startBlock.year) {
              var year = startBlock.year;
              var month = 1;
              if (startBlock.month) {
                month = startBlock.month;
              }
              var startDate = new Date(year, month - 1, 1);
              if (startDate > 1000) {
                job.start = startDate / 1000;
              }
            }
          }

          if (timedPeriod.endDate) {
            if (typeof timedPeriod.endDate === 'string') {
              var endBlock = getMasByKey_P('$id', data, timedPeriod.endDate);
            } else {
              var endBlock = timedPeriod.endDate;
            }
            if (endBlock && endBlock.year) {
              var year = endBlock.year;
              var month = 1;
              if (endBlock.month) {
                month = endBlock.month;
              }
              var endDate = new Date(year, month - 1, 1);
              if (endDate > 1000) {
                job.end = endDate / 1000;
              }
            }

            user.previous.push(job);
          } else {
            user.current.push(job);
          }
        }
      } else {
        if (companies[company].dateRange) {
          let dateRange = companies[company].dateRange;
          if (dateRange.start) {
            var year = dateRange.start.year;
            var month = 1;
            if (dateRange.start.month) {
              month = dateRange.start.month;
            }
            var startDate = new Date(year, month - 1, 1);
            if (startDate > 1000) {
              job.start = startDate / 1000;
            }
          }
          if (dateRange.end) {
            var year = dateRange.end.year;
            var month = 1;
            if (dateRange.end.month) {
              month = dateRange.end.month;
            }
            var endDate = new Date(year, month - 1, 1);
            if (endDate > 1000) {
              job.end = endDate / 1000;
            }

            user.previous.push(job);
          } else {
            user.current.push(job);
          }
        } else {
          user.current.push(job);
        }
      }
    }
  }
  if (user.current.length > 0 && user.previous.length > 0) {
    for (var iCurrentNo = 0; iCurrentNo < user.current.length; iCurrentNo++) {
      if (!user.current[iCurrentNo].source_id) {
        for (
          var iPreviousNo = 0;
          iPreviousNo < user.previous.length;
          iPreviousNo++
        ) {
          if (
            user.current[iCurrentNo].company_name ===
            user.previous[iPreviousNo].company_name
          ) {
            user.current[iCurrentNo].source_id =
              user.previous[iPreviousNo].source_id;
            break;
          }
        }
      }
    }
  }

  user.cInfo = parseContactInfo(data, linkedinMainInfoArray);

  return user;
}

function convertHtmlToText(inputText) {
  var returnText = inputText;
  if (returnText) {
    returnText = returnText.replace(/<br>/gi, '\n');
    returnText = returnText.replace(/<br\s\/>/gi, '\n');
    returnText = returnText.replace(/<br\/>/gi, '\n');

    returnText = returnText.replace(/ +(?= )/g, '');

    returnText = returnText.replace(/&nbsp;/gi, ' ');
    returnText = returnText.replace(/&amp;/gi, '&');
    returnText = returnText.replace(/&quot;/gi, '"');
    returnText = returnText.replace(/&lt;/gi, '<');
    returnText = returnText.replace(/&gt;/gi, '>');

    returnText = returnText.replace(/<.*?>/gi, '');
    returnText = returnText.replace(/%20/gi, ' ');
  }

  return returnText;
}

function getDataFromPage(source) {
  var arData = [];
  while ((matches = REG_JSON_BLOCKS.exec(source))) {
    if (matches[1]) {
      var obj = {};
      try {
        obj = JSON.parse(matches[1].trim());
        if (obj) {
          arData.push(obj);
        } else {
          obj = matches[1].trim();
        }
      } catch (e) {}
    }
  }
  return arData;
}

function getMasByKey(field, data, type) {
  for (key in data) {
    if (key === field && data[key] === type) {
      this.data = data;
    } else {
      if (typeof data[key] === 'object' || typeof data[key] === 'array') {
        getMasByKey(field, data[key], type);
      }
    }
  }

  return this.data;
}

function getAll(field, data, type) {
  for (key in data) {
    if (key === field && data[key] === type) {
      this.data.push(data);
    } else {
      if (typeof data[key] === 'object' || typeof data[key] === 'array') {
        getAll(field, data[key], type);
      }
    }
  }

  return this.data;
}

function getCompanySizeCode(staffCount) {
  if (staffCount >= 10001) {
    return 'I';
  } else if (staffCount >= 5001 && staffCount < 10001) {
    return 'H';
  } else if (staffCount < 5001 && staffCount >= 1001) {
    return 'G';
  } else if (staffCount >= 501 && staffCount < 1001) {
    return 'F';
  } else if (staffCount >= 201 && staffCount < 501) {
    return 'E';
  } else if (staffCount >= 51 && staffCount < 201) {
    return 'D';
  } else if (staffCount >= 11 && staffCount < 51) {
    return 'C';
  } else if (staffCount < 11 && staffCount >= 1) {
    return 'B';
  } else {
    return 'A';
  }
}

function getCompanyInfo(source) {
  var data = [];

  if (typeof source === 'object' && source.elements && source.elements[0]) {
    data = source;
    var company = source.elements[0];
  } else {
    if (typeof source === 'object' && source.included) {
      data = source.included;
    } else {
      source = source.replace(/&quot;/gi, '"').replace(/&#92;/gi, '\\');
      data = getDataFromPage(source);
    }
  }

  if (!data || data.length == 0) {
    return undefined;
  }

  if (!company) {
    var company = {};

    this.data = [];
    var companies = getAll('$type', data, COMPANIES_IDENT);
    if (!companies) {
      return undefined;
    }

    for (key in companies) {
      if (companies[key].staffCount || companies[key].companyPageUrl) {
        company = companies[key];
        break;
      }
    }
  }

  if (!company) {
    return undefined;
  }

  var result = {};

  result.name = company.name;

  if (company.companyPageUrl) {
    result.url = company.companyPageUrl;
  }

  if (company.description) {
    var description = company.description.replace('\n', ' ');
  }

  if (company.companyIndustries && company.companyIndustries[0]) {
    result.industry = company.companyIndustries[0].localizedName;
  } else {
    if (company.industries && company.industries[0]) {
      result.industry = company.industries[0];
    }
  }

  if (company.companyType && company.companyType.localizedName) {
    result.type = company.companyType.localizedName;
  } else {
    if (company.type) {
      result.type = company.type;
    }
  }

  if (company.specialities) {
    result.comp_tags = company.specialities;
  }

  if (company.foundedOn) {
    if (typeof company.foundedOn == 'object') {
      var founded = company.foundedOn;
    } else {
      var founded = getMasByKey('$id', data, company.foundedOn);
    }

    if (founded && founded.year) {
      result.founded = founded.year;
    }
  }

  if (company.entityUrn) {
    result.source_id = company.entityUrn.replace(
      'urn:li:fs_normalized_company:',
      '',
    );
  }

  if (result.source_id) {
    result.source_page = 'https://www.linkedin.com/company/' + result.source_id;
  }

  if (company.universalName) {
    result.source_id_2 = company.universalName;
  }

  if (company.staffCount) {
    result.size = getCompanySizeCode(company.staffCount);
    result.scount = company.staffCount;
  }

  if (company.companyPageUrl) {
    company.companyPageUrl = company.domainUrl;
  }

  if (company.headquarter) {
    if (typeof company.headquarter === 'object') {
      result.headquarter = company.headquarter;
    } else {
      result.headquarter = getMasByKey('$id', data, company.headquarter);
    }
  }
  if (company.confirmedLocations) {
    result.confirmedLocations = company.confirmedLocations;
  }

  result.source = 'linkedIn';

  return result;
}

function findDescr_C(source, reg) {
  var sTemp = '';
  var fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    sTemp = fnd[1];
    sTemp = sTemp.trim();
    sTemp = convertHtmlToText(sTemp);
    return sTemp;
  } else {
    return '';
  }
}

function companyaddsearch(source_id) {
  function retriveCompany(tkk, cUrl) {
    chrome.tabs.query({ active: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          method: 'getPersonData',
          tk: tkk,
          url: cUrl,
        },
        function (response) {
          if (csrfToken) {
            var resp = JSON.parse(response.data);
          } else {
            var resp = response
              .replace(/&quot;/gi, '"')
              .replace(/&#92;/gi, '\\');
          }
          if (isRecruterIntP) {
          } else {
            if (isSalesNavIntP) {
            } else {
              var company = getCompanyInfo(resp);
            }
          }

          if (company && company.name && company.source_id) {
            void 0;

            var dt =
              'cp=' +
              encodeURIComponent(convertHtmlToText(JSON.stringify(company)));
            $.post(MainHost() + '/check-data/', dt, function (response) {});
          }
        },
      );
    });
  }
  if (source_id) {
    if (isRecruterIntP) {
      var cUrl = 'https://www.linkedin.com/recruiter/company/' + comp.source_id;
      retriveCompany(cUrl);
    } else {
      if (isSalesNavIntP) {
        chrome.storage.local.get(['csrfToken'], function (request) {
          if (request.csrfToken) {
            var cUrl =
              'https://www.linkedin.com/sales-api/salesApiCompanies/' +
              comp.source_id;
            // todo-dharmik : use decoded URLs
            cUrl +=
              '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';

            $.ajaxSetup({
              headers: {
                'csrf-token': request.csrfToken,
                'x-restli-protocol-version': '2.0.0',
              },
              global: false,
              type: 'GET',
            });
            retriveCompany(cUrl);
          } else {
            var cUrl =
              'https://www.linkedin.com/sales/accounts/insights?companyId=' +
              comp.source_id;
            retriveCompany(cUrl);
          }
        });
      } else {
        chrome.storage.local.get(['csrfToken'], function (request) {
          if (request.csrfToken) {
            csrfToken = true;
            var cUrl =
              'https://www.linkedin.com/voyager/api/organization/companies?' +
              'decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-18&q=universalName&universalName=' +
              source_id;
            retriveCompany(request.csrfToken, cUrl);
          } else {
            var cUrl = 'https://www.linkedin.com/company/' + source_id + '/';
            retriveCompany(null, cUrl);
          }
        });
      }
    }
  }
}
