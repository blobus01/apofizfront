import React from "react";
import * as classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import "./index.scss";
import { translate } from "@locales/locales";

const TextareaField = ({
  value,
  error,
  onChange,
  placeholder,
  name,
  minRows,
  maxRows,
  limit,
  onClick,
  autofocus,
  className,
  hasPlaceholder,
  bottom
}) => (
  <>
    <div
      className={classnames(
        "textarea-field__wrap",
        error && "error",
        className,
      )}
      onClick={onClick}
      style={{ borderBottom: "1px solid #ebedf0", marginBottom: bottom ? bottom : 0 }}
    >
      <div className="textarea-field__group">
        <TextareaAutosize
          id={name}
          name={name}
          placeholder={
            hasPlaceholder
              ? translate(
                  "Генерация описания с AI \n\n Вы можете использовать генерацию описания организации с помощью AI.\nНапишите пару строк о вашей организации или опишите, каким должно быть описание, затем нажмите кнопку «Генерировать с AI». Пару секунд и описание готово.\n\nЕсли вы введёте свой текст и нажмёте «Сохранить» без использования AI, будет сохранено именно ваше описание.",
                  "ai.description.placeholder",
                )
              : " "
          }
          value={value}
          autoFocus={autofocus}
          maxRows={maxRows}
          minRows={minRows}
          onChange={onChange}
          className={classnames(
            "textarea-field",
            error && "textarea-field__error",
            value && "textarea-field-filled",
          )}
        />
        <label className="textarea-field__label" htmlFor={name}>
          {placeholder}
        </label>
      </div>
    </div>
    {limit ? (
      <div className="textarea-field__counter f-13">
        <span className={classnames(value.length > limit && "error")}>
          {value.length}
        </span>
        /{limit}
      </div>
    ) : (
      error && (
        <div className={classnames("textarea-field__error-text")}>{error}</div>
      )
    )}
  </>
);

export default TextareaField;
