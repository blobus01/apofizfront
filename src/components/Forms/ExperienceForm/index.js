import React from "react";
import * as Yup from "yup";
import {translate} from "../../../locales/locales";
import {ERROR_MESSAGES} from "../../../common/messages";
import {FieldArray, Formik} from "formik";
import classNames from "classnames";
import MobileTopHeader from "../../MobileTopHeader";
import {InputTextField} from "../../UI/InputTextField";
import DateInput from "../../UI/DateInput";
import RowToggle from "../../UI/RowToggle";
import PropTypes from "prop-types";
import BorderedTextarea from "../../UI/BorderedTextarea";
import "./index.scss"

export const FIELDS = Object.freeze({
  experiences: 'experiences',
  EXPERIENCE: {
    organizationName: 'organizationName',
    role: 'role',
    description: 'description',
    startDate: 'startDate',
    endDate: 'endDate',
    upToNow: 'upToNow',
  }
})

const {EXPERIENCE} = FIELDS

const MAX_MESSAGE_LENGTH = 255

const VALIDATION_SCHEMA = Yup.object().shape({
  [FIELDS.experiences]: Yup.array().of(
    Yup.object().shape({
      [EXPERIENCE.organizationName]: Yup
        .string()
        .required(translate('Это поле обязательное', 'app.fieldRequired')),
      [EXPERIENCE.role]: Yup
        .string()
        .required(translate('Это поле обязательное', 'app.fieldRequired')),
      [EXPERIENCE.description]: Yup
        .string()
        .required(translate('Это поле обязательное', 'app.fieldRequired')),
      [EXPERIENCE.startDate]: Yup
        .date()
        .nullable()
        .max(new Date(), ERROR_MESSAGES.date)
        .when(FIELDS.EXPERIENCE.endDate, (endDate, schema) => {
          return endDate ? schema.required(translate('Это поле обязательное', 'app.fieldRequired')) : schema
        }),
      [EXPERIENCE.endDate]: Yup
        .date()
        .nullable()
        .max(new Date(), ERROR_MESSAGES.date)
        .when(EXPERIENCE.startDate, (startDate, schema) => {
          return startDate ? schema
            .min(startDate, ERROR_MESSAGES.date) : schema
        }),
      [EXPERIENCE.upToNow]: Yup
        .bool()
    }, [EXPERIENCE.startDate, EXPERIENCE.endDate])
  )
})

const defaultExperience = {
  [EXPERIENCE.organizationName]: '',
  [EXPERIENCE.role]: '',
  [EXPERIENCE.description]: '',
  [EXPERIENCE.startDate]: null,
  [EXPERIENCE.endDate]: null,
  [EXPERIENCE.upToNow]: false,
}

const ExperienceForm = ({
                          initialValues,
                          headerTitle,
                          children,
                          onSubmit,
                          disabled,
                          fieldsInfo,
                          addButtonLabel,
                          removeButtonLabel,
                          className,
                          onBack
                        }) => {
  const defaultInitialValues = {
    [FIELDS.experiences]: [defaultExperience]
  }

  return (
    <Formik
      initialValues={initialValues ?? defaultInitialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {({values, handleChange, handleSubmit, setFieldValue, isSubmitting, dirty, errors, touched}) => {
        return (
          <form onSubmit={handleSubmit} className={classNames('experience-form', className)}>
            <MobileTopHeader
              onBack={onBack}
              title={headerTitle}
              onSubmit={dirty && !disabled ? (() => null) : null}
              isSubmitting={isSubmitting}
              className="experience-form__header"
            />

            <div className="container">
              {children}

              <FieldArray
                name={FIELDS.experiences}
                render={arrayHelpers => {
                  return values[FIELDS.experiences].map((experience, idx) => {
                    const rootFieldName = FIELDS.experiences,
                      {organizationName, description, role, startDate, endDate, upToNow} = EXPERIENCE,

                      experienceTouched = touched[rootFieldName]?.[idx] ?? {},
                      experienceErrors = errors[rootFieldName]?.[idx] ?? {},

                      organizationNameFieldInfo = fieldsInfo[organizationName] ?? {},
                      roleFieldInfo = fieldsInfo[role] ?? {},
                      descriptionFieldInfo = fieldsInfo[description] ?? {},
                      startDateFieldInfo = fieldsInfo[startDate] ?? {},
                      endDateFieldInfo = fieldsInfo[endDate] ?? {},
                      upToNowFieldInfo = fieldsInfo[upToNow] ?? {}


                    return (
                      <div
                        className={classNames('experience-form__work-experience', disabled && 'experience-form__work-experience--disabled')}
                        key={idx}>
                        <InputTextField
                          name={`${rootFieldName}[${idx}].${organizationName}`}
                          value={experience[organizationName]}
                          onChange={handleChange}
                          label={organizationNameFieldInfo.label}
                          maxLength={MAX_MESSAGE_LENGTH}
                          error={experienceTouched[organizationName] && experienceErrors[organizationName]}
                          disabled={disabled}
                          className="experience-form__input"
                        />
                        {organizationNameFieldInfo.description && !disabled && (
                          <p className="experience-form__desc-text">
                            {organizationNameFieldInfo.description}
                          </p>
                        )}

                        <InputTextField
                          name={`${rootFieldName}[${idx}].${role}`}
                          value={experience[role]}
                          onChange={handleChange}
                          label={roleFieldInfo.label}
                          maxLength={MAX_MESSAGE_LENGTH}
                          error={experienceTouched[role] && experienceErrors[role]}
                          disabled={disabled}
                          className="experience-form__input"
                        />
                        {roleFieldInfo.description && !disabled && (
                          <p className="experience-form__desc-text">
                            {roleFieldInfo.description}
                          </p>
                        )}

                        <InputTextField
                          label={descriptionFieldInfo.label}
                          className="experience-form__input experience-form__description-label experience-form__text-input-label-width-fix"
                          disabled
                        />
                        {descriptionFieldInfo.description && !disabled && (
                          <p className="experience-form__desc-text">
                            {descriptionFieldInfo.description}
                          </p>
                        )}

                        <BorderedTextarea
                          name={`${rootFieldName}[${idx}].${description}`}
                          value={experience[description]}
                          onChange={handleChange}
                          placeholder={translate('В данном поле опишите подробнее', 'resumes.workExperience.description')}
                          className={classNames('experience-form__textarea')}
                          isError={experienceTouched[description] && !!experienceErrors[description]}
                          disabled={disabled}
                        />

                        <div className="experience-form__date-inputs dfc row">
                          <DateInput
                            name={`${rootFieldName}[${idx}].${startDate}`}
                            value={experience[startDate]}
                            onChange={handleChange}
                            label={startDateFieldInfo.label}
                            className="experience-form__date-input"
                            error={experienceTouched[startDate] && experienceErrors[startDate]}
                            disabled={disabled}
                          />
                          {!experience[upToNow] && (
                            <DateInput
                              name={`${rootFieldName}[${idx}].${endDate}`}
                              value={experience[endDate]}
                              onChange={handleChange}
                              label={endDateFieldInfo.label}
                              className="experience-form__date-input"
                              error={experienceTouched[endDate] && experienceErrors[endDate]}
                              disabled={disabled}
                            />
                          )}
                        </div>

                        <RowToggle
                          name={`${rootFieldName}[${idx}].${upToNow}`}
                          checked={experience[upToNow]}
                          onChange={e => {
                            handleChange(e)
                            e.target.checked && setFieldValue(`${rootFieldName}[${idx}].${endDate}`, null)
                          }}
                          label={upToNowFieldInfo.label}
                          className={classNames('experience-form__input', 'experience-form__row-toggle', experience[upToNow] && 'experience-form__row-toggle--checked')}
                          error={experienceTouched[upToNow] && experienceErrors[upToNow]}
                          disabled={disabled}
                        />

                        {!disabled && (
                          <>
                            <TextButton onClick={() => arrayHelpers.insert(idx + 1, defaultExperience)}
                                        className="experience-form__text-blue experience-form__add-work-exp-btn">
                              + {addButtonLabel}
                            </TextButton>
                            <br/>
                          </>
                        )}

                        {idx !== 0 && !disabled && (
                          <TextButton onClick={() => arrayHelpers.remove(idx)}
                                      className="experience-form__text-red experience-form__remove-work-exp-btn">
                            - {removeButtonLabel}
                          </TextButton>
                        )}
                      </div>
                    )
                  })
                }}
              />
            </div>
          </form>
        )
      }}
    </Formik>
  );
};

const TextButton = ({className, ...rest}) => {
  return (
    <button
      type="button"
      className={classNames('f-14 f-500', className)}
      {...rest}
    ></button>
  )
}

const fieldsInfoObjectTypes = PropTypes.shape({
  label: PropTypes.node,
  description: PropTypes.node,
})

ExperienceForm.propTypes = {
  initialValues: PropTypes.shape({
    [FIELDS.experiences]: PropTypes.array,
  }),
  fieldsInfo: PropTypes.shape(
    Object.keys(EXPERIENCE)
      .reduce((shape, field) => {
        shape[field] = fieldsInfoObjectTypes
        return shape
      }, {})
  ),
  headerTitle: PropTypes.node,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  addButtonLabel: PropTypes.node,
  removeButtonLabel: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
}

ExperienceForm.defaultProps = {
  initialValues: {[FIELDS.experiences]: [defaultExperience]},
  addButtonLabel: translate('Добавить', 'app.add'),
  removeButtonLabel: translate('Удалить', 'app.delete'),
  disabled: false,
}

export default ExperienceForm;