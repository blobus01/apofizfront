import React from "react";
import MobileTopHeader from "../../MobileTopHeader";
import { FieldArray } from "formik";
import { InputTextField } from "../../UI/InputTextField";
import { getRandom, ONLY_DIGITS, PHONE_NUMBER } from "../../../common/helpers";
import { translate } from "../../../locales/locales";

const ContactsView = ({ formikBag, onBack, onSave }) => {
  const { values, setFieldValue } = formikBag;

  return (
    <div className="organization-form-contacts">
      <MobileTopHeader
        title={translate("Номер телефона", "app.phoneNumber")}
        onBack={onBack}
        onNext={onSave}
        nextLabel={translate("Сохранить", "app.save")}
      />
      <div className="container">
        <FieldArray
          name="numbers"
          render={(arrayHelpers) => {
            return (
              <React.Fragment>
                {values.numbers?.map((num, index) => (
                  <InputTextField
                    key={typeof num !== "object" ? index : num.id}
                    name={`numbers[${index}].id`}
                    label={translate("Контактный номер", "app.contactNumber")}
                    value={typeof num !== "object" ? num : num.phone_number}
                    onChange={(e) => {
                      if (
                        e.target.value.match(ONLY_DIGITS) ||
                        e.target.value.match(PHONE_NUMBER)
                      ) {
                        setFieldValue(
                          `numbers[${index}].phone_number`,
                          e.target.value
                        );
                      }
                    }}
                    onRemove={() => arrayHelpers.remove(index)}
                    onCopy
                  />
                ))}
                <button
                  className="organization-form-contacts__add f-14"
                  type="button"
                  onClick={() =>
                    arrayHelpers.push({
                      id: getRandom(400, 999),
                      phone_number: "",
                    })
                  }
                >
                  {translate(
                    "Добавить дополнительный номер",
                    "org.addExtraPhoneNumber"
                  )}
                </button>
              </React.Fragment>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ContactsView;
