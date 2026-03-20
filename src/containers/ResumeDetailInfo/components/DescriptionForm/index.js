import React from 'react';
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../../../common/messages";
import {Formik} from "formik";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {translate} from "../../../../locales/locales";
import TextareaAutosize from "react-textarea-autosize";
import {MESSAGE_CHAR_LIMIT} from "../../../../common/constants";
import classNames from "classnames";

export const FIELDS = Object.freeze({
  description: 'description'
})

const VALIDATION_SCHEMA = Yup.object().shape({
  [FIELDS.description]: Yup
    .string()
    .max(MESSAGE_CHAR_LIMIT, ERROR_MESSAGES.max_message_limit)
})


const DescriptionForm = ({onBack, initialValues, onSubmit, disabled = false}) => {
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues ? initialValues : {
        [FIELDS.description]: ''
      }}
      validationSchema={VALIDATION_SCHEMA}
    >
      {({values, handleSubmit, handleChange, isSubmitting, dirty}) => {
        return (
          <form onSubmit={handleSubmit} className="resume-detail-info__description-form">
            <MobileTopHeader
              onBack={onBack}
              title={translate('Информация подробнее', 'resumes.detailInfo.detailInfo')}
              onSubmit={dirty && !disabled ? (() => null) : null}
              isSubmitting={isSubmitting}
              className={classNames('resume-detail-info__header', isSubmitting && 'resume-detail-info__header--submitting')}
            />
            <main className="container">
              {!disabled && (
                <>
                  <h1 className="resume-detail-info__view-title">
                    {translate('Заполните информацию', 'resumes.detailInfo.fillInfo')}
                  </h1>
                  <p className="resume-detail-info__view-desc">
                    {translate('Расскажите подробнее личных качествах, приоритетах жизни, семейном положении, указав все уникальные и значимые подробности, указав положительные стороны. Данная информация будет дополнена в резюме для скачивания и кнопки поделиться', 'resumes.detailInfo.fillInfoDesc')}
                  </p>
                </>
              )}

              <TextareaAutosize
                name={FIELDS.description}
                value={values[FIELDS.description]}
                onChange={handleChange}
                minRows={3}
                placeholder={translate('Информация', 'app.information')}
                className="resume-detail-info__textarea"
                maxLength={MESSAGE_CHAR_LIMIT}
                disabled={disabled}
              />
            </main>
          </form>
        )
      }}
    </Formik>
  );
};

export default DescriptionForm;