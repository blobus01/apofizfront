import React, {useState} from 'react';
import {InputTextField} from "../../../../../UI/InputTextField";
import {translate} from "../../../../../../locales/locales";
import {URL_REGEX} from "../../../../../../common/helpers";
import LinkCard from "../LinkCard";

const LinksField = ({links, onAdd, onRemove}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  const validateLink = link => {
    if (!URL_REGEX.test(link) && link.length > 0) {
      setError(translate('Необходимо указать валидную ссылку', 'hint.enterValidLink'))
      return false
    }
    if (links.includes(link)) {
      setError(translate('Ссылка уже существует', 'notify.linkAlreadyExist'))
      return false
    }
    error && setError(null)
    return true
  }

  const handleChange = e => {
    const value = e.target.value
    validateLink(value)
    setValue(value)
  }

  const handleSubmit = () => {
    const isValid = validateLink(value)
    isValid && onAdd(value)
    setValue('')
  }

  return (
    <div className="resume-form-main-view__links-field">
      <InputTextField
        value={value}
        onChange={handleChange}
        label={translate('Укажите ссылки ресурсы', 'hint.specifyLinks')}
        renderRight={!error && !!value && (
          <button type="button" onClick={handleSubmit} className="resume-form-main-view__links-field-add-btn f-14">
            {translate('Добавить', 'app.add')}
          </button>
        )}
        className="resume-form-main-view__links-field-input"
        error={error}
      />
      <div className="resume-form-main-view__links-field-links">
        {links.map(link => {
          return (
            <LinkCard
              key={link}
              link={link}
              onRemove={() => onRemove(link)}
            />
          )
        })}
      </div>
    </div>
  );
};

export default LinksField;