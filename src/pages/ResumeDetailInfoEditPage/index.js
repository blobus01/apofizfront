import React from 'react';
import {useParams} from "react-router-dom";
import ResumeDetailInfo from "../../containers/ResumeDetailInfo";

const ResumeDetailInfoEditPage = () => {
  const {id} = useParams()

  return (
    <ResumeDetailInfo
      id={id}
      canEdit
    />
  );
};

export default ResumeDetailInfoEditPage;