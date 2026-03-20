import React from 'react';
import {InputTextField} from "../../../UI/InputTextField";
import * as Yup from "yup";
import {translate} from "../../../../locales/locales";
import {Formik} from "formik";
import WideButton, {WIDE_BUTTON_VARIANTS} from "../../../UI/WideButton";
import './../index.scss';

const VALIDATION_SCHEMA = Yup.object().shape({
  name: Yup
    .string()
    .max(64, translate('Укажите небольше {num} символов', 'hint.provideLessThan', {num: 64}))
    .required(translate('Укажите название', 'app.specifyName')),
});

const SubcategoryCreationMenu = ({onSubmit}) => {
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{
        name: ''
      }}
      validationSchema={VALIDATION_SCHEMA}
    >
      {formikBag => {
        const {values, errors, touched, handleChange, handleSubmit, isSubmitting} = formikBag
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
            >
              {translate('Создать', 'app.create')}
            </WideButton>
          </form>
        )
      }}
    </Formik>
  );
};

export default SubcategoryCreationMenu;