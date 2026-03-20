import React from 'react';
import * as Yup from "yup";
import {FieldArray, Formik, useFormikContext} from "formik";
import RowToggle from "../../UI/RowToggle";
import classNames from "classnames";
import UserIcon from "../../UI/Icons/UserIcon";
import {translate} from "../../../locales/locales";
import {InputTextField} from "../../UI/InputTextField";
import {getRandom, PHONE_NUMBER} from "../../../common/helpers";
import {MESSAGE_CHAR_LIMIT} from "../../../common/constants";
import BorderedTextarea from "../../UI/BorderedTextarea";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../UI/WideButton";
import "./index.scss"

export const FIELDS = Object.freeze({
  include_contacts: 'include_contacts',
  phone_numbers: 'phone_numbers',
  links: 'links',
  description: 'description',

})

const {include_contacts, phone_numbers, links, description} = FIELDS


export const PHONE_NUMBER_FIELDS = Object.freeze({
  id: 'id',
  phone_number: 'phone_number',
})

export const LINK_FIELDS = Object.freeze({
  id: 'id',
  url: 'url',
})

const MAX_PHONE_NUMBER_LENGTH = 15


// TODO: add url validation
const VALIDATION_SCHEMA = Yup.object().shape({
  [include_contacts]: Yup.bool(),
  [phone_numbers]: Yup.array(Yup.object({
    [PHONE_NUMBER_FIELDS.id]: Yup.mixed(),
    [PHONE_NUMBER_FIELDS.phone_number]: Yup
      .string()
  })),
  [links]: Yup.array().of(
    Yup.object().shape({
      [LINK_FIELDS.id]: Yup
        .string(),
      [LINK_FIELDS.url]: Yup
        .string()
    })
  ),
  [description]: Yup.string(),
})

const ResumeRequestForm = ({initialValues, onSubmit, fieldsInfo, className}) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {({values, handleChange, handleSubmit, isSubmitting, errors, touched}) => {
        return (
          <form onSubmit={handleSubmit} className={classNames('resume-request-form', className)}>
            <div className="resume-request-form__fields">
              <RowToggle
                name={include_contacts}
                checked={values[include_contacts]}
                onChange={handleChange}
                icon={fieldsInfo[include_contacts].icon}
                label={fieldsInfo[include_contacts].label}
                className={classNames('resume-request-form__field',
                  'resume-request-form__row-toggle', 'resume-request-form__light-text')}
              />
              {fieldsInfo[include_contacts].description && (
                <p className="resume-request-form__desc-text">
                  {fieldsInfo[include_contacts].description}
                </p>
              )}

              <PhoneNumbersArrayField
                name={phone_numbers}
              />

              <LinksArrayField
                name={links}
              />

              <InputTextField
                value={translate('Ваш запрос будет содержать данный текст', 'resumes.resumeRequestForm.description')}
                disabled
              />
              <p className="resume-request-form__desc-text">
                {translate('Вы можете отформатировать данный запрос и добавить свои условия', 'resumes.resumeRequestForm.descriptionDesc')}
              </p>

              <BorderedTextarea
                name={description}
                value={values[description]}
                onChange={handleChange}
                placeholder={translate('В данном поле опишите подробнее', 'resumes.workExperience.description')}
                isError={touched[description] && !!errors[description]}
                maxLength={MESSAGE_CHAR_LIMIT}
                className="resume-request-form__textarea"
              />
            </div>

            <div className="resume-request-form__bottom container">
              <WideButton type="submit" variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED} loading={isSubmitting}>
                {translate('Отправить запрос', 'org.sendRequest')}
              </WideButton>
            </div>
          </form>
        )
      }}
    </Formik>
  );
};


const PhoneNumbersArrayField = ({name}) => {
  const {
    values,
    touched,
    handleChange,
    setFieldValue,
    errors
  } = useFormikContext()

  return (
    <FieldArray
      name={name}
      render={arrayHelpers => (
        <div className="resume-request-form__array-field">
          {values[name].map((num, idx) => {
            const inputName = `${name}[${idx}][${PHONE_NUMBER_FIELDS.phone_number}]`
            const value = num[PHONE_NUMBER_FIELDS.phone_number]
            return (
              <InputTextField
                key={num.id}
                name={inputName}
                label={translate('Контактный номер', 'app.contactNumber')}
                value={value || `+ ${translate('Укажите контактный номер', 'hint.enterContactNumber')}`}
                onChange={(e) => {
                  const {value} = e.target
                  if (value.match(PHONE_NUMBER) && value.length - 1 <= MAX_PHONE_NUMBER_LENGTH) {
                    handleChange(e)
                  }
                }}
                onRemove={idx !== 0 ? () => arrayHelpers.remove(idx) : null}
                error={errors[name] && touched[name] && touched[name][idx] && errors[name][idx] && errors[name][idx][PHONE_NUMBER_FIELDS.phone_number]}
                onFocus={() => !value && setFieldValue(inputName, '+')}
                onBlur={() => value.length === 1 && setFieldValue(inputName, '')}
                className="resume-request-form__array-field-input"
                inputMode="numeric"
              />
            )
          })}

          <button className="resume-request-form__add-number-btn resume-request-form__light-text f-14"
                  type="button"
                  onClick={() => arrayHelpers.push({
                    [LINK_FIELDS.id]: getRandom(400, 999),
                    [LINK_FIELDS.url]: ''
                  })}>
            {translate('Добавить дополнительный номер', 'org.addExtraPhoneNumber')}
          </button>
        </div>
      )}
    />
  )
}

const LinksArrayField = ({name}) => {
  const {
    values,
    touched,
    handleChange,
    errors
  } = useFormikContext()

  return (
    <FieldArray
      name={name}
      render={arrayHelpers => (
        <div className="resume-request-form__array-field">
          {values[name].map((num, idx) => {
            const inputName = `${name}[${idx}][${LINK_FIELDS.url}]`
            const value = num[LINK_FIELDS.url]
            return (
              <InputTextField
                key={num.id}
                name={inputName}
                label={translate('Добавить социальную сеть или ссылку', 'hint.addSocialNetworkOrLink')}
                value={value}
                onChange={handleChange}
                onRemove={idx !== 0 ? () => arrayHelpers.remove(idx) : null}
                error={errors[name] && touched[name] && touched[name][idx] && errors[name][idx] && errors[name][idx][LINK_FIELDS.url]}
                placeholder={translate('Добавьте ссылку', 'hint.addLink')}
                className="resume-request-form__array-field-input"
                inputMode="numeric"
              />
            )
          })}

          <button className="resume-request-form__add-number-btn resume-request-form__light-text f-14"
                  type="button"
                  onClick={() => arrayHelpers.push({
                    [PHONE_NUMBER_FIELDS.id]: getRandom(400, 999),
                    [PHONE_NUMBER_FIELDS.phone_number]: ''
                  })}>
            {translate('Добавить дополнительную ссылку', 'org.addExtraLink')}
          </button>
        </div>
      )}
    />
  )
}

ResumeRequestForm.defaultProps = {
  initialValues: {
    [FIELDS.include_contacts]: true,
    [FIELDS.phone_numbers]: [
      {
        [PHONE_NUMBER_FIELDS.id]: getRandom(400, 999),
        [PHONE_NUMBER_FIELDS.phone_number]: '',
      }
    ],
    [FIELDS.links]: [
      {
        [LINK_FIELDS.id]: getRandom(400, 999),
        [LINK_FIELDS.url]: '',
      }
    ],
    [FIELDS.description]: '',
  },
  fieldsInfo: {
    [FIELDS.include_contacts]: {
      label: translate('Контакты профиля', 'resumes.resumeRequestForm.profileContacts'),
      icon: <UserIcon className="resume-request-form__row-toggle-icon"/>,
      description: translate('После отправки запроса, Кандидату будут доступны Ваши контакты указанные в Вашем профиле для обратной связи с Вами:', 'resumes.resumeRequestForm.profileContactsDesc'),
    }
  }
}

export default ResumeRequestForm;