import React from 'react';
import {InputTextField} from "../../../UI/InputTextField";
import {translate} from "../../../../locales/locales";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../UI/WideButton";
import {Formik} from "formik";
import * as Yup from "yup";
import './../index.scss'

const VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup
    .string()
    .max(64, translate('Укажите небольше {num} символов', 'hint.provideLessThan', {num: 64}))
    .required(translate('Укажите название', 'app.specifyName')),
});

const SubcategoryEditMenu = ({subcategory, onRemove, onUpdate}) => {
  return (
    <Formik
      onSubmit={onUpdate}
      initialValues={{
        name: subcategory.name,
        isDeleting: false,
      }}
      validationSchema={VALIDATION_SCHEMA}
    >
      {formikBag => {
        const {values, setFieldValue, errors, touched, handleChange, handleSubmit, isSubmitting} = formikBag
        return (
          <form onSubmit={handleSubmit} className="category-creation-menu-form container">
            <InputTextField
              name="name"
              placeholder={translate('Название категории', 'category.name')}
              value={values.name}
              onChange={handleChange}
              error={errors.name && touched.name && errors.name}
              className="category-creation-menu-form__name"
            />
            <WideButton
              type="submit"
              variant={WIDE_BUTTON_VARIANTS.ACCEPT}
              style={{
                marginTop: 50
              }}
              loading={isSubmitting}
              disabled={values.isDeleting}
            >
              {translate('Обновить', 'app.update')}
            </WideButton>
            <WideButton
              style={{marginTop: 10}}
              loading={values.isDeleting}
              disabled={isSubmitting}
              onClick={(e) => {
                setFieldValue('isDeleting', true)
                onRemove(e)
              }}
            >
              {translate('Удалить', 'app.delete')}
            </WideButton>
          </form>
        )
      }}
    </Formik>
  );
};

export default SubcategoryEditMenu;