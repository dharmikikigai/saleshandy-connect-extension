/* eslint-disable no-loop-func */
/* eslint-disable no-use-before-define */
/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable valid-typeof */
const MAIN_PROFILE_INFO = 'com.linkedin.voyager.dash.identity.profile.Profile';
const USER_LOCATION = 'com.linkedin.voyager.common.NormBasicLocation';

const USER_SKILLS = 'com.linkedin.voyager.dash.identity.profile.Skill';
const REG_DETECT_LANG = /<meta name="i18nLocale" content="(.+)"/i;

const USER_POSITIONS = 'com.linkedin.voyager.identity.profile.Position';
const REG_EMAILS_P_S2 = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

const SEARCH_PROFILES_IDENT =
  'com.linkedin.voyager.identity.shared.MiniProfile';

const REG_JSON_BLOCKS_P = /<code.+?>([\s\S]+?)<\/code>/gi;
const REG_JSON_BLOCKS = /<code.+?>([\s\S]+?)<\/code>/gi;
const COMPANIES_IDENT = 'com.linkedin.voyager.organization.Company';
let csrfToken = false;
const regGooglePersonSourceId2 = /in\/(.+)/i;
const regPersonId2Parse = /(.+)\?miniProfileUrn*/i;
const REG_JSON_BLOCKS2_P_S2 = /<code.+?>([\s\S]+?)<\/code>/gi;

const REG_EMAILS = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;
const isRecruterIntP = false;
const isSalesNavIntP = false;
let person = {};
let currentTabUrl = null;
let isPre = false;
let isGraph = false;

function getPeopleSSP(source) {
  const people = [];
  const peopledata = [];
  function getPeopleDataV(elements) {
    for (elem in elements) {
      profile = elements[elem];
      const person1 = {};
      person1.source = 'linkedIn';

      if (profile.firstName) {
        person1.firstname = convertHtmlToText(profile.firstName);
      }
      if (profile.lastName) {
        person1.lastname = convertHtmlToText(profile.lastName);
      }
      if (profile.fullName) {
        person1.name = convertHtmlToText(profile.fullName);
      }
      if (profile.geoRegion) {
        person1.locality = profile.geoRegion;
      }

      person1.positions = [];
      if (profile.currentPositions) {
        profile.currentPositions.forEach((pi) => {
          const job = {};
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
            const startDate = new Date(pi.startedOn.year, pi.startedOn.month);
            if (startDate > 1000) {
              job.start = startDate / 1000;
            }
          }
          if (pi.endedOn) {
            const endDate = new Date(pi.endedOn.year, pi.endedOn.month);
            if (endDate > 1000) {
              job.end = endDate / 1000;
            }
          }
          person1.positions.push(job);
        });
      }

      if (profile.objectUrn) {
        person1.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
        person1.sid = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
      }
      if (profile.premium) {
        person1.loc = 1;
      }
      if (profile.entityUrn) {
        person1.searchLink = `https://www.linkedin.com/sales/people/${profile.entityUrn
          .replace('urn:li:fs_salesProfile:(', '')
          .replace(')', '')}`;
      }

      if (
        profile.profilePictureDisplayImage &&
        profile.profilePictureDisplayImage.artifacts
      ) {
        for (
          let iNo = 0;
          iNo < profile.profilePictureDisplayImage.artifacts.length;
          iNo++
        ) {
          if ((profile.profilePictureDisplayImage.artifacts[iNo].width = 100)) {
            person1.logo =
              profile.profilePictureDisplayImage.artifacts[
                iNo
              ].fileIdentifyingUrlPathSegment;
          }
          if ((profile.profilePictureDisplayImage.artifacts[iNo].width = 800)) {
            person1.logo1 =
              profile.profilePictureDisplayImage.artifacts[
                iNo
              ].fileIdentifyingUrlPathSegment;
          }
        }
        if (
          !person1.logo &&
          profile.profilePictureDisplayImage.artifacts &&
          profile.profilePictureDisplayImage.artifacts.length > 0
        ) {
          person1.logo =
            profile.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment;
        }
        if (person1.logo && profile.profilePictureDisplayImage.rootUrl) {
          person1.logo =
            profile.profilePictureDisplayImage.rootUrl + person1.logo;
          person1.logo1 =
            profile.profilePictureDisplayImage.rootUrl + person1.logo1;
        }
      }

      peopledata.push(person1);
    }
  }
  function getPeopleList(elements) {
    for (elem in elements) {
      profile = elements[elem];
      const person2 = {};
      person2.source = 'linkedIn';

      if (profile.firstName) {
        person2.firstName = convertHtmlToText(profile.firstName);
      }
      if (profile.lastName) {
        person2.lastName = convertHtmlToText(profile.lastName);
      }
      if (profile.fullName) {
        person2.name = convertHtmlToText(profile.fullName);
      }
      if (profile.currentPositions && profile.currentPositions.length > 0) {
        if (profile.currentPositions[0].title) {
          person2.description = profile.currentPositions[0].title;
        }
      }
      if (profile.objectUrn) {
        person2.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
      }

      if (profile.entityUrn) {
        person2.searchLink = `https://www.linkedin.com/sales/people/${profile.entityUrn
          .replace('urn:li:fs_salesProfile:(', '')
          .replace(')', '')}`;
      }

      if (
        profile.profilePictureDisplayImage &&
        profile.profilePictureDisplayImage.artifacts
      ) {
        for (
          let iNo = 0;
          iNo < profile.profilePictureDisplayImage.artifacts.length;
          iNo++
        ) {
          if ((profile.profilePictureDisplayImage.artifacts[iNo].width = 100)) {
            person2.logo =
              profile.profilePictureDisplayImage.artifacts[
                iNo
              ].fileIdentifyingUrlPathSegment;
            break;
          }
        }
        if (
          !person2.logo &&
          profile.profilePictureDisplayImage.artifacts &&
          profile.profilePictureDisplayImage.artifacts.length > 0
        ) {
          person2.logo =
            profile.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment;
        }
        if (person2.logo && profile.profilePictureDisplayImage.rootUrl) {
          person2.logo =
            profile.profilePictureDisplayImage.rootUrl + person2.logo;
        }
      }

      people.push(person2);
    }
  }

  if (source && source.elements && source.paging && source.metadata) {
    getPeopleList(source.elements);
    getPeopleDataV(source.elements);
  } else {
    source = source.replace(/&quot;/gi, '"').replace(/&#92;/gi, '\\');
    const regExp = /<code.*style="display: none".*>\s*([\s\S]*?)<\/code>/gi;

    while ((matches = regExp.exec(source))) {
      if (matches[1]) {
        const txt = matches[1];

        const obj = JSON.parse(txt);
        if (obj.elements && obj.paging && obj.metadata && people.length === 0) {
          getPeopleList(obj.elements);
          getPeopleDataV(source.elements);
        }
      }
    }
  }

  return people;
}

function getJsonFromUrl(url) {
  const query = url.substr(1);
  const result = {};
  query.split('&').forEach((part) => {
    const item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function searchEmailsPS2(input, emailsOld) {
  input = input.replace(/\s/gi, ' ');

  const emails = input.match(REG_EMAILS_P_S2);

  if (emails !== null && emails.length > 0) {
    for (let iNo = 0; iNo < emails.length; iNo++) {
      if (emailsOld.indexOf(emails[iNo]) === -1) {
        emailsOld.push(emails[iNo]);
      }
    }
  }

  return emailsOld;
}

function parseEmailsPS2(profile) {
  let res = [];

  if (profile.summary) {
    res = searchEmailsPS2(profile.summary, res);
  }

  if (profile.headline) {
    res = searchEmailsPS2(profile.headline, res);
  }

  const positions = profile.positions;

  for (const i in positions) {
    const position = positions[i];

    if (position.description) {
      res = searchEmailsPS2(position.description, res);
    }

    res = searchEmailsPS2(position.title, res);
  }

  return res;
}

function parseContactInfoPS2(data) {
  const res = {};

  res.e = parseEmailsPS2(data);

  if (!res.e) {
    return res;
  }
}

function findDescrByRegEx(source, reg, html) {
  let sTemp = '';
  const fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    if (fnd[1]) {
      sTemp = fnd[1];
    } else if (fnd[2]) {
      sTemp = fnd[2];
    }

    sTemp = sTemp.trim();
    if (!html) {
      sTemp = convertHtmlToText(sTemp);
    }
    return sTemp;
  }
  return '';
}

function getDataFromPagePS2(source) {
  const arData = [];
  while ((matches = REG_JSON_BLOCKS2_P_S2.exec(source))) {
    if (matches[1]) {
      let obj = {};
      try {
        obj = JSON.parse(matches[1].trim());
        if (obj) {
          arData.push(obj);
        }
      } catch (e) {
        try {
          const resp = matches[1]
            .trim()
            .replace(/\\n\\n"/gi, ' ')
            .replace(/"\\n\\n/gi, ' ');
          obj = JSON.parse(resp);
          if (obj) {
            arData.push(obj);
          }
        } catch (error) {
          try {
            let resp = resp.replace(/""/gi, '" "');
            resp = resp.replace(/\s".*?"\s/gi, ' ');
            obj = JSON.parse(resp);
            if (obj) {
              arData.push(obj);
            }
          } catch (err) {
            const resp = resp;
            obj = JSON.parse(resp);
            if (obj) {
              arData.push(obj);
            }
          }
        }
      }
    }
  }
  return arData;
}

function getUserInfoPS3(data) {
  if (!data || data.length === 0) {
    return undefined;
  }

  let profile;
  let profile2;

  for (let iNo = 0; iNo < data.length; iNo++) {
    if (
      data[iNo] &&
      data[iNo].data &&
      data[iNo].data.firstName &&
      data[iNo].data.lastName
    ) {
      profile = data[iNo].data;
      if (data[iNo].included && data[iNo].included[0]) {
        profile2 = data[iNo].included[0];
      }
      break;
    }
  }

  const user = {};

  if (profile) {
    user.source = 'linkedIn';

    user.fullInfo = 1;

    if (profile.firstName) {
      user.firstName = profile.firstName;
      if (!profile.fullName) {
        user.name = profile.firstName;
      }
    }
    if (profile.lastName) {
      user.lastName = profile.lastName;
      if (!profile.fullName) {
        user.name += ` ${profile.lastName}`;
      }
    }

    if (profile.fullName) {
      user.name = profile.fullName;
    }

    if (profile.industryName) {
      user.industry = profile.industryName;
    }

    if (profile.locationName) {
      user.locality = profile.locationName;
    }

    if (profile.skills) {
      user.skills = profile.skills;
    }

    if (profile.objectUrn) {
      user.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
    } else if (profile2 && profile2.objectUrn) {
      user.source_id = +findDescrByRegEx(profile2.objectUrn, /:(\d+)/i);
    }

    if (profile2.publicIdentifier) {
      user.sourceId2 = profile2.publicIdentifier;
    }

    if (profile2.picture && profile2.picture.artifacts) {
      for (let iNo = 0; iNo < profile2.picture.artifacts.length; iNo++) {
        if (profile2.picture.artifacts[iNo].width === 100) {
          user.logo =
            profile2.picture.artifacts[iNo].fileIdentifyingUrlPathSegment;
          break;
        }
        if (profile2.picture.artifacts[iNo].width === 800) {
          user.logo1 =
            profile2.picture.artifacts[iNo].fileIdentifyingUrlPathSegment;
          break;
        }
      }
      if (
        !user.logo &&
        profile2.picture.artifacts &&
        profile2.picture.artifacts.length > 0
      ) {
        user.logo = profile2.picture.artifacts[0].fileIdentifyingUrlPathSegment;
      }
      if (profile2.picture.rootUrl) {
        user.logo = profile2.picture.rootUrl + user.logo;
        user.logo1 = profile2.picture.rootUrl + user.logo1;
      }
    }

    const current = [];
    const previous = [];

    if (profile.positions) {
      for (const position in profile.positions) {
        const objPosition = profile.positions[position];
        const newPosition = {};

        newPosition.company_name = objPosition.companyName;
        newPosition.position = objPosition.title;

        if (objPosition.companyUrn) {
          newPosition.source_id = +findDescrByRegEx(
            objPosition.companyUrn,
            /:(\d+)/i,
          );
        }
        if (objPosition.posId) {
          newPosition.position_id = objPosition.posId;
        }
        if (objPosition.startedOn) {
          const startDate = new Date(
            objPosition.startedOn.year,
            objPosition.startedOn.month,
          );
          if (startDate > 1000) {
            newPosition.start = startDate / 1000;
          }
        }
        if (objPosition.endedOn) {
          const endDate = new Date(
            objPosition.endedOn.year,
            objPosition.endedOn.month,
          );
          if (endDate > 1000) {
            newPosition.end = endDate / 1000;
          }
        }

        if (objPosition.current) {
          current.push(newPosition);
        } else {
          previous.push(newPosition);
        }
      }

      if (current.length > 0 && previous.length > 0) {
        for (let iCurrentNo = 0; iCurrentNo < current.length; iCurrentNo++) {
          if (!current[iCurrentNo].source_id) {
            for (
              let iPreviousNo = 0;
              iPreviousNo < previous.length;
              iPreviousNo++
            ) {
              if (
                current[iCurrentNo].company_name ===
                previous[iPreviousNo].company_name
              ) {
                current[iCurrentNo].source_id = previous[iPreviousNo].source_id;
                break;
              }
            }
          }
        }
      }
    }

    user.current = current;
    user.previous = previous;

    if (profile.defaultPosition) {
      user.defaultPosition = {};
      user.defaultPosition.company_name = profile.defaultPosition.companyName;
      user.defaultPosition.position = profile.defaultPosition.title;
      if (profile.defaultPosition.posId) {
        user.defaultPosition.position_id = profile.defaultPosition.posId;
      }

      if (profile.defaultPosition.companyUrn) {
        user.defaultPosition.source_id = +findDescrByRegEx(
          profile.defaultPosition.companyUrn,
          /:(\d+)/i,
        );
      }

      if (profile.defaultPosition.startedOn) {
        const startDate = new Date(
          profile.defaultPosition.startedOn.year,
          profile.defaultPosition.startedOn.month,
        );
        if (startDate > 1000) {
          user.defaultPosition.start = startDate / 1000;
        }
      }
      if (profile.defaultPosition.endedOn) {
        const endDate = new Date(
          profile.defaultPosition.endedOn.year,
          profile.defaultPosition.endedOn.month,
        );
        if (endDate > 1000) {
          user.defaultPosition.end = endDate / 1000;
        }
      }
    }

    return user;
  }
}

function getUserInfoPS2(source) {
  let profile;
  let data;

  if (source.firstName) {
    profile = source;
  } else {
    data = getDataFromPagePS2(source);

    if (!data || data.length === 0) {
      return undefined;
    }

    for (let iNo = 0; iNo < data.length; iNo++) {
      if (data[iNo] && data[iNo].firstName && data[iNo].lastName) {
        profile = data[iNo];
        break;
      }
    }
    if (!profile) {
      return getUserInfoPS3(data);
    }
  }

  const user = {};

  if (profile) {
    user.source = 'linkedIn';

    user.fullInfo = 1;

    if (profile.headline) {
      user.headline = profile.headline;
    }

    if (profile.firstName) {
      user.firstName = profile.firstName;
      if (!profile.fullName) {
        user.name = profile.firstName;
      }
    }
    if (profile.lastName) {
      user.lastName = profile.lastName;
      if (!profile.fullName) {
        user.name += ` ${profile.lastName}`;
      }
    }

    if (profile.fullName) {
      user.name = profile.fullName;
    }

    if (profile.industry) {
      user.industry = profile.industry;
    }

    if (profile.location) {
      user.locality = profile.location;
    }

    if (profile.skills) {
      user.skills = profile.skills;
    }

    if (profile.objectUrn) {
      user.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
    } else if (profile2 && profile2.objectUrn) {
      user.source_id = +findDescrByRegEx(profile2.objectUrn, /:(\d+)/i);
    }

    if (profile.flagshipProfileUrl) {
      user.source_page = profile.flagshipProfileUrl;
    }
    if (profile.flagshipProfileUrl) {
      user.sourceId2 = findDescrByRegEx(
        profile.flagshipProfileUrl,
        /in\/(.+)$|in\/(.+)\//i,
      );
    }

    if (
      profile.profilePictureDisplayImage &&
      profile.profilePictureDisplayImage.artifacts
    ) {
      for (
        let iNo = 0;
        iNo < profile.profilePictureDisplayImage.artifacts.length;
        iNo++
      ) {
        if (profile.profilePictureDisplayImage.artifacts[iNo].width === 100) {
          user.logo =
            profile.profilePictureDisplayImage.artifacts[
              iNo
            ].fileIdentifyingUrlPathSegment;
        }
      }
      if (
        !user.logo &&
        profile.profilePictureDisplayImage.artifacts &&
        profile.profilePictureDisplayImage.artifacts.length > 0
      ) {
        user.logo =
          profile.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment;
      }
    }

    const current = [];
    const previous = [];

    if (profile.positions) {
      for (const position in profile.positions) {
        const objPosition = profile.positions[position];
        const newPosition = {};

        newPosition.company_name = objPosition.companyName;
        newPosition.position = objPosition.title;

        if (objPosition.companyUrn) {
          newPosition.source_id = +findDescrByRegEx(
            objPosition.companyUrn,
            /:(\d+)/i,
          );
        }
        if (objPosition.posId) {
          newPosition.position_id = objPosition.posId;
        }
        if (objPosition.startedOn) {
          const startDate = new Date(
            objPosition.startedOn.year,
            objPosition.startedOn.month,
          );
          if (startDate > 1000) {
            newPosition.start = startDate / 1000;
          }
        }
        if (objPosition.endedOn) {
          const endDate = new Date(
            objPosition.endedOn.year,
            objPosition.endedOn.month,
          );
          if (endDate > 1000) {
            newPosition.end = endDate / 1000;
          }
        }

        if (objPosition.current) {
          current.push(newPosition);
        } else {
          previous.push(newPosition);
        }
      }

      if (current.length > 0 && previous.length > 0) {
        for (let iCurrentNo = 0; iCurrentNo < current.length; iCurrentNo++) {
          if (!current[iCurrentNo].source_id) {
            for (
              let iPreviousNo = 0;
              iPreviousNo < previous.length;
              iPreviousNo++
            ) {
              if (
                current[iCurrentNo].company_name ===
                previous[iPreviousNo].company_name
              ) {
                current[iCurrentNo].source_id = previous[iPreviousNo].source_id;
                break;
              }
            }
          }
        }
      }
    }

    user.current = current;
    user.previous = previous;

    if (profile.defaultPosition) {
      user.defaultPosition = {};
      user.defaultPosition.company_name = profile.defaultPosition.companyName;
      user.defaultPosition.position = profile.defaultPosition.title;
      if (profile.defaultPosition.posId) {
        user.defaultPosition.position_id = profile.defaultPosition.posId;
      }

      if (profile.defaultPosition.companyUrn) {
        user.defaultPosition.source_id = +findDescrByRegEx(
          profile.defaultPosition.companyUrn,
          /:(\d+)/i,
        );
      }

      if (profile.defaultPosition.startedOn) {
        const startDate = new Date(
          profile.defaultPosition.startedOn.year,
          profile.defaultPosition.startedOn.month,
        );
        if (startDate > 1000) {
          user.defaultPosition.start = startDate / 1000;
        }
      }
      if (profile.defaultPosition.endedOn) {
        const endDate = new Date(
          profile.defaultPosition.endedOn.year,
          profile.defaultPosition.endedOn.month,
        );
        if (endDate > 1000) {
          user.defaultPosition.end = endDate / 1000;
        }
      }
    }

    if (data) {
      const cInfo = parseContactInfoPS2(data);
      if (cInfo) {
        user.cInfo = cInfo;
      }
      user.page_lang = findDescrByRegEx(source, REG_DETECT_LANG);
    }
  } else {
    return undefined;
  }

  return user;
}

function getAll(field, data, type) {
  for (key in data) {
    if (key === field && data[key] === type) {
      this.data.push(data);
    } else if (typeof data[key] === 'object' || typeof data[key] === 'array') {
      getAll(field, data[key], type);
    }
  }

  return this.data;
}

function getDataFromPage(source) {
  const arData = [];
  while ((matches = REG_JSON_BLOCKS.exec(source))) {
    if (matches[1]) {
      let obj = {};
      try {
        obj = JSON.parse(matches[1].trim());
        if (obj) {
          arData.push(obj);
        } else {
          obj = matches[1].trim();
        }
      } catch (e) {
        console.log('getDataFromPage: ', e);
      }
    }
  }
  return arData;
}

function getCompanySizeCode(staffCount) {
  if (staffCount >= 10001) {
    return 'I';
  }
  if (staffCount >= 5001 && staffCount < 10001) {
    return 'H';
  }
  if (staffCount < 5001 && staffCount >= 1001) {
    return 'G';
  }
  if (staffCount >= 501 && staffCount < 1001) {
    return 'F';
  }
  if (staffCount >= 201 && staffCount < 501) {
    return 'E';
  }
  if (staffCount >= 51 && staffCount < 201) {
    return 'D';
  }
  if (staffCount >= 11 && staffCount < 51) {
    return 'C';
  }
  if (staffCount < 11 && staffCount >= 1) {
    return 'B';
  }
  return 'A';
}

function getMasByKey(field, data, type) {
  for (key in data) {
    if (key === field && data[key] === type) {
      this.data = data;
    } else if (typeof data[key] === 'object' || typeof data[key] === 'array') {
      getMasByKey(field, data[key], type);
    }
  }

  return this.data;
}

function getCompanyInfo(source) {
  let data = [];
  let company;

  if (typeof source === 'object' && source.elements && source.elements[0]) {
    data = source;
    company = source.elements[0];
  } else if (typeof source === 'object' && source.included) {
    data = source.included;
  } else {
    source = source.replace(/&quot;/gi, '"').replace(/&#92;/gi, '\\');
    data = getDataFromPage(source);
  }

  if (!data || data.length === 0) {
    return undefined;
  }

  if (!company) {
    company = {};

    this.data = [];
    const companies = getAll('$type', data, COMPANIES_IDENT);
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

  const result = {};

  result.name = company.name;

  if (company.companyPageUrl) {
    result.url = company.companyPageUrl;
  }

  if (company.companyIndustries && company.companyIndustries[0]) {
    result.industry = company.companyIndustries[0].localizedName;
  } else if (company.industries && company.industries[0]) {
    result.industry = company.industries[0];
  }

  if (company.companyType && company.companyType.localizedName) {
    result.type = company.companyType.localizedName;
  } else if (company.type) {
    result.type = company.type;
  }

  if (company.specialities) {
    result.comp_tags = company.specialities;
  }

  if (company.entityUrn) {
    result.source_id = company.entityUrn.replace(
      'urn:li:fs_normalized_company:',
      '',
    );
  }

  if (result.source_id) {
    result.source_page = `https://www.linkedin.com/company/${result.source_id}`;
  }

  if (company.universalName) {
    result.sourceId2 = company.universalName;
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

function currentCompany(comp, tabId) {
  function retrieveCompany(tkk, cUrl) {
    chrome.tabs.sendMessage(
      tabId,
      {
        method: 'getPersonData',
        tk: tkk,
        url: cUrl,
      },
      (response) => {
        if (!chrome.runtime.lastError) {
          let resp;
          if (csrfToken) {
            if (response && response.data) {
              resp = JSON.parse(response.data);
            }
          } else if (response && response.data) {
            resp = response.data
              .replace(/&quot;/gi, '"')
              .replace(/&#92;/gi, '\\');
          }

          const company = getCompanyInfo(resp);
          chrome.storage.local.set({ companyLink: company.url });

          if (company && company.name && company.source_id) {
            person.currentCompanyInfo = company;
          }
        }
      },
    );
  }

  if (comp.source_id) {
    if (isRecruterIntP) {
      const cUrl = `https://www.linkedin.com/recruiter/company/${comp.source_id}`;
      retrieveCompany(null, cUrl);
    } else if (isSalesNavIntP) {
      chrome.storage.local.get(['csrfToken'], (request) => {
        if (request.csrfToken) {
          csrfToken = true;
          let cUrl = `https://www.linkedin.com/sales-api/salesApiCompanies/${comp.source_id}`;
          cUrl +=
            '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
          retrieveCompany(request.csrfToken, cUrl);
        } else {
          const cUrl = `https://www.linkedin.com/sales/accounts/insights?companyId=${comp.source_id}`;
          retrieveCompany(null, cUrl);
        }
      });
    } else {
      chrome.storage.local.get(['csrfToken'], (request) => {
        if (request.csrfToken) {
          const cUrl =
            `https://www.linkedin.com/voyager/api/organization/companies?` +
            `decorationId=com.linkedin.voyager.deco.organization.web.WebFullCompanyMain-18&q=universalName&universalName=${comp.source_id}`;
          retrieveCompany(request.csrfToken, cUrl);
        } else {
          const cUrl = `https://www.linkedin.com/company/${comp.source_id}/`;
          retrieveCompany(null, cUrl);
        }
      });
    }
  }
}

function getConInfo(source) {
  sd = {};
  if (typeof source === 'object') {
    const data = source;
    if (data.emailAddress === undefined) {
      chrome.storage.local.set({ emailFromLinkedin: 'notFound' });
    } else {
      chrome.storage.local.set({ emailFromLinkedin: data.emailAddress });
    }
    return sd;
  }
}

function retriveContactdata(id, tabId) {
  chrome.storage.local.get(['csrfToken'], (request) => {
    if (request.csrfToken) {
      let mUrl = `https://www.linkedin.com/voyager/api/identity/profiles/${id}`;
      mUrl += '/profileContactInfo';
      chrome.tabs.sendMessage(
        tabId,
        {
          method: 'getPersonData',
          tk: request.csrfToken,
          url: mUrl,
        },
        (response) => {
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

function getDataFromPageP(source) {
  const arData = [];
  // eslint-disable-next-line no-cond-assign
  while ((matches = REG_JSON_BLOCKS_P.exec(source))) {
    if (matches[1]) {
      let obj = {};
      try {
        obj = JSON.parse(matches[1].trim());
        if (obj && obj.data && obj.included && obj.included.length > 10) {
          arData.push(obj);
        }
      } catch (e) {
        console.log('Error parsing JSON', e);
      }
    }
  }
  return arData;
}

function getMasByKeyP(field, data, type, name) {
  for (key in data) {
    if (
      key === field &&
      data[key] === type &&
      (!name || (name && name === `${data.firstName} ${data.lastName}`))
    ) {
      this.data = data;
      break;
    } else if (typeof data[key] === 'object' || typeof data[key] === 'array') {
      getMasByKeyP(field, data[key], type, name);
    }
  }
  return this.data;
}

function getAllP(field, data, type) {
  for (key in data) {
    if (typeof data[key] === 'object' || typeof data[key] === 'array') {
      getAllP(field, data[key], type);
    } else if (key === field && data[key].indexOf(type) !== -1) {
      this.data.push(data);
    }
  }

  return this.data;
}

function findDescr(source, reg) {
  let sTemp = '';
  const fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    sTemp = fnd[1];
    sTemp = sTemp.trim();
    sTemp = convertHtmlToText(sTemp);
    return sTemp;
  }
  return '';
}

function searchEmails(input, emailsOld) {
  // eslint-disable-next-line no-param-reassign
  input = input.replace(/\s/gi, ' ');

  const emails = input.match(REG_EMAILS);

  if (emails && emails.length > 0) {
    for (let iNo = 0; iNo < emails.length; iNo++) {
      if (emailsOld.indexOf(emails[iNo]) === -1) {
        emailsOld.push(emails[iNo]);
      }
    }
  }

  return emailsOld;
}

function parseEmails(data, linkedinMainInfoArray) {
  let res = [];

  if (linkedinMainInfoArray.summary) {
    res = searchEmails(linkedinMainInfoArray.summary, res);
  }

  if (linkedinMainInfoArray.headline) {
    res = searchEmails(linkedinMainInfoArray.headline, res);
  }

  this.data = [];
  const companies = getAllP('$type', data, USER_POSITIONS);
  for (key in companies) {
    if (companies[key].description) {
      res = searchEmails(companies[key].description, res);
    }
  }
  this.data = [];
  return res;
}

function parseContactInfo(data, linkedinMainInfoArray) {
  const res = {};

  res.e = parseEmails(data, linkedinMainInfoArray);

  return res;
}

function convertHtmlToText(inputText) {
  let returnText = inputText;
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

function findDescrP(source, reg) {
  let sTemp = '';
  const fnd = source.match(reg);

  if (fnd && fnd.length > 1) {
    // eslint-disable-next-line prefer-destructuring
    sTemp = fnd[1];
    sTemp = sTemp.trim();
    sTemp = convertHtmlToText(sTemp);
    return sTemp;
  }
  return '';
}

function getUserInfo(source) {
  let linkedinPerson;
  let linkedinMainInfoArray;
  const user = {};

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
      }
      if (typeof data[key] === 'object' || typeof data[key] === 'array') {
        getLinkedinMainInfoArray(field, data[key], type, data);
      }
    }
  }

  function getLinkedinMainInfoArrayOld(field, data, type, parent) {
    for (key in data) {
      if (!linkedinMainInfoArray && key === field && data[key] === type) {
        linkedinMainInfoArray = data;
        linkedinPerson = parent;
        return;
      }
      if (typeof data[key] === 'object' || typeof data[key] === 'array') {
        getLinkedinMainInfoArrayOld(field, data[key], type, data);
      }
    }
  }

  let data = [];

  if (typeof source === 'object') {
    data = source;
    linkedinMainInfoArray = source.elements[0];
  } else {
    data = getDataFromPageP(source);

    if (!data || data.length === 0) {
      return undefined;
    }

    getLinkedinMainInfoArray('$type', data, MAIN_PROFILE_INFO, data.parent);

    if (!linkedinMainInfoArray || !linkedinMainInfoArray.firstName) {
      getLinkedinMainInfoArrayOld(
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

  user.source = 'linkedIn';

  user.fullInfo = 1;

  if (linkedinMainInfoArray.headline) {
    user.headline = linkedinMainInfoArray.headline;
  }

  if (linkedinMainInfoArray.firstName) {
    user.firstName = linkedinMainInfoArray.firstName;
    user.name = linkedinMainInfoArray.firstName;
  }
  if (linkedinMainInfoArray.lastName) {
    user.lastName = linkedinMainInfoArray.lastName;
    user.name += ` ${linkedinMainInfoArray.lastName}`;
  }
  if (linkedinMainInfoArray.industry && linkedinMainInfoArray.industry.name) {
    user.industry = linkedinMainInfoArray.industry.name;
  } else if (linkedinMainInfoArray.industryName) {
    user.industry = linkedinMainInfoArray.industryName;
  }
  if (linkedinMainInfoArray.locationName) {
    user.locality = linkedinMainInfoArray.locationName;
  } else if (linkedinMainInfoArray.geoLocation) {
    if (linkedinMainInfoArray.geoLocation.geo) {
      if (linkedinMainInfoArray.geoLocation.geo.defaultLocalizedName) {
        user.locality =
          linkedinMainInfoArray.geoLocation.geo.defaultLocalizedName;
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
    const location = getMasByKeyP('$type', data, USER_LOCATION);
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
      user.sourceId2 = linkedinMainInfoArray.publicIdentifier;
      user.source_page = `https://www.linkedin.com/in/${user.sourceId2}/`;
    }
    if (
      linkedinMainInfoArray.profilePicture &&
      linkedinMainInfoArray.profilePicture.displayImageReference &&
      linkedinMainInfoArray.profilePicture.displayImageReference.vectorImage
    ) {
      const picture =
        linkedinMainInfoArray.profilePicture.displayImageReference.vectorImage;
      for (let iNo = 0; iNo < picture.artifacts.length; iNo++) {
        if (picture.artifacts[iNo].width === 100) {
          user.logo = picture.artifacts[iNo].fileIdentifyingUrlPathSegment;
        }
        if (picture.artifacts[iNo].width === 800) {
          user.logo1 = picture.artifacts[iNo].fileIdentifyingUrlPathSegment;
        }
      }
      if (!user.logo && picture.artifacts && picture.artifacts.length > 0) {
        user.logo = picture.artifacts[0].fileIdentifyingUrlPathSegment;
      }
      if (picture.rootUrl && user.logo.indexOf('https') === -1) {
        user.logo = picture.rootUrl + user.logo;
        user.logo1 = picture.rootUrl + user.logo1;
      }
    }
  } else {
    let miniProfile;
    if (linkedinMainInfoArray.miniProfile) {
      miniProfile = getMasByKeyP(
        'entityUrn',
        data,
        linkedinMainInfoArray.miniProfile,
      );
    } else {
      miniProfile = getMasByKeyP(
        '$type',
        data,
        SEARCH_PROFILES_IDENT,
        user.name,
      );
    }

    if (miniProfile) {
      if (miniProfile.publicIdentifier) {
        user.sourceId2 = miniProfile.publicIdentifier.trim();

        if (user.country) {
          user.source_page = `https://${user.country}.linkedin.com/in/${user.sourceId2}/`;
        } else {
          user.source_page = `https://www.linkedin.com/in/${user.sourceId2}/`;
        }
      }

      if (miniProfile.objectUrn) {
        user.source_id = miniProfile.objectUrn.replace('urn:li:member:', '');
      }

      if (miniProfile.picture && miniProfile.picture.artifacts) {
        for (let iNo = 0; iNo < miniProfile.picture.artifacts.length; iNo++) {
          if (miniProfile.picture.artifacts[iNo].width === 100) {
            user.logo =
              miniProfile.picture.artifacts[iNo].fileIdentifyingUrlPathSegment;
            break;
          }
        }
        if (
          !user.logo &&
          miniProfile.picture.artifacts &&
          miniProfile.picture.artifacts.length > 0
        ) {
          user.logo =
            miniProfile.picture.artifacts[0].fileIdentifyingUrlPathSegment;
        }
        if (miniProfile.picture.rootUrl && user.logo.indexOf('https') === -1) {
          user.logo = miniProfile.picture.rootUrl + user.logo;
        }
      }
    }
  }

  if (!user.logo) {
    this.data = [];
    let rootUrl;
    const urls = getAllP(
      '$id',
      linkedinPerson,
      `${linkedinMainInfoArray.miniProfile},picture,com.linkedin.common.VectorImage`,
    );
    if (urls) {
      for (key in urls) {
        if (
          urls[key].rootUrl &&
          urls[key].rootUrl.indexOf('profile-displayphoto-shrink') !== -1
        ) {
          rootUrl = urls[key].rootUrl;
          break;
        }
      }
    }

    this.data = [];
    const logos = getAllP(
      '$type',
      linkedinPerson,
      'com.linkedin.common.VectorArtifact',
    );
    if (logos) {
      for (key in logos) {
        if (
          logos[key].height &&
          logos[key].width &&
          logos[key].height === 800 &&
          logos[key].width === 800 &&
          logos[key].fileIdentifyingUrlPathSegment &&
          logos[key].$id &&
          logos[key].$id.indexOf(linkedinMainInfoArray.miniProfile) === 0
        ) {
          const resp = logos[key].fileIdentifyingUrlPathSegment;
          if (rootUrl) {
            user.logo = rootUrl + resp;
          } else {
            user.logo = resp;
          }
          break;
        }
      }
    }
  }

  let skills;
  if (linkedinMainInfoArray.profileSkills) {
    skills = linkedinMainInfoArray.profileSkills.elements;
  } else {
    this.data = [];
    skills = getAllP('$type', data, USER_SKILLS);
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

  let companies = getAllP('$type', data, USER_POSITIONS);
  if (!companies || (companies && companies.length === 0)) {
    companies = getAllP(
      'entityUrn',
      data,
      `urn:li:fsd_profilePosition:(${user.entityUrn}`,
    );
  }

  for (company in companies) {
    if (companies[company].companyName) {
      const job = {};
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
        } else if (
          companies[company].companyUrn.indexOf('urn:li:fsd_company:') !== -1
        ) {
          job.source_id = companies[company].companyUrn.replace(
            'urn:li:fsd_company:',
            '',
          );
        }
      }

      let timedPeriod;
      if (companies[company].timePeriod) {
        if (typeof companies[company].timePeriod === 'string') {
          timedPeriod = getMasByKeyP(
            '$id',
            data,
            companies[company].timePeriod,
          );
        } else {
          timedPeriod = companies[company].timePeriod;
        }

        if (timedPeriod) {
          if (timedPeriod.$id) {
            const positionId = findDescrByRegEx(
              timedPeriod.$id,
              /(\d+)\),timePeriod/i,
            );
            if (positionId) {
              job.position_id = positionId;
            }
          }
          if (timedPeriod.startDate) {
            let startBlock;
            if (typeof timedPeriod.startDate === 'string') {
              startBlock = getMasByKeyP('$id', data, timedPeriod.startDate);
            } else {
              startBlock = timedPeriod.startDate;
            }
            if (startBlock && startBlock.year) {
              const { year } = startBlock;
              let month = 1;
              if (startBlock.month) {
                month = startBlock.month;
              }
              const startDate = new Date(year, month - 1, 1);
              if (startDate > 1000) {
                job.start = startDate / 1000;
              }
            }
          }

          if (timedPeriod.endDate) {
            let endBlock;
            if (typeof timedPeriod.endDate === 'string') {
              endBlock = getMasByKeyP('$id', data, timedPeriod.endDate);
            } else {
              endBlock = timedPeriod.endDate;
            }
            if (endBlock && endBlock.year) {
              const { year } = endBlock;
              let month = 1;
              if (endBlock.month) {
                month = endBlock.month;
              }
              const endDate = new Date(year, month - 1, 1);
              if (endDate > 1000) {
                job.end = endDate / 1000;
              }
            }

            user.previous.push(job);
          } else {
            user.current.push(job);
          }
        }
      } else if (companies[company].dateRange) {
        const { dateRange } = companies[company];
        if (dateRange.start) {
          const { year } = dateRange.start;
          let month = 1;
          if (dateRange.start.month) {
            month = dateRange.start.month;
          }
          const startDate = new Date(year, month - 1, 1);
          if (startDate > 1000) {
            job.start = startDate / 1000;
          }
        }
        if (dateRange.end) {
          const { year } = dateRange.end;
          let month = 1;
          if (dateRange.end.month) {
            month = dateRange.end.month;
          }
          const endDate = new Date(year, month - 1, 1);
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
  if (user.current.length > 0 && user.previous.length > 0) {
    for (let iCurrentNo = 0; iCurrentNo < user.current.length; iCurrentNo++) {
      if (!user.current[iCurrentNo].source_id) {
        for (
          let iPreviousNo = 0;
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
function getPeopleGraph(source) {
  const minidata = [];
  if (typeof source === 'object') {
    let miniProfile = [];
    if (
      source.data &&
      source.data.searchDashClustersByAll &&
      source.data.searchDashClustersByAll.elements &&
      source.data.searchDashClustersByAll.elements.length > 0
    ) {
      const elements = source.data.searchDashClustersByAll.elements;
      elements.forEach((elem) => {
        if (elem.results && elem.results.length > 0) {
          const results = elem.results;
          results.forEach((res) => {
            miniProfile.push(res);
          });
        }
      });
    } else {
      miniProfile = source.included;
    }
    if (miniProfile) {
      miniProfile.forEach((ii) => {
        if (ii.template && ii.navigationUrl) {
          if (
            ii.navigationUrl.indexOf('/in/') !== -1 &&
            ii.title.text &&
            ii.title.text !== 'LinkedIn Member'
          ) {
            mp = {};
            mp.name = ii.title.text;
            const arrName = mp.name.split(' ');
            if (arrName.length === 1) {
              mp.firstname = arrName[0];
              mp.lastname = '';
            } else if (arrName.length === 2) {
              mp.firstname = arrName[0];
              mp.lastname = arrName[1];
            } else if (arrName.length > 2) {
              mp.firstname = arrName[0];
              mp.lastname = arrName[1];
              for (let i = 2; i < arrName.length; i++) {
                mp.lastname += ` ${arrName[i]}`;
              }
            }
            if (ii.primarySubtitle && ii.primarySubtitle.text) {
              mp.description = ii.primarySubtitle.text;
            }
            mp.source_id = ii.trackingUrn.replace('urn:li:member:', '');
            mp.source_id_2 = findDescr(
              ii.navigationUrl,
              regGooglePersonSourceId2,
            );
            if (
              mp.source_id_2 &&
              mp.source_id_2.indexOf('?miniProfileUrn') !== -1
            ) {
              mp.source_id_2 = decodeURIComponent(
                findDescr(mp.source_id_2, regPersonId2Parse),
              );
            }
            if (
              ii.image &&
              ii.image.attributes &&
              ii.image.attributes.length > 0
            ) {
              const profileImageAttribute = ii.image.attributes[0];
              if (
                profileImageAttribute &&
                profileImageAttribute.detailData &&
                profileImageAttribute.detailData.nonEntityProfilePicture
              ) {
                const profileImageReference =
                  profileImageAttribute.detailData.nonEntityProfilePicture;
                if (
                  profileImageReference &&
                  profileImageReference.vectorImage &&
                  profileImageReference.vectorImage.artifacts &&
                  profileImageReference.vectorImage.artifacts.length > 0
                ) {
                  const profileVectors = profileImageReference.vectorImage;
                  for (
                    let iNo = 0;
                    iNo < profileVectors.artifacts.length;
                    iNo++
                  ) {
                    if ((profileVectors.artifacts[iNo].width = 100)) {
                      mp.logo =
                        profileVectors.artifacts[
                          iNo
                        ].fileIdentifyingUrlPathSegment;
                    }
                  }
                  if (mp.logo && profileVectors.rootUrl) {
                    mp.logo = profileVectors.rootUrl + mp.logo;
                  }
                }
              }
            }
            minidata.push(mp);
          }
        }
      });
    }

    return minidata;
  }
}

function mergeUniqueBy(arr1, arr2, key = 'source_id_2') {
  const seen = new Map();

  // Push both arrays in order; the first hit for a key is kept.
  [...arr1, ...arr2].forEach((obj) => {
    if (!seen.has(obj[key])) {
      seen.set(obj[key], obj);
    }
    // If you prefer “last one wins”, swap the two lines above for:
    // seen.set(obj[key], obj);
  });

  return [...seen.values()];
}

function BGActionDo(tab, tabId) {
  if (tab.url.indexOf('/in/') !== -1) {
    chrome.storage.local.get(['csrfToken'], (request) => {
      console.log('csrfToken', request?.csrfToken);
      if (request.csrfToken) {
        const sourceId2 = findDescrP(tab.url, /in\/(.+?)(\/|$)/i);
        const apiUrl = `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${sourceId2}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-91`;
        chrome.tabs.sendMessage(
          tab.id,
          { method: 'getPersonData', tk: request.csrfToken, url: apiUrl },
          (response) => {
            if (!chrome.runtime.lastError) {
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
                        () => {},
                      );
                      console.log('[LinkedIn] Single View1:', person);
                      chrome.storage.local.set(
                        { companyLink: 'link is undefined' },
                        () => {},
                      );
                    } else {
                      currentCompany(person.current[0], tabId);
                      retriveContactdata(sourceId2, tabId);
                      chrome.storage.local.set({ personInfo: person });
                      console.log('[LinkedIn] Single View2:', person);
                    }
                  } else {
                    chrome.storage.local.set({ personInfo: person });
                    console.log('[LinkedIn] Single View3:', person);

                    chrome.storage.local.set({ companyLink: 'NA' });
                  }
                }
              }
            }
          },
        );
      }
    });
  } else if (tab.url.toLowerCase().indexOf('/search/results/people') !== -1) {
    let tabUrl = tab.url;
    let urls = {};
    chrome.storage.local.get(
      [
        'csrfToken',
        'defaultApiPeopleSearch_url',
        'premiumApiPeopleSearch_url',
        'graphApiPeopleSearch_url',
      ],
      (request) => {
        if (request.graphApiPeopleSearch_url) {
          urls = JSON.parse(request.graphApiPeopleSearch_url);
          isGraph = true;
          isPre = false;
        }
        if (urls[tab.id]) {
          tabUrl = urls[tab.id];
        } else if (request.premiumApiPeopleSearch_url) {
          urls = JSON.parse(request.premiumApiPeopleSearch_url);
          isPre = true;
          if (urls[tab.id]) {
            tabUrl = urls[tab.id];
          }
        } else if (request.defaultApiPeopleSearch_url) {
          urls = JSON.parse(request.defaultApiPeopleSearch_url);
          if (urls[tab.id]) {
            tabUrl = urls[tab.id];
          }
        }
        if (request.csrfToken) {
          chrome.tabs.sendMessage(
            tabId,
            {
              method: 'getPersonData',
              origin: 'ns',
              tk: request.csrfToken,
              url: tabUrl,
            },
            (response) => {
              if (!chrome.runtime.lastError) {
                if (response) {
                  if (response && response.data) {
                    if (isPre) {
                      try {
                        people = getPeople_pre(JSON.parse(response.data));
                        console.log(
                          '[LinkedIn] Bulk View Pagination 1:',
                          people,
                        );
                      } catch (err) {
                        people = getPeople(response.data, false);
                        console.log(
                          '[LinkedIn] Bulk View Pagination 2:',
                          people,
                        );
                      }
                    } else if (isGraph) {
                      people = getPeopleGraph(JSON.parse(response.data));
                      console.log('[LinkedIn] Bulk View Pagination 3:', people);
                    } else {
                      try {
                        people = getPeople_a(JSON.parse(response.data));
                        console.log(
                          '[LinkedIn] Bulk View Pagination 4:',
                          people,
                        );
                      } catch (err) {
                        console.log('[LinkedIn] Bulk View Pagination:', err);
                      }
                    }
                  }
                } else {
                  people = undefined;
                }
                if (people && people.length > 0) {
                  const peopleInfo = {};
                  peopleInfo.oldurl = tab.url;
                  peopleInfo.people = people;
                  chrome.storage.local.set({ bulkInfo: peopleInfo }, () => {});
                }
              }
            },
          );
        }
      },
    );
  } else if (tab.url.includes('/company/') && tab.url.includes('/people')) {
    let tabUrl = tab.url;
    let urls = {};
    chrome.storage.local.get(
      [
        'csrfToken',
        'defaultApiPeopleSearch_url',
        'premiumApiPeopleSearch_url',
        'graphApiPeopleSearch_url',
      ],
      (request) => {
        if (request.graphApiPeopleSearch_url) {
          urls = JSON.parse(request.graphApiPeopleSearch_url);
          isGraph = true;
          isPre = false;
        }
        if (urls[tab.id]) {
          tabUrl = urls[tab.id];
        } else if (request.premiumApiPeopleSearch_url) {
          urls = JSON.parse(request.premiumApiPeopleSearch_url);
          isPre = true;
          if (urls[tab.id]) {
            tabUrl = urls[tab.id];
          }
        } else if (request.defaultApiPeopleSearch_url) {
          urls = JSON.parse(request.defaultApiPeopleSearch_url);
          if (urls[tab.id]) {
            tabUrl = urls[tab.id];
          }
        }
        if (request.csrfToken) {
          chrome.tabs.sendMessage(
            tabId,
            {
              method: 'getPersonData',
              origin: 'ns',
              tk: request.csrfToken,
              url: tabUrl,
            },
            (response) => {
              if (!chrome.runtime.lastError) {
                if (response) {
                  if (response && response.data) {
                    if (isPre) {
                      try {
                        people = getPeople_pre(JSON.parse(response.data));
                      } catch (err) {
                        people = getPeople(response.data, false);
                      }
                    } else if (isGraph) {
                      people = getPeopleGraph(JSON.parse(response.data));
                    } else {
                      try {
                        people = getPeople_a(JSON.parse(response.data));
                      } catch (err) {
                        console.log('[LinkedIn] Bulk View Company err:', err);
                      }
                    }
                  }
                } else {
                  people = undefined;
                }
                console.log('[LinkedIn] Bulk View Company:', people);
                if (people && people.length > 0) {
                  const peopleInfo = {};
                  peopleInfo.oldurl = tab.url;
                  peopleInfo.people = people;

                  chrome.tabs.sendMessage(tab.id, {
                    method: 'bulk-prospect-reload',
                  });

                  chrome.storage.local.get(['bulkInfo'], (request1) => {
                    if (request1?.bulkInfo?.oldurl === tab.url) {
                      peopleInfo.people = mergeUniqueBy(
                        request1.bulkInfo.people,
                        peopleInfo.people,
                      );
                      chrome.storage.local.set(
                        {
                          bulkInfo: peopleInfo,
                        },
                        () => {},
                      );
                    } else {
                      chrome.storage.local.set(
                        { bulkInfo: peopleInfo },
                        () => {},
                      );
                    }
                  });
                } else {
                  chrome.tabs.reload(tabId);
                }
              }
            },
          );
        }
      },
    );
  } else if (tab.url.includes('/sales/lead/')) {
    chrome.storage.local.get(['csrfToken'], (request) => {
      if (request.csrfToken) {
        let fnd = tab.url.match(/sales\/people\/(.+?),(.+?),(.+?)(\?|$)/i);
        if (!fnd && tab.url.toLowerCase().indexOf('/lead/') !== -1) {
          fnd = tab.url.match(/sales\/lead\/(.+?),(.+?),(.+?)(\?|$)/i);
        }
        let authToken;
        let profileId;
        // let profileIdS;
        if (fnd && fnd.length > 3) {
          for (let iNo = 1; iNo < 4; iNo++) {
            if (fnd[iNo].length < 11) {
              authToken = fnd[iNo];
            }
            if (fnd[iNo].length > 11) {
              profileId = fnd[iNo];
              // profileIdS = fnd[iNo];
            }
          }
          if (profileId && authToken) {
            let newUrl =
              'https://www.linkedin.com/sales-api/salesApiProfiles/(';
            newUrl += `profileId:${profileId},authType:NAME_SEARCH,authToken:${authToken})`;
            newUrl +=
              '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2ClistCount%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CblockThirdPartyDataSharing%2CconnectedTime%2CnoteCount%2CflagshipProfileUrl%2CfullNamePronunciationAudio%2Cmemorialized%2CfullNamePronunciationAudio%2Cpositions*%2Ceducations*%29';

            chrome.tabs.sendMessage(
              tabId,
              {
                method: 'getPersonData',
                tk: request.csrfToken,
                url: newUrl,
              },
              (response) => {
                if (response && response.data) {
                  person = getUserInfoPS2(JSON.parse(response.data));
                }
                if (person) {
                  csrfToken = true;
                  if (person.name) {
                    if (person.current && person.current.length > 0) {
                      currentCompany(person.current[0], tabId);
                    }
                    chrome.tabs.sendMessage(tabId, {
                      method: 'getInnerHTML',
                    });
                  }
                  const personInfo = {};
                  personInfo.oldurl = tab.url;
                  personInfo.name = person.name;
                  if (person.sourceId2) {
                    personInfo.sourceId2 = person.sourceId2;
                  } else {
                    personInfo.source_id = person.source_id;
                  }
                  if (person.current && person.current.length > 0) {
                    personInfo.position = person.current[0].position;
                    personInfo.company_name = person.current[0].company_name;
                  }
                  personInfo.locality = person.locality;
                  personInfo.profile_image = person.logo;
                  console.log('[Sales Navigator] Single View:', person);
                  chrome.storage.local.set({ personInfo: person });
                }
              },
            );
          }
        }
      }
    });
  } else if (tab.url.toLowerCase().indexOf('/sales/search/people') !== -1) {
    let tabUrl = tab.url;
    let tabMethod = null;
    let urls = {};
    let params = '';
    const currentPageNum = findDescrByRegEx(tab.url, /page=(\d+)&/i);
    let currentPageIndex = parseInt(currentPageNum, 10) * 25;
    currentPageIndex -= 25;
    chrome.storage.local.get(
      ['csrfToken', 'salesApiPeopleSearch_url'],
      (request) => {
        if (request.salesApiPeopleSearch_url) {
          urls = JSON.parse(request.salesApiPeopleSearch_url);
        }
        if (urls[tabId]) {
          tabUrl = urls[tabId].url;
          tabMethod = urls[tabId].method;
          if (
            tabMethod === 'POST' ||
            tabUrl === 'https://www.linkedin.com/sales-api/salesApiLeadSearch'
          ) {
            const tempUrl = findDescrByRegEx(
              tab.url,
              /\/sales\/search\/people(.*)/i,
            );
            queryParams = getJsonFromUrl(tempUrl);
            params = `q=searchQuery&query=${queryParams.query}&start=${
              currentPageIndex || 0
            }&count=25&trackingParam=(sessionId:${
              queryParams.sessionId
            })&decorationId=com.linkedin.sales.deco.desktop.searchv2.LeadSearchResult-7`;
          } else {
            const currentApiIndex = parseInt(
              findDescrByRegEx(tabUrl, /&start=(\d+)&count=/i),
              10,
            );
            if (
              currentPageIndex &&
              currentApiIndex > -1 &&
              currentPageIndex !== currentApiIndex
            ) {
              tabUrl = tabUrl.replace(
                `&start=${currentApiIndex}`,
                `&start=${currentPageIndex}`,
              );
            } else if (
              currentApiIndex &&
              !currentPageIndex &&
              currentPageIndex !== 0
            ) {
              tabUrl = tabUrl.replace(`&start=${currentApiIndex}`, '&start=0');
            }
          }
        }
        if (request.csrfToken) {
          chrome.tabs.sendMessage(
            tabId,
            {
              method: 'getPersonData',
              tk: request.csrfToken,
              url: tabUrl,
              request_method: tabMethod,
              params,
            },
            (response) => {
              if (!chrome.runtime.lastError) {
                if (response) {
                  if (response && response.data) {
                    people = getPeopleSSP(JSON.parse(response.data));
                  }
                } else {
                  people = undefined;
                }
                if (people && people.length > 0) {
                  const peopleInfo = {};
                  peopleInfo.oldurl = tab.url;
                  peopleInfo.people = people;
                  console.log('[Sales Navigator] Bulk View Filters', people);

                  // chrome.storage.local.set({ peopleInfo });
                }
              }
            },
          );
        }
      },
    );
  } else if (tab.url.toLowerCase().indexOf('/sales/lists/people') !== -1) {
    let tabUrl = tab.url;
    let tabMethod = null;
    let urls = {};
    let params = '';
    const currentPageNum = findDescrByRegEx(tab.url, /page=(\d+)&/i);
    let currentPageIndex = parseInt(currentPageNum, 10) * 25;
    currentPageIndex -= 25;
    chrome.storage.local.get(
      ['csrfToken', 'salesApiPeopleSearch_url'],
      (request) => {
        if (request.salesApiPeopleSearch_url) {
          urls = JSON.parse(request.salesApiPeopleSearch_url);
        }
        if (urls[tabId]) {
          tabUrl = urls[tabId].url;
          tabMethod = urls[tabId].method;
          if (
            tabMethod === 'POST' ||
            tabUrl === 'https://www.linkedin.com/sales-api/salesApiPeopleSearch'
          ) {
            const tempUrl = findDescrByRegEx(
              tab.url,
              /\/sales\/search\/people(.*)/i,
            );
            queryParams = getJsonFromUrl(tempUrl);
            params = `q=searchQuery&query=${queryParams.query}&start=${
              currentPageIndex || 0
            }&count=25&trackingParam=(sessionId:${
              queryParams.sessionId
            })&decorationId=com.linkedin.sales.deco.desktop.searchv2.LeadSearchResult-7`;
          } else {
            const currentApiIndex = parseInt(
              findDescrByRegEx(tabUrl, /&start=(\d+)&count=/i),
              10,
            );
            if (
              currentPageIndex &&
              currentApiIndex > -1 &&
              currentPageIndex !== currentApiIndex
            ) {
              tabUrl = tabUrl.replace(
                `&start=${currentApiIndex}`,
                `&start=${currentPageIndex}`,
              );
            } else if (
              currentApiIndex &&
              !currentPageIndex &&
              currentPageIndex !== 0
            ) {
              tabUrl = tabUrl.replace(`&start=${currentApiIndex}`, '&start=0');
            }
          }
        }
        if (request.csrfToken) {
          chrome.tabs.sendMessage(
            tabId,
            {
              method: 'getPersonData',
              tk: request.csrfToken,
              url: tabUrl,
              request_method: tabMethod,
              params,
            },
            (response) => {
              if (!chrome.runtime.lastError) {
                if (response) {
                  if (response && response.data) {
                    people = getPeopleSSP(JSON.parse(response.data));
                  }
                } else {
                  people = undefined;
                }
                if (people && people.length > 0) {
                  const peopleInfo = {};
                  peopleInfo.oldurl = tab.url;
                  peopleInfo.people = people;
                  console.log('[Sales Navigator] Bulk View List', people);

                  // chrome.storage.local.set({ peopleInfo });
                }
              }
            },
          );
        }
      },
    );
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.status === 'complete' && tab.url.includes('linkedin.com')) {
      BGActionDo(tab, activeInfo.tabId);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    currentTabUrl = tab.url;

    if (currentTabUrl.includes('linkedin.com')) {
      BGActionDo(tab, tabId);
    }
  }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (
      details.url.indexOf('sales-api') > 0 ||
      details.url.indexOf('voyager/api/') > 0 ||
      details.url.indexOf('/talent/search/api/') > 0
    ) {
      for (let iNo = 0; iNo < details.requestHeaders.length; iNo++) {
        if (details.requestHeaders[iNo].name.toLowerCase() === 'csrf-token') {
          chrome.storage.local.set({
            csrfToken: details.requestHeaders[iNo].value,
          });
          console.log('csrfToken', details.requestHeaders[iNo].value);
          const localSv = [
            'salesApiPeopleSearch_url',
            'salesApiCompanySearch_url',
            'defaultApiPeopleSearch_url',
            'premiumApiPeopleSearch_url',
            'talentApiSearchPeople_url',
            'graphApiPeopleSearch_url',
          ];
          chrome.storage.local.get(localSv, (request) => {
            if (
              details.url.indexOf('salesApiPeopleSearch') > 0 ||
              details.url.indexOf('salesApiLeadSearch') > 0
            ) {
              let urls = {};
              if (request.salesApiPeopleSearch_url) {
                urls = JSON.parse(request.salesApiPeopleSearch_url);
              }
              urls[details.tabId] = {
                url: details.url,
                method: details.method,
              };
              chrome.storage.local.set({
                salesApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('salesApiCompanySearch') > 0) {
              let urls = {};
              if (request.salesApiCompanySearch_url) {
                urls = JSON.parse(request.salesApiCompanySearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                salesApiCompanySearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('voyager/api/search/blended') > 0) {
              let urls = {};
              if (request.defaultApiPeopleSearch_url) {
                urls = JSON.parse(request.defaultApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                defaultApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (
              details.url.indexOf('voyager/api/search/dash/clusters') > 0
            ) {
              let urls = {};
              if (request.premiumApiPeopleSearch_url) {
                urls = JSON.parse(request.premiumApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                premiumApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (
              details.url.indexOf('/voyager/api/graphql') > 0 &&
              details.url.indexOf('voyagerSearchDashClusters') > 0
            ) {
              let urls = {};
              if (request.graphApiPeopleSearch_url) {
                urls = JSON.parse(request.graphApiPeopleSearch_url);
              }
              urls[details.tabId] = details.url;
              chrome.storage.local.set({
                graphApiPeopleSearch_url: JSON.stringify(urls),
              });
            } else if (details.url.indexOf('talentRecruiterSearchHits') > 0) {
              let urls = {};
              if (request.talentApiSearchPeople_url) {
                urls = JSON.parse(request.talentApiSearchPeople_url);
              }
              urls[details.tabId] = {
                url: details.url,
                method: details.method,
              };
              chrome.storage.local.set({
                talentApiSearchPeople_url: JSON.stringify(urls),
              });
            }

            if (
              details.url.includes('voyager/api/graphql') &&
              details.url.includes('lazyLoadedActionsUrns')
            ) {
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  if (tabs.length > 0) {
                    const activeTab = tabs[0];

                    BGActionDo(activeTab, activeTab.id);
                    // You can access the tab details like activeTab.id, activeTab.url, activeTab.title, etc.
                  } else {
                    console.log('No active tab found.');
                  }
                },
              );
            }
          });
          break;
        }
      }
    }
    return {
      requestHeaders: details.requestHeaders,
    };
  },
  {
    urls: ['*://*.linkedin.com/*', '*://linkedin.com/*'],
  },
  ['requestHeaders'],
);
