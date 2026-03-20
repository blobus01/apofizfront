import React from "react";
import MobileTopHeader from "../../MobileTopHeader";
import { FieldArray } from "formik";
import { InputTextField } from "../../UI/InputTextField";
import { getRandom } from "../../../common/helpers";
import { translate } from "../../../locales/locales";
import "./index.scss";

const NetworksView = ({ formikBag, onBack, onSave }) => {
  const { values, setFieldValue } = formikBag;
  return (
    <div className="organization-form-networks">
      <MobileTopHeader
        title={translate("Социальные сети", "org.socialNetworks")}
        onBack={onBack}
        onNext={onSave}
        nextLabel={translate("Сохранить", "app.save")}
      />
      <div className="container">
        <FieldArray
          name="socials"
          render={(arrayHelpers) => {
            return (
              <React.Fragment>
                {values.socials.map((soc, index) => (
                  <InputTextField
                    key={typeof soc !== "object" ? index : soc.id}
                    name={`socials[${index}].id`}
                    label={translate(
                      "Социальные сети и web",
                      "org.socialAndWeb"
                    )}
                    value={typeof soc !== "object" ? soc : soc.url}
                    onChange={(e) =>
                      setFieldValue(`socials[${index}].url`, e.target.value)
                    }
                    onRemove={() => arrayHelpers.remove(index)}
                    onCopy
                  />
                ))}
                <button
                  className="organization-form-networks__add f-14"
                  type="button"
                  onClick={() =>
                    arrayHelpers.push({ id: getRandom(400, 999), url: "" })
                  }
                >
                  {translate(
                    "Добавить дополнительную ссылку",
                    "org.addExtraLink"
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

export default NetworksView;
