import React from 'react';
import {FieldArray, Formik} from "formik";
import MobileTopHeader from "../../MobileTopHeader";
import {translate} from "../../../locales/locales";
import {InputTextField} from "../../UI/InputTextField";
import {getRandom, ONLY_DIGITS, PHONE_NUMBER} from "../../../common/helpers";
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../../common/messages";
import "./index.scss"

const VALIDATION_SCHEMA = Yup.object().shape({
  numbers: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      phone_number: Yup.string().min(4, ERROR_MESSAGES.phone_empty).required(ERROR_MESSAGES.phone_empty)
    })
  )
});

const ContactsForm = ({numbers, onSubmit, children, onBack, disabled = false}) => {
  return (
    <Formik
      enableReinitialize
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      initialValues={{
        numbers: numbers || []
      }}
    >
      {({values, errors, touched, setFieldValue, handleSubmit, isSubmitting}) => (
        <form onSubmit={handleSubmit} className="contacts-form">
          <MobileTopHeader
            onBack={onBack}
            onSubmit={!disabled ? handleSubmit : null}
            isSubmitting={isSubmitting}
            title={translate("Номер телефона", "app.phoneNumber")}
          />
          <div className="contacts-form__content">
            <div className="container">
              {children}

              <FieldArray
                name="numbers"
                render={arrayHelpers => (
                  <React.Fragment>
                    {values.numbers &&
                      values.numbers.length > 0 &&
                      values.numbers.map((num, index) => (
                        <InputTextField
                          key={num.id}
                          name={`numbers[${index}].id`}
                          label={translate("Контактный номер", "app.contactNumber")}
                          value={num.phone_number}
                          onChange={(e) => {
                            if (e.target.value.match(ONLY_DIGITS) || e.target.value.match(PHONE_NUMBER)) {
                              setFieldValue(`numbers[${index}].phone_number`, e.target.value)
                            }
                          }}
                          onRemove={!disabled ? () => arrayHelpers.remove(index) : null}
                          onCopy
                          error={errors.numbers && touched.numbers && touched.numbers[index] && errors.numbers[index] && errors.numbers[index].phone_number}
                        />
                      ))}

                    {!disabled && (
                      <button className="contacts-form__add f-14" type="button"
                              onClick={() => arrayHelpers.push({id: getRandom(400, 999), phone_number: ''})}>
                        {translate("Добавить дополнительный номер", "org.addExtraPhoneNumber")}
                      </button>
                    )}
                  </React.Fragment>
                )}
              />
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ContactsForm;