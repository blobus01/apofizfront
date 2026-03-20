import classNames from "classnames";
import "./index.scss";
import { useState } from "react";
import { CopyApi } from "./icons";
import Notify from "@components/Notification";
import { translate } from "@locales/locales";

const maskApiKey = (key) => {
  if (!key) return "";

  const visible = 4;
  const start = key.slice(0, visible);
  const maskedLength = Math.max(key.length - visible, 4);

  return `${start}${"*".repeat(maskedLength)}`;
};
const ApiFormInput = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  style,
  keyApi,
}) => {
  const hasError = touched && error;
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      Notify.success({
        text: translate("Скопирован", "app.copied"),
      });

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div
      className={classNames(
        "api-settings__field",
        !value && "api-settings__field_error",
      )}
    >
      <label
        htmlFor={id}
        className={classNames(
          "api-settings__label",
          !value && "api-settings__label_error",
        )}
      >
        {label}
      </label>

      <div
        className="api-settings__input-wrapper"
        style={{ display: "flex", alignItems: "center" }}
      >
        <input
          id={id}
          name={name}
          type="text"
          value={keyApi ? maskApiKey(value) : value}
          onChange={onChange}
          onBlur={onBlur}
          style={style}
          placeholder={placeholder}
          className={classNames(
            "api-settings__native-input",
            keyApi && "api-settings__native-input_key",
            hasError && "api-settings__native-input_error",
          )}
        />

        {keyApi && value && (
          <button
            type="button"
            className="api-settings__copy-btn"
            onClick={handleCopy}
          >
            <CopyApi />
          </button>
        )}
      </div>

      {hasError ? <div className="api-settings__error">{error}</div> : null}
    </div>
  );
};

export default ApiFormInput;
