import React from "react";
import * as classnames from "classnames";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import "./index.scss";

const OrganizationSubTypesView = ({
  catID,
  orgTypes,
  selectedTypes,
  onBack,
  onNext,
  onSelect,
  appTypes,
}) => {
  const { data } = appTypes || orgTypes;
  const list = (data && data.filter((cat) => cat.id === catID)) || [];

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="org-subtypes-view">
      <MobileTopHeader
        title={translate("Вид Организации", "org.organizationType")}
        onBack={onBack}
        onNext={onNext}
        nextLabel={translate("Сохранить", "app.save")}
      />
      <div className="container">
        <div className="org-subtypes-view__cards">
          {!!list.length &&
            list[0].types?.map((type) => (
              <OrgSubCard
                key={type.id}
                type={type}
                isActive={selectedTypes
                  .map((item) => item.id)
                  .includes(type.id)}
                onSelect={onSelect}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSubTypesView;

export const OrgSubCard = ({ type, isActive, onSelect }) => (
  <div
    key={type.id}
    className={classnames(
      "org-subtypes-view__card",
      "row",
      isActive && "org-subtypes-view__card-active"
    )}
    onClick={() => onSelect(type)}
  >
    <p className="f-16 tl">{type.title}</p>
  </div>
);
