import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import {getMessage} from "../../common/helpers";
import {getQuery} from "../../common/utils";

export const createResume = async payload => {
  const response = await axios.post(Pathes.Resumes.resumes, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 201) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param {Object} params
 * @param [params.category]
 * @param [params.subcategory]
 * @param {Array<string|number>} [params.subcategories]
 * @param [params.country] country code (AE, RU etc.)
 * @param [params.city] id of city
 * @param [params.salary_from]
 * @param [params.salary_to]
 * @param [params.gender] GENDER enum
 * @param {boolean=} params.has_work_experience
 * @param {boolean=} params.has_education
 * @param {(null|'salary_to'|'salary_from')=} params.ordering
 * @param [params.search]
 * @param {Object} config
 */
export const getResumes = async (params, config) => {
  const response = await axios.get(Pathes.Resumes.resumes + getQuery(params), config)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param {FormData} formData to upload file. It should have 'file' field inside
 * which represents instance of File class
 * @param {Object=} config
 */
export const uploadResumeFile = async (formData, config) => {
  const response = await axios.post(Pathes.Resumes.files, formData, config);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 201) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeInfo = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumeInfo(resumeID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const updateResumeInfo = async payload => {
  const response = await axios.post(Pathes.Resumes.info, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getDetailResumeInfo = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumeDetailInfo(resumeID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.item id of a resume.
 * @param payload.text detail info.
 */
export const updateDetailResumeInfo = async payload => {
  const response = await axios.post(Pathes.Resumes.detailInfo, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeWorkExperience = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumeWorkExperiences(resumeID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @typedef WorkingExperience
 * @type {Object}
 * @property company_name
 * @property {string} position
 * @property text
 * @property start_of_work - format YYYY-MM-DD
 * @property end_of_work - format YYYY-MM-DD
 * @property {boolean} up_to_now
 */

/** @type {WorkingExperience} */

/**
 * @param payload.item id of a resume.
 * @param {WorkingExperience[]} payload.work_experiences
 */
export const updateResumeWorkExperience = async payload => {
  const response = await axios.post(Pathes.Resumes.workExperiences, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeEducationExperience = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumeEducationExperiences(resumeID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @typedef EducationExperience
 * @type {Object}
 * @property school_name
 * @property {string} category
 * @property text
 * @property start_of_study - format YYYY-MM-DD
 * @property end_of_study - format YYYY-MM-DD
 * @property {boolean} up_to_now
 */

/** @type {EducationExperience} */

/**
 * @param payload.item id of a resume.
 * @param {EducationExperience[]} payload.educations
 */
export const updateResumeEducationExperience = async payload => {
  const response = await axios.post(Pathes.Resumes.educationExperiences, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEducations = async params => {
  const response = await axios.get(Pathes.Resumes.educations + getQuery(params))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumePhoneNumbers = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumePhoneNumbers(resumeID))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.item id of a resume.
 * @param {String[]} payload.phone_numbers detail info.
 */
export const updateResumePhoneNumbers = async payload => {
  const response = await axios.post(Pathes.Resumes.phoneNumbers, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeSocials = async resumeID => {
  const response = await axios.get(Pathes.Resumes.resumeSocials(resumeID))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.item id of a resume.
 * @param {String[]} payload.urls detail info.
 */
export const updateResumeSocials = async payload => {
  const response = await axios.post(Pathes.Resumes.socials, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.sender_user
 * @param payload.organization
 * @param payload.item id of a resume
 * @param {Boolean} payload.show_contacts
 * @param {String[]} payload.phone_numbers
 * @param {String[]} payload.links
 * @param {String} payload.text
 */
export const requestResumeFromUser = async payload => {
  const response = await axios.post(Pathes.Resumes.userRequest, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeFromUser = async id => {
  const response = await axios.get(Pathes.Resumes.userRequestDetail(id))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.resume_request_id
 */
export const acceptResumeRequestFromUser = async payload => {
  const response = await axios.post(Pathes.Resumes.userRequestAccept, payload)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.resume_request_id
 */
export const declineResumeRequestFromUser = async payload => {
  const response = await axios.post(Pathes.Resumes.userRequestDecline, payload)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}


/**
 * @param payload.sender_organization
 * @param payload.organization
 * @param payload.item id of a resume
 * @param {Boolean} payload.show_contacts
 * @param {String[]} payload.phone_numbers
 * @param {String[]} payload.links
 * @param {String} payload.text
 */
export const requestResumeFromOrganization = async payload => {
  const response = await axios.post(Pathes.Resumes.organizationRequest, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getResumeFromOrganization = async id => {
  const response = await axios.get(Pathes.Resumes.organizationRequestDetail(id))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.resume_request_id
 */
export const acceptResumeRequestFromOrganization = async payload => {
  const response = await axios.post(Pathes.Resumes.organizationRequestAccept, payload)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param payload.resume_request_id
 */
export const declineResumeRequestFromOrganization = async payload => {
  const response = await axios.post(Pathes.Resumes.organizationRequestDecline, payload)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getUserResumes = async params => {
  const response = await axios.get(Pathes.Resumes.userResumes + getQuery(params))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationsWithResume = async params => {
  // TODO: change endpoint
  const response = await axios.get(Pathes.Home.search + getQuery(params))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

/**
 * @param {String} params.suggest_items search strong
 * @returns
 */
export const getSearchedResumes = async params => {
  const response = await axios.get(Pathes.Resumes.search + getQuery(params))

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}