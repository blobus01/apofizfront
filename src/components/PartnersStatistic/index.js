import React from "react";
import * as classnames from "classnames";
import { Link } from "react-router-dom";
import { translate } from "../../locales/locales";
import "./index.scss";

const PartnersStatistic = ({
  isMain,
  organization,
  partners,
  title,
  className,
  permission,
}) => {
  const { count, list } = partners;
  if (!count && !permission) {
    return null;
  }

  let href = permission
    ? `/organizations/${organization}/partner-statistics`
    : `/home/partners/${organization}`;

  return (
    <Link to={href} className={classnames("partners-statistic", className)}>
      {!isMain && (
        <h5 className="f-20 f-600 tl">
          {permission
            ? translate("Статистика партнеров", "org.partnerStatistics")
            : translate("Партнеры {title}", "org.partnerOf", { title })}
        </h5>
      )}
      <div className="partners-statistic__image-container">
        {!count && translate("У вас нет партнеров", "org.noPartnersOwner")}
        {list.map((partner) => (
          <div className="partners-statistic__image" key={partner.id}>
            <img src={partner.image.small} alt={partner.title} />
          </div>
        ))}

        {count > 3 && (
          <div className="partners-statistic__counter">{`+${count - 3}`}</div>
        )}
      </div>
    </Link>
  );
};

export default PartnersStatistic;
