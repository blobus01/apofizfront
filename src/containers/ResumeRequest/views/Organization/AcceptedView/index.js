import React from 'react';
import EmployerInfo from "../../../component/EmployerInfo";
import "./index.scss"

const AcceptedView = ({data}) => {
  return (
    <EmployerInfo
      data={{
        description: data.text,
        phoneNumbers: data.phone_numbers,
        links: data.links,
      }}
    />
  );
};

export default AcceptedView;