import React from 'react';
import InfoField from "../../../../components/UI/InfoField";
import Avatar from "../../../../components/UI/Avatar";

const UserField = ({label, user, description, ...rest}) => {
  const {full_name, avatar} = user
  return (
    <div {...rest}>
      <InfoField label={label}>
        <div className="row">
          <p className="tl" style={{flexGrow: 1, marginRight: 6}}>
            {full_name}
          </p>
          {avatar && avatar.small && <Avatar
            src={avatar.small}
            alt={full_name}
            size={24}
          />}
        </div>
      </InfoField>

      {description && (
        <p className="resume-request__description resume-request__sender-description">
          {description}
        </p>
      )}
    </div>
  );
};

export default UserField;