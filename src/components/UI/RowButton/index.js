import React from "react";
import * as classnames from "classnames";
import { ArrowRight } from "../Icons";
import { MyLink } from "../../MyLink";
import "./index.scss";

export const ROW_BUTTON_TYPES = {
  button: "button",
  link: "link",
};

const RowButton = ({
  label,
  children,
  showArrow = true,
  endIcon,
  ...other
}) => (
  <Wrapper {...other}>
    <div className="row-button__left dfc">
      {children}
      <span className="row-button__label">{label}</span>
    </div>
    {showArrow && !endIcon ? <ArrowRight /> : endIcon}
  </Wrapper>
);

export default RowButton;

const Wrapper = ({
  type = ROW_BUTTON_TYPES.button,
  onClick,
  to,
  className,
  children,
  ...other
}) =>
  type === ROW_BUTTON_TYPES.button ? (
    <button
      type="button"
      onClick={onClick}
      className={classnames("row-button row", className)}
      {...other}
    >
      {children}
    </button>
  ) : (
    <MyLink
      to={to} // ← ВАЖНО: передаём to, НЕ href
      className={classnames("row-button row-button row", className)}
      onClick={onClick}
      {...other}
    >
      {children}
    </MyLink>
  );
