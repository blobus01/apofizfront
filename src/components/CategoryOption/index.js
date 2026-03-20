import React from "react";
import PropTypes from "prop-types";
import * as classnames from "classnames";
import { ArrowRight } from "../UI/Icons";
import "./index.scss";

export const CategoryOption = ({
  label,
  descPosition,
  description,
  showArrow = true,
  renderRight,
  className,
  onClick,
  icon,
  subcategory,
  ...props
}) => {
  let content;
  const renderIcon = () =>
    icon ? (
      icon.file ? (
        <span className="category-option__image_bg">
          <img src={icon.file} alt={label} />
        </span>
      ) : (
        <div className="category-option__icon-container">{icon}</div>
      )
    ) : null;

  if (descPosition === "underLabel" || descPosition === "underContent") {
    content = (
      <>
        <div className="category-option__left">
          {descPosition === "underContent" ? (
            <p className="f-16 tl">
              {renderIcon()}
              <span className="category-option__title">{label}</span>
            </p>
          ) : (
            <div className="category-option__content f-16 tl">
              {renderIcon()}
              <div>
                <span className="category-option__title">{label}</span>
                <p
                  style={{ color: subcategory ? "#007AFF" : "" }}
                  className="f-14"
                >
                  {description || subcategory}
                </p>
              </div>
            </div>
          )}
          {descPosition === "underContent" && (
            <p className="f-14">{description}</p>
          )}
        </div>
        {showArrow && !renderRight && (
          <ArrowRight className="category-option__icon" />
        )}
        {renderRight && renderRight()}
      </>
    );
  } else if (descPosition === "nearIcon") {
    content = (
      <>
        <div className="category-option__left">
          <p className="f-16 tl">
            {icon && icon.file && (
              <span className="category-option__image_bg">
                <img src={icon.file} alt={label} />
              </span>
            )}
            <span className="category-option__title">{label}</span>
          </p>
        </div>
        <div className="category-option__right row">
          <p className="category-option__desc f-16">{description}</p>
          {showArrow && !renderRight && (
            <ArrowRight className="category-option__icon" />
          )}
          {renderRight && renderRight()}
        </div>
      </>
    );
  }
  return (
    <div
      className={classnames("category-option row", className)}
      onClick={onClick}
    >
      {content}
    </div>
  );
};

CategoryOption.propTypes = {
  descPosition: PropTypes.oneOf(["underLabel", "underContent", "nearIcon"]),
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CategoryOption.defaultProps = {
  descPosition: "underContent",
};
