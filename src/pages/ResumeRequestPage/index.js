import React from 'react';
import ResumeRequest from "../../containers/ResumeRequest";

const ResumeRequestPage = ({match}) => {
  const {id, sender, view} = match.params

  return (
    <ResumeRequest
      id={id}
      sender={sender}
      view={view}
    />
  );
};

export default ResumeRequestPage;