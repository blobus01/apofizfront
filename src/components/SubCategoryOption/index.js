import React from "react";
import * as classnames from "classnames";
import { DoneIcon, EditIcon } from "../UI/Icons";
import "./index.scss";
import { translate } from "@locales/locales";

export const SubCategoryOption = ({
  label,
  isActive,
  option,
  icon,
  className,
  onClick,
  onEdit,
  sub_icon,
}) => (
  <div
    className={classnames(
      "subcategory-option",
      "row",
      isActive && "active",
      className,
    )}
    onClick={onClick}
  >
    {onEdit ? (
      <div className="subcategory-option__edit">
        {sub_icon ? (
          <img
            className=""
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "11px",
              objectFit: "cover",
            }}
            src={sub_icon?.file}
            alt={label}
          />
        ) : (
          <span className="category-option__image_bg">
            <img src={icon?.file} alt={label} />
          </span>
        )}

        <div className="subcategory-option__edit-info">
          <p className="subcategory-option__label f-16 tl">{label}</p>
          <button
            type="button"
            className="subcategory-option__edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(option);
            }}
          >
            {translate("Редактировать", "app.toEdit")}
            <EditIcon />
          </button>
        </div>
      </div>
    ) : (
      <p className="subcategory-option__label f-16 tl">
        {icon && icon.file && (
          <span className="category-option__image_bg">
            <img src={icon.file} alt={label} />
          </span>
        )}
        {label}
      </p>
    )}
    <DoneIcon className="subcategory-option__icon" />
  </div>
);
