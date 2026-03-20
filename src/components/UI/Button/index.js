import * as React from "react";
import * as classnames from "classnames";
import Preloader from "../../Preloader";
import "./index.scss";

const Button = ({ label, type, className, loading, ...other }) => (
  <button
    type={type || "button"}
    className={classnames("button", className)}
    {...other}
  >
    {loading && <Preloader className="preloader__btn" />}
    {typeof label === "function" ? (
      label()
    ) : (
      <span className="button__label f-15 f-500">{label}</span>
    )}
  </button>
);

export default Button;
