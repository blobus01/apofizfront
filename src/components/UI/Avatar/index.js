import * as React from "react";
import * as classnames from "classnames";
import { GENDER } from "../../../common/constants";
import { ProfileImageIcon } from "../Icons";
import PropTypes from "prop-types";
import "./index.scss";

const Avatar = ({
  src,
  alt,
  size,
  gender,
  error,
  borderRadius,
  withBorder,
  className,
  style,
}) => {
  const [errorOnLoadImage, setErrorOnLoadImage] = React.useState(false);

  let image;

  if (src && !errorOnLoadImage) {
    image = (
      <img
        src={src}
        alt={alt}
        onError={() => setErrorOnLoadImage(true)}
        className="avatar__image"
      />
    );
  } else if (gender === GENDER.female) {
    image = (
      <ProfileImageIcon className="avatar__gender-image avatar__gender-image--female" />
    );
  } else if (gender === GENDER.male) {
    image = (
      <ProfileImageIcon className="avatar__gender-image avatar__gender-image--male" />
    );
  } else {
    image = (
      <ProfileImageIcon className="avatar__gender-image avatar__gender-image--not-chosen" />
    );
  }

  return (
    <div
      className={classnames(
        "avatar__container",
        error && "avatar__error",
        withBorder && "avatar__bordered",
        className
      )}
      style={{
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
        minWidth: size,
        minHeight: size,
        borderRadius: style?.borderRadius || borderRadius,
      }}
    >
      {image}
    </div>
  );
};

Avatar.defaultProps = {
  src: "",
  alt: "Avatar",
  size: 132,
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.number,
  gender: PropTypes.string,
  className: PropTypes.string,
};

export default Avatar;
