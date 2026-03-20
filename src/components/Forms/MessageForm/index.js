import React from 'react';
import MobileTopHeader from '../../MobileTopHeader';
import {Formik} from 'formik';
import MessageTextarea from '../../UI/TextareaMessage';
import * as Yup from 'yup';
import Button from '../../UI/Button';
import { useIntl } from 'react-intl';
import {translate} from '../../../locales/locales';
import {ERROR_MESSAGES} from '../../../common/messages';
import {MESSAGE_CHAR_LIMIT} from "../../../common/constants";
import './index.scss';

const VALIDATION_SCHEMA = Yup.object({
  text: Yup.string()
    .min(1, ERROR_MESSAGES.min_message_limit)
    .max(MESSAGE_CHAR_LIMIT, ERROR_MESSAGES.max_message_limit)
    .required(ERROR_MESSAGES.write_message)
})

const MessageForm = ({ onSubmit, children, onBack }) => {
  const intl = useIntl();

  return (
    <Formik
      onSubmit={(values, formikBag) => onSubmit(values, formikBag)}
      validationSchema={VALIDATION_SCHEMA}
      initialValues={{
        text: ''
      }}
    >
      {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
        <form className="message-form" onSubmit={handleSubmit}>
          <MobileTopHeader
            title={translate("Новое сообщение", "messages.newMessage")}
            onBack={onBack}
            submitLabel={translate("Отправить", "app.send")}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={isSubmitting}
          />
          <div className="message-form__content">
            <div className="container">
              {children}
              <MessageTextarea
                placeholder={intl.formatMessage({ id: "placeholder.writeMessage", defaultMessage: "Напишите сообщение"})}
                name="text"
                limit={MESSAGE_CHAR_LIMIT}
                value={values.text}
                onChange={handleChange}
                error={errors.text && touched.text && errors.text}
                className="message-form__textarea"
              />
            </div>

            <div className="container">
              <Button
                type="submit"
                label={translate("Отправить", "app.send")}
                onSubmit={handleSubmit}
                className="message-form__submit"
              />
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default MessageForm;