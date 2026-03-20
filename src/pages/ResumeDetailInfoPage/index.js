import React from 'react';
import {useParams} from "react-router-dom";
import ResumeDetailInfo from "../../containers/ResumeDetailInfo";

const ResumeDetailInfoPage = () => {
  const {id} = useParams()

  return (
    <ResumeDetailInfo
      id={id}
    />
  );
};

export default ResumeDetailInfoPage;