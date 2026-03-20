import React from 'react';
import PropTypes from "prop-types";
import BorderedTextarea from "../../../../components/UI/BorderedTextarea";
import {translate} from "../../../../locales/locales";
import classNames from "classnames";

const EmployerInfo = ({data, className}) => {
  const {description, phoneNumbers, links} = data
  return (
    <div className={classNames('resume-request__employer-info', className)}>
      {description && (
        <BorderedTextarea
          value={description}
          className="resume-request__employer-info-textarea"
          disabled
        />
      )}

      {phoneNumbers && phoneNumbers.map((PH, idx) => {
        return <LinkField
          label={translate("Контактный номер", "app.contactNumber")}
          href={`tel:${PH}`}
          key={PH + idx}
        >
          {PH}
        </LinkField>
      })}

      {links && links.map((link, idx) => {
        return <LinkField
          label={translate("Социальные сети", "org.socialNetworks")}
          href={link}
          target="_blank"
          rel="noreferrer"
          key={link + idx}
        >
          {link}
        </LinkField>
      })}
    </div>
  );
};

const LinkField = ({label, children, ...rest}) => {
  return (
    <div className="resume-request__employer-info-link-field">
      <p className="resume-request__employer-info-link-field-label tl f-14">
        {label}
      </p>
      <a className="resume-request__employer-info-link f-17 f-500" {...rest}>
        {children}
      </a>
    </div>
  )
}

EmployerInfo.propTypes = {
  data: PropTypes.shape({
    phoneNumbers: PropTypes.arrayOf(PropTypes.string),
    links: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
  })
}

export default EmployerInfo;