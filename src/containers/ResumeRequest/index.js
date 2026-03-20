import "./index.scss"

import React from 'react';
import PropTypes from "prop-types";
import UserResumeRequest from "./views/UserResumeRequest";
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {useHistory} from "react-router-dom";
import {SENDERS, VIEWS} from "./constants";
import OrganizationResumeRequest from "./views/OrganizationResumeRequest";

const ResumeRequest = ({id, sender, view}) => {
  const history = useHistory()

  let content = null
  switch (sender) {
    case SENDERS.user:
      content = <UserResumeRequest
        id={id}
        view={view}
      />
      break
    case SENDERS.organization:
      content = <OrganizationResumeRequest
        id={id}
        view={view}
      />
      break
    default:
      break
  }

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate('Запрос на вакансию', 'resumes.resumeRequest')}
        className="resume-request__header"
      />
      <div className="resume-request__container">
        {content}
      </div>
    </>
  )
};

ResumeRequest.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sender: PropTypes.oneOf(Object.values(SENDERS)).isRequired,
  view: PropTypes.oneOf(Object.values(VIEWS)).isRequired,
}

export default ResumeRequest;