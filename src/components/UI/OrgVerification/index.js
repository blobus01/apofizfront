import React from 'react';
import {SharpeVerifiedIcon} from "../Icons";
import "./index.scss";
import classnames from "classnames";
import {translate} from "../../../locales/locales";

const OrgVerification = ({componentText, status, className}) => {
  return (
    <>
      {status === 'verified' && (
        <span className={classnames("organization-verification organization-verification--verified", className)}>
          <SharpeVerifiedIcon/>
          {componentText && translate("Организация верифицирована", "org.verified")}
        </span>
      )}
    </>
  );
};

export default OrgVerification;