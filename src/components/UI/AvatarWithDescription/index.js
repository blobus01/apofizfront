import React from "react";
import Avatar from "../Avatar";

import "./index.scss";

const AvatarWithDescription = ({ className, name, desc, ...rest }) => {
  return (
    <div className={`avatar-with-description ${className ?? ""}`}>
      <Avatar
        className={`avatar-with-description__avatar avatar__bordered`}
        {...rest}
      />
      <div className="avatar-with-description__desc">
        <h4 className="f-15 f-700">{name}</h4>
        <p className="avatar-with-description__desc-paragraph f-14 f-500">
          {desc}
        </p>
      </div>
    </div>
  );
};

export default AvatarWithDescription;
