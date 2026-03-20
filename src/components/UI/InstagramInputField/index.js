import React from "react";
import { translate } from "../../../locales/locales";
import "./index.scss";

const InstagramInputField = ({ name, value, onChange, error }) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    placeholder={translate("ссылка на instagram", "app.instagramLink")}
    className={`instagram-input-field ${error ? "errorColor" : ""}`}
  />
);

export default InstagramInputField;
