import React from 'react';
import RentDetailStatisticsModule from "../../containers/RentDetailStatisticsModule";
import {useParams} from "react-router-dom";

const RentDetailStatisticsPage = () => {
  const {id: orgID, rentID} = useParams()
  return <RentDetailStatisticsModule rentID={rentID} orgID={orgID} />
};

export default RentDetailStatisticsPage;