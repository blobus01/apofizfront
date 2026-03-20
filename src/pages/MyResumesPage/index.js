import React from 'react';
import MyResumes from "../../containers/MyResumes";

const MyResumesPage = ({history}) => {
  const goBack = () => history.goBack()
  return (
    <MyResumes
      onBack={goBack}
      onSubmit={goBack}
    />
  );
};

export default MyResumesPage;