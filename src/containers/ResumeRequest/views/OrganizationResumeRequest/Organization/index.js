import React from 'react';
import {RESUME_REQUEST_STATUSES} from "../../../constants";
import InProgressView from "./InProgressView";
import DeclinedView from "../../Organization/DeclinedView";
import AcceptedView from "../../Organization/AcceptedView";

const OrganizationView = ({data, refreshData}) => {
  const {id, status} = data

  switch (status) {
    case RESUME_REQUEST_STATUSES.in_progress:
      return (
        <InProgressView
          id={id}
          refreshData={refreshData}
        />
      )
    case RESUME_REQUEST_STATUSES.accepted:
      return (
        <AcceptedView
          data={data}
        />
      )
    case RESUME_REQUEST_STATUSES.rejected:
      return (
        <DeclinedView/>
      )

    default:
      return null
  }
}

export default OrganizationView;