import React, { useEffect } from "react";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { InfoTitle } from "@ui/InfoTitle";
import DateInput from "@components/UI/DateInput";
import { ERROR_MESSAGES } from "@common/messages";
import TimeRangeField from "@components/UI/TimeRangeField";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";

// handle when form values change
const FormikOnChange = ({ onChange }) => {
  const { values } = useFormikContext();

  useEffect(() => {
    onChange(values);
  }, [values]);

  return null;
};

const TimeSpecificationForm = ({
  onBack,
  onSubmitWithoutChanges,
  onChange,
  ...rest
}) => {
  const VALIDATION_SCHEMA = Yup.object({
    startTime: Yup.string().required(),
    endTime: Yup.string().required(),
    startDate: Yup.string().required(),
    endDate: Yup.string().required(),
  });

  return (
    <Formik validationSchema={VALIDATION_SCHEMA} {...rest}>
      {(formikBag) => {
        const {
          values,
          setFieldValue,
          submitForm,
          isSubmitting,
          setFieldTouched,
          handleSubmit,
          setFieldError,
          handleChange,
          touched,
          errors,
          dirty,
        } = formikBag;
        const { startDate, endDate } = values;
        const isNotFilled = !startDate || !endDate;
        return (
          <>
            <MobileTopHeader
              onBack={onBack}
              title={translate("Мероприятие", "events.event")}
              onNext={async () => {
                dirty || isNotFilled || !onSubmitWithoutChanges
                  ? await submitForm()
                  : onSubmitWithoutChanges();
              }}
              isSubmitting={isSubmitting}
              disabled={isSubmitting}
              nextLabel={translate("Готово", "app.done")}
              className="event-settings__header"
            />
            <div
              className="container"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              <InfoTitle
                title={translate("Примечание", "printer.note")}
                className="event-settings__title"
              />
              <p className="event-settings__desc event-settings__time-specification-form-desc">
                {translate(
                  "Добавление даты и времени мероприятия являются обязательными. В диапазон дат и указанное время можно будет попасть на мероприятие через предъявление qr кода пользователя.\nКоличество и ассоциации с другими билетами не являются обязательными",
                  "events.settings.info"
                )}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="event-settings__time-specification-form-range-field">
                  <DateInput
                    name="startDate"
                    label={translate("Дата начала", "app.startDate") + "*"}
                    className="event-settings__time-specification-form-range-field-input f-500"
                    style={{ width: "100%" }}
                    value={values.startDate}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const newStartDate = e.target.value;
                      if (
                        (newStartDate && endDate && newStartDate > endDate) ||
                        (newStartDate &&
                          new Date(newStartDate).getTime() <
                            new Date().getTime())
                      ) {
                        setFieldError("startDate", ERROR_MESSAGES.date);
                      }
                    }}
                    requiredError={
                      startDate === "" && touched.startDate && errors.startDate
                    }
                    error={
                      startDate !== "" && touched.startDate && errors.startDate
                    }
                  />
                  <DateInput
                    name="endDate"
                    className="event-settings__time-specification-form-range-field-input f-500"
                    label={translate("Дата окончания", "app.endDate") + "*"}
                    style={{ width: "100%" }}
                    value={values.endDate}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const newEndDate = e.target.value;

                      if (newEndDate && startDate && newEndDate < startDate) {
                        setFieldTouched("endDate", true);
                        setFieldError("endDate", ERROR_MESSAGES.date);
                      }
                    }}
                    requiredError={
                      endDate === "" && touched.endDate && errors.endDate
                    }
                    error={endDate !== "" && touched.endDate && errors.endDate}
                  />
                </div>

                <p className="event-settings__desc event-settings__time-specification-form-desc f-12">
                  {translate(
                    "Укажите обязательно дату начала и окончания мероприятия",
                    "events.settings.dateRangeDesc"
                  )}
                </p>

                <TimeRangeField
                  label={
                    translate("Время мероприятия", "event.eventTime") + "*"
                  }
                  startPlaceholder={translate("с Время", "app.fromTime") + "*"}
                  endPlaceholder={translate("до Время", "app.beforeTime") + "*"}
                  start={values.startTime}
                  end={values.endTime}
                  onStartChange={(timeStr) =>
                    setFieldValue("startTime", timeStr)
                  }
                  onEndChange={(timeStr) => setFieldValue("endTime", timeStr)}
                  className="event-settings__time-specification-form-time-range"
                />
                <p className="event-settings__desc event-settings__time-specification-form-desc f-12">
                  {translate(
                    "Укажите обязательно время начала и окончания мероприятия",
                    "events.settings.timeRangeDesc"
                  )}
                </p>
              </form>
            </div>
            <FormikOnChange onChange={onChange} />
          </>
        );
      }}
    </Formik>
  );
};

export default TimeSpecificationForm;
