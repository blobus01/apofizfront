import React from 'react';
import {
  acceptResumeRequestFromUser,
  declineResumeRequestFromUser
} from "../../../../../store/services/resumeServices";
import AcceptanceView from "../AcceptanceView";

const InProgressView = ({id, refreshData}) => {
  const handleAccept = () => acceptResumeRequestFromUser({
    resume_request_id: id
  })

  const handleDecline = () => declineResumeRequestFromUser({
    resume_request_id: id
  })

  return (
    <AcceptanceView
      onAccept={handleAccept}
      onDecline={handleDecline}
      onSuccess={refreshData}
    />
  )
};

export default InProgressView;