import React from 'react';
import classNames from "classnames";
import {AddIcon} from "../UI/Icons";
import DivButton from "../DivButton";
import "./index.scss"

const HorizontalListField = ({label, children, onAdd, disabled, className}) => {
  const hasItems = children && !!children.length
  return (
    <DivButton
      className={classNames('horizontal-list-field', className)}
      onClick={onAdd}
      disabled={hasItems || disabled}
    >
      <p className={classNames('horizontal-list-field__label',
        children && children.length > 0 && 'horizontal-list-field__label--shrink',
      )}>
        {label}
      </p>
      <div className="horizontal-list-field__list">
        {React.Children.map(children, item => {
          return <HorizontalListFieldItem
            {...item.props}
            disabled={disabled}
          />
        })}
        {hasItems && onAdd && !disabled && (
          <button type="button" onClick={onAdd} className="horizontal-list-field__add-btn">
            <AddIcon/>
          </button>
        )}
      </div>
    </DivButton>
  );
};

export const HorizontalListFieldItem = ({text, onDelete, disabled}) => {
  return (
    <button type="button" className="horizontal-list-field__item f-14" onClick={onDelete} disabled={disabled}>
      <span className="horizontal-list-field__item-text">
        {text}
      </span>
      {!disabled && <CancelIcon/>}
    </button>
  )
}

const CancelIcon = (props) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.16988 4.6609C8.21791 4.61612 8.25665 4.56232 8.28389 4.50257C8.31113 4.44281 8.32633 4.37828 8.32863 4.31265C8.33093 4.24703 8.32028 4.18159 8.29729 4.12008C8.2743 4.05856 8.23941 4.00218 8.19463 3.95415C8.14985 3.90612 8.09605 3.86738 8.0363 3.84014C7.97654 3.81291 7.91201 3.7977 7.84638 3.7954C7.78076 3.79311 7.71532 3.80376 7.65381 3.82675C7.59229 3.84974 7.53591 3.88462 7.48788 3.9294L6.02488 5.2934L4.66088 3.8299C4.56962 3.73642 4.44539 3.68238 4.31478 3.67934C4.18417 3.67629 4.05756 3.72448 3.96204 3.81361C3.86651 3.90273 3.80966 4.0257 3.80365 4.1562C3.79764 4.28671 3.84295 4.41438 3.92988 4.5119L5.29388 5.9749L3.83038 7.3389C3.78066 7.38323 3.74029 7.43705 3.71165 7.49719C3.68301 7.55734 3.66668 7.6226 3.66362 7.68915C3.66055 7.75569 3.67082 7.82218 3.69381 7.8847C3.7168 7.94722 3.75205 8.00452 3.79749 8.05323C3.84294 8.10194 3.89765 8.14108 3.95843 8.16834C4.01921 8.19561 4.08483 8.21045 4.15143 8.21201C4.21803 8.21356 4.28426 8.20179 4.34625 8.17739C4.40823 8.15298 4.46472 8.11644 4.51238 8.0699L5.97538 6.7064L7.33938 8.1694C7.38342 8.22005 7.43721 8.26131 7.49754 8.29072C7.55787 8.32014 7.6235 8.33711 7.69052 8.34062C7.75755 8.34413 7.8246 8.33411 7.88767 8.31116C7.95074 8.28821 8.00854 8.25279 8.05763 8.20702C8.10672 8.16126 8.1461 8.10607 8.17341 8.04476C8.20072 7.98345 8.21541 7.91727 8.2166 7.85017C8.21779 7.78306 8.20546 7.7164 8.18034 7.65416C8.15522 7.59193 8.11782 7.53538 8.07038 7.4879L6.70688 6.0249L8.16988 4.6609Z"
      fill="#007AFF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.5 6C0.5 2.9625 2.9625 0.5 6 0.5C9.0375 0.5 11.5 2.9625 11.5 6C11.5 9.0375 9.0375 11.5 6 11.5C2.9625 11.5 0.5 9.0375 0.5 6ZM6 10.5C5.40905 10.5 4.82389 10.3836 4.27792 10.1575C3.73196 9.93131 3.23588 9.59984 2.81802 9.18198C2.40016 8.76412 2.06869 8.26804 1.84254 7.72208C1.6164 7.17611 1.5 6.59095 1.5 6C1.5 5.40905 1.6164 4.82389 1.84254 4.27792C2.06869 3.73196 2.40016 3.23588 2.81802 2.81802C3.23588 2.40016 3.73196 2.06869 4.27792 1.84254C4.82389 1.6164 5.40905 1.5 6 1.5C7.19347 1.5 8.33807 1.97411 9.18198 2.81802C10.0259 3.66193 10.5 4.80653 10.5 6C10.5 7.19347 10.0259 8.33807 9.18198 9.18198C8.33807 10.0259 7.19347 10.5 6 10.5Z"
      fill="#007AFF"
    />
  </svg>
);

export default HorizontalListField;