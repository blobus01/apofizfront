import * as React from "react";
import * as classnames from "classnames";
import { ArrowRight, ClipboardIcon, LocationIcon, RemoveIcon } from "../Icons";
import { translate } from "../../../locales/locales";
import "./index.scss";

export const InputTextField = React.forwardRef((props, outerRef) => {
  const {
    label,
    name,
    hint,
    value,
    onClick,
    onChange,
    className,
    onCopy,
    error,
    onAdd,
    onRemove,
    showArrow,
    onMap,
    required,
    requiredError,
    renderRight,
    proceedFormInput,
    amountSize,
    color,
    ...other
  } = props;
  return (
    <div
      className={classnames(
        "input-text-field",
        error && "input-text-field_error",
        className,
      )}
    >
      <div className="input-text-field__input-group">
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          style={{
            paddingRight: onRemove || onCopy ? "60px" : "0",
            fontSize: amountSize ? "24px" : "",
            color: color ? color : "",
          }}
          placeholder={requiredError || " "}
          onClick={onClick}
          onChange={onChange}
          className={classnames(
            "input-text-field__input",
            value && "input-text-field__input-filled",
            proceedFormInput && "proceed-form-input",
          )}
          ref={outerRef}
          {...other}
        />
        {requiredError ? (
          <label
            className="input-text-field__label input-text-field__label--required-error"
            htmlFor={name}
          >
            {label}
          </label>
        ) : (
          <label className="input-text-field__label" htmlFor={name}>
            {label}
            {required && "*"}
          </label>
        )}
        {(onRemove || onCopy || showArrow || onMap || renderRight) && (
          <div className="input-text-field__tools">
            {onCopy && (
              <ClipboardIcon
                text={value}
                className="input-text-field__tools-copy"
              />
            )}
            {onRemove && (
              <RemoveIcon
                onClick={onRemove}
                className="input-text-field__tools-remove"
              />
            )}
            {showArrow && <ArrowRight />}
            {onMap && (
              <span className="input-text-field__map f-14" onClick={onMap}>
                <LocationIcon /> {translate("на карте", "org.onMap")}
              </span>
            )}
            {renderRight}
          </div>
        )}
      </div>
      <div
        className={classnames(
          "input-text-field__error",
          error && "input-text-field__error_visible",
        )}
      >
        {error}
      </div>
      {!error && hint && (
        <div className={classnames("input-text-field__hint")}>{hint}</div>
      )}
    </div>
  );
});
