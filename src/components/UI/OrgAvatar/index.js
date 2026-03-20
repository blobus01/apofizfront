import React from "react";
import PropTypes from "prop-types";
import * as classnames from "classnames";
import "./index.scss";

const OrgAvatar = ({
  src,
  alt,
  size,
  borderRadius,
  className,
  gridAvatar,
  shadow,
  darkTheme,
  ...rest
}) => {
  const [imageError, setImageError] = React.useState(false);
  const style = {
    width: size,
    minWidth: size,
    height: size,
    minHeight: size,
    borderRadius,
    cursor: 'pointer'
  };

  return (
    <div className={classnames("org-avatar", className)} style={style}>
      {imageError ? (
        <span
          style={{
            display: "block",
            padding: "10px",
            textAlign: "center",
            color: "#818C99",
          }}
        >
          Фото нет
        </span>
      ) : (
        <img
          className="org-avatar__image"
          loading="lazy"
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          {...rest}
        />
      )}
    </div>
  );
};

OrgAvatar.defaultProps = {
  src: "",
  alt: "Organization Logo",
  size: 72,
  borderRadius: "12px",
};

OrgAvatar.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default OrgAvatar;
