import React from 'react';
import classNames from "classnames";

const InfoBox = ({title, description, acceptText, declinedText, className}) => {
  return (
    <div className={classNames('resume-request__info-box', className)}>
      <h3 className="resume-request__info-box-title f-17 f-500">
        {title}
      </h3>

      <p className="resume-request__info-box-desc f-14">
        {description}
      </p>

      {acceptText && (
        <p className="resume-request__info-box-accept-text f-17">
          {acceptText}
        </p>
      )}

      {declinedText && (
        <p className="resume-request__info-box-declined-text f-17">
          {declinedText }
        </p>
      )}
    </div>
  );
};

export default InfoBox;