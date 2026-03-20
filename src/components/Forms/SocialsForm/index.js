import React from 'react';
import {FieldArray, Formik} from "formik";
import MobileTopHeader from "../../MobileTopHeader";
import {translate} from "../../../locales/locales";
import {InputTextField} from "../../UI/InputTextField";
import {getRandom} from "../../../common/helpers";
import * as Yup from "yup";
import {ERROR_MESSAGES} from "../../../common/messages";
import "./index.scss"

const VALIDATION_SCHEMA = Yup.object().shape({
  socials: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      url: Yup.string().required(ERROR_MESSAGES.social_empty)
    })
  )
});

const SocialsForm = ({socials, children, onSubmit, onBack, disabled = false}) => {
  return (
    <Formik
      enableReinitialize
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      initialValues={{
        socials: socials || []
      }}
    >
      {({values, errors, touched, setFieldValue, handleSubmit, isSubmitting}) => (
        <form onSubmit={handleSubmit} className="socials-form">
          <MobileTopHeader
            title={translate("Социальные сети", "org.socialNetworks")}
            onBack={onBack}
            onSubmit={!disabled ? handleSubmit : null}
            isSubmitting={isSubmitting}
          />

          <div className="socials-form__content">
            <div className="container">
              {children}
              <FieldArray
                name="socials"
                render={arrayHelpers => (
                  <React.Fragment>
                    {values.socials &&
                      values.socials.length > 0 &&
                      values.socials.map((soc, index) => (
                        <InputTextField
                          key={soc.id}
                          name={`socials[${index}].id`}
                          label={translate("Социальные сети и web", "org.socialAndWeb")}
                          value={soc.url}
                          onChange={(e) => setFieldValue(`socials[${index}].url`, e.target.value)}
                          onRemove={!disabled ? () => arrayHelpers.remove(index) : null}
                          onCopy
                          error={errors.socials && touched.socials && touched.socials[index] && errors.socials[index] && errors.socials[index].url}
                        />
                      ))}
                    {!disabled && (
                      <button
                        className="socials-form__add f-14"
                        type="button" onClick={() => arrayHelpers.push({id: getRandom(400, 999), url: ''})}
                      >
                        {translate("Добавить дополнительную ссылку", "org.addExtraLink")}
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

export default SocialsForm;