import React, { useRef } from "react";
import * as classnames from "classnames";
import { QuestionIcon } from "../Icons";
import "./index.scss";
import { ALLOWED_FORMATS } from "../../../common/constants";

export const StandardButton = ({ label, onClick, className, ...other }) => (
  <button
    type="button"
    onClick={onClick}
    className={classnames("standard-button", className)}
    {...other}
  >
    <span className="standard-button__label f-600 f-14">{label}</span>
  </button>
);

export const ButtonUpload = ({
  name,
  multiple,
  onChange,
  error,
  className,
}) => {
  const inputRef = useRef();

  const hookedOnChange = (e) => {
    e.persist?.();
    onChange(e, name); // 👈 теперь передаём name (например, "productImages" или "backgroundImages")
    inputRef.current.value = ""; // 👈 сбрасываем input, чтобы можно было выбрать то же фото снова
  };

  return (
    <label
      htmlFor={name}
      className={classnames("button-upload", error && "error", className)}
    >
      {/* SVG остался как у тебя */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C12.4971 3 12.9 3.40293 12.9 3.89996L12.9 11.1L20.1 11.1C20.5971 11.1 21 11.503 21 12C21 12.497 20.5971 12.9 20.1 12.9L12.9 12.899L12.9 20.1001C12.9 20.5972 12.4971 21.0001 12 21.0001C11.503 21.0001 11.1001 20.5972 11.1001 20.1001L11.1 12.899L3.89995 12.9C3.40292 12.9 3 12.497 3 12C3 11.503 3.40292 11.1 3.89995 11.1L11.1 11.1L11.1001 3.89996C11.1001 3.40293 11.503 3 12 3Z"
          fill="#4285F4"
        />
      </svg>

      <input
        ref={inputRef}
        type="file"
        id={name}
        name={name}
        multiple={multiple}
        accept={ALLOWED_FORMATS.join(",")}
        onChange={hookedOnChange}
      />
    </label>
  );
};

export const ButtonWithContent = ({
  label,
  className,
  children,
  onRightClick,
  position,
  radiusOrg,
  bottom = false,
  backgroundRight,
  backgroundAll,
  ...other
}) => (
  <button
    type="button"
    {...other}
    className={classnames("button-with-content", className)}
    style={{
      marginBottom: "20px",
      borderRadius: radiusOrg ? "16px" : "11px",
      border: "none",
      boxShadow: radiusOrg
        ? "0 0 0 1px #fff, 0px 3px 10px rgba(0, 0, 0, 0.25)"
        : "none",
      maxWidth: radiusOrg ? "600px" : "100%",
      margin: position ? "0 5px" : "0 auto",
      position: position ? "fixed" : "static",

      left: position ? "50%" : 0,
      bottom: position && !bottom ? "90px" : bottom || 0,
      transform: position ? "translateX(-50%)" : 0,

      width: position ? "96%" : "",

      background: backgroundAll ? backgroundAll : "",
    }}
  >
    <span className="button-with-content__label tl f-15 f-600">{label}</span>
    <span
      className="button-with-content__extra"
      onClick={(e) => {
        e.stopPropagation();
        onRightClick && onRightClick();
      }}
      style={{ background: backgroundRight ? backgroundRight : "" }}
    >
      {children ? (
        children
      ) : (
        <QuestionIcon className="button-with-content__question" />
      )}
    </span>
  </button>
);

export const ButtonSpaceBetween = ({ label1, label2, className, ...other }) => (
  <button type="button" className="button-space-between row" {...other}>
    <span className="f-15 f-400">{label1}</span>
    <span className="f-15 f-400">{label2}</span>
  </button>
);
