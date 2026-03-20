import React from 'react';
import {
  acceptResumeRequestFromOrganization,
  declineResumeRequestFromOrganization
} from "../../../../../../store/services/resumeServices";
import AcceptanceView from "../../../Organization/AcceptanceView";

const InProgressView = ({id, refreshData}) => {
  const handleAccept = () => acceptResumeRequestFromOrganization({
    resume_request_id: id
  })

  const handleDecline = () => declineResumeRequestFromOrganization({
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