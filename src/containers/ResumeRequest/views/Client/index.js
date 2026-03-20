import React from 'react';
import {RESUME_REQUEST_STATUSES} from "../../constants";
import InProgressView from "./InProgressView";
import AcceptedView from "./AcceptedView";
import DeclinedView from "./DeclinedView";

const ClientView = ({data}) => {
  const {status} = data

  switch (status) {
    case RESUME_REQUEST_STATUSES.in_progress:
      return <InProgressView/>
    case RESUME_REQUEST_STATUSES.accepted:
      return <AcceptedView data={data}/>
    case RESUME_REQUEST_STATUSES.rejected:
      return <DeclinedView processedBy={data.processed_by}/>
    default:
      return null
  }
}

export default ClientView;