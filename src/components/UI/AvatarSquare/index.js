import * as React from "react";
import * as classnames from "classnames";
import "./index.scss";

const AvatarSquare = ({ src, alt, className, size = 60 }) => {
  const [imageError, setImageError] = React.useState(false);
  return (
    <div
      className={classnames("avatar-square__container", className)}
      style={{
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
        minWidth: size,
        minHeight: size,
      }}
    >
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
          src={src}
          alt={alt || "Organization"}
          className="avatar-square__image"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default AvatarSquare;
