import React from "react";
import OrganizationCard from "../Cards/OrganizationCard";
import { translate } from "../../locales/locales";
import classNames from "classnames";
import "./index.scss";

const RowOrganizationList = ({ orgs = [], onPinToggle, generateProps }) => {
  return (
    <div className="row-organization-list">
      {orgs.map((org) => {
        const props = (generateProps && generateProps(org)) ?? {};

        return (
          <OrganizationCard
            key={org.id}
            id={org.id}
            title={org.title}
            image={org.image && org.image.medium}
            isPrivate={org.is_private}
            isBanned={org.is_banned}
            withDots={true}
            verificationStatus={org.verification_status}
            description={
              org.is_deleted
                ? translate("Деактивирована", "org.deactivated")
                : org.role
            }
            pinned={org.pinned} // 👈 передаём флаг закрепления
            onPinToggle={() => onPinToggle(org.id, org.pinned)} // 👈 передаём обработчик
            {...props}
            className={classNames(
              "row-organization-list__item",
              org.is_deleted && "row-organization-list__item--deactivated",
              props.className
            )}
          />
        );
      })}
    </div>
  );
};

export default RowOrganizationList;
