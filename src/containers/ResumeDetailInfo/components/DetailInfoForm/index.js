import React, {useEffect, useRef} from 'react';
import MobileTopHeader from "../../../../components/MobileTopHeader";
import {Formik, useFormikContext} from "formik";
import {translate} from "../../../../locales/locales";
import {InfoTitle} from "../../../../components/UI/InfoTitle";
import GenderSelect from "../../../../components/UI/GenderSelect";
import * as Yup from 'yup';
import {ERROR_MESSAGES} from "../../../../common/messages";
import {InputTextField} from "../../../../components/UI/InputTextField";
import * as classnames from "classnames";
import DateInput from "../../../../components/UI/DateInput";
import HorizontalListField, {HorizontalListFieldItem} from "../../../../components/HorizontalListField";
import {useDispatch} from "react-redux";
import {setViews} from "../../../../store/actions/commonActions";
import {VIEW_TYPES} from "../../../../components/GlobalLayer";
import FileUploader from "../../../../components/FileUploader";

export const FIELDS = Object.freeze({
  gender: 'gender',
  full_name: 'full_name',
  birthday: 'birthday',
  languages: 'languages',
  files: 'files',
})

const VALIDATION_SCHEMA = Yup.object({
  [FIELDS.gender]: Yup.string().nullable(),
  [FIELDS.full_name]: Yup.string(),
  [FIELDS.birthday]: Yup
    .date()
    .nullable()
    .max(new Date(), ERROR_MESSAGES.invalid_birthday),
  [FIELDS.languages]: Yup.array(),
  [FIELDS.files]: Yup.array(),
})

const DetailInfoForm = ({initialValues, onSubmit, children, onChange, onBack}) => {
  const dispatch = useDispatch()

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {({values, setFieldValue, handleSubmit, handleChange, isSubmitting, errors}) => {
        const languages = values[FIELDS.languages]
        return (
          <form onSubmit={handleSubmit}
                className="resume-detail-info__detail-form">
            <MobileTopHeader
              onBack={onBack}
              title={translate('Информация', 'app.information')}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              className="resume-detail-info__header"
            />
            <div className="container">
              <InfoTitle title={translate('Примечание', 'printer.note')} className="resume-detail-info__title"/>
              <p
                className="resume-detail-info__desc"
              >
                {translate('Добавление данной информации не является обязательной, можно нажать сохранить. Важно для удобства, всегда удобно поделиться просто ссылкой о вакансии вместе с полной информацией и перекрепленными данными, включая загруженные файлы.', 'resumes.detailInfo.note',)}
              </p>

              <GenderSelect
                value={values[FIELDS.gender]}
                onChange={gender => {
                  setFieldValue(FIELDS.gender, gender)
                }}
                className="resume-detail-info__detail-form-gender"
              />

              <InputTextField
                label={translate("ФИО", "org.fullname")}
                name={FIELDS.full_name}
                value={values[FIELDS.full_name]}
                onChange={handleChange}
                className={classnames('resume-detail-info__detail-form-full-name')}
                error={errors[FIELDS.full_name]}
              />

              <DateInput
                name={FIELDS.birthday}
                value={values[FIELDS.birthday]}
                label={translate('Дата рождения', 'profile.birthday')}
                onChange={handleChange}
                className="resume-detail-info__detail-form-birthday"
                error={errors[FIELDS.birthday]}
              />

              <HorizontalListField
                label={translate('Язык владения', 'resumes.detailInfo.language')}
                onAdd={() => {
                  dispatch(setViews({
                    type: VIEW_TYPES.language_list,
                    currentCodes: values[FIELDS.languages].map(lang => lang.code),
                    getOrgTranslationObject: lang => {
                      const idx = languages.findIndex(l => l.code === lang.code)
                      if (idx !== -1) {
                        setFieldValue(FIELDS.languages, languages.filter(l => l.code !== lang.code))
                      } else {
                        setFieldValue(FIELDS.languages, [...languages, lang])
                      }
                    }
                  }))
                }}
              >
                {languages.map(lang => {
                  return (
                    <HorizontalListFieldItem
                      text={lang.national_language}
                      onDelete={() => {
                        setFieldValue(FIELDS.languages, languages.filter(l => l.code !== lang.code))
                      }}
                      key={lang.code}
                    />
                  )
                })}
              </HorizontalListField>
              <p className="resume-detail-info__desc-text">
                {translate('Укажите языки которые знаете', 'resumes.detailInfo.languageDesc')}
              </p>

              {children}

              <FileUploader
                name={FIELDS.files}
                value={values[FIELDS.files]}
                onChange={newFiles => setFieldValue(FIELDS.files, newFiles.concat(values[FIELDS.files]))}
                onFileDelete={fileName => setFieldValue(FIELDS.files, values[FIELDS.files]
                  .filter(file => file.name !== fileName))}
                className="resume-detail-info__detail-form-files"
              />
            </div>

            <FormObserver
              onValuesChange={onChange}
            />
          </form>
        )
      }}
    </Formik>
  );
};

const FormObserver = ({onValuesChange}) => {
  const onValuesChangeCallbackRef = useRef(onValuesChange)
  const {values} = useFormikContext();

  useEffect(() => {
    onValuesChangeCallbackRef.current &&
    onValuesChangeCallbackRef.current(values)
  }, [values]);

  return null;
};

export default DetailInfoForm;