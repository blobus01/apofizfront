import React from "react";
import * as classnames from "classnames";
import OrgAvatar from "../../UI/OrgAvatar";
import { Link } from "react-router-dom";
import { prettyDate } from "../../../common/utils";
import { translate } from "../../../locales/locales";
import "./index.scss";
import OrgVerification from "../../UI/OrgVerification";

const PartnerCard = ({ partner, to, count, className, darkTheme }) => {
  if (!partner) {
    return null;
  }
  const {
    id,
    title,
    image,
    address,
    partners,
    types,
    latest_transaction_time,
    verification_status,
  } = partner;

  return (
    <Link
      to={to || `/receipts?org=${id}`}
      className={classnames("partner-card__wrap", className)}
    >
      <div className="partner-card">
        <div className="partner-card__left">
          <OrgAvatar
            src={image && image.medium}
            alt={title + "Logo"}
            className="partner-card__logo"
          />
          {!!count && (
            <div className="partner-card__count f-11">
              {count < 1000 ? count : "999+"}
            </div>
          )}
        </div>

        <div className="partner-card__right">
          <div className="partner-card__type-block row">
            <p className="partner-card__type f-12 f-500 tl">
              {(types[0] && types[0].title) ||
                translate("Фирменный магазин", "org.shopType")}
            </p>
            {latest_transaction_time && (
              <div className="partner-card__time f-11 f-500">
                {prettyDate(latest_transaction_time)}
              </div>
            )}
          </div>
          <h4
            className="partner-card__title f-16 tl"
            style={{ color: darkTheme ? "#FFF" : "" }}
          >
            <OrgVerification status={verification_status} />
            {title}
          </h4>
          {address && (
            <p className="partner-card__address f-12 tl">{address}</p>
          )}

          {!!partners.count && (
            <div className="partner-card__bottom">
              <div className="partner-card__group">
                {partners.list?.map((partner) => (
                  <div key={partner.id} className="partner-card__group-image">
                    <img
                      src={partner.image && partner.image.small}
                      alt={partner.title}
                    />
                  </div>
                ))}
              </div>

              <div className="partner-card__partners f-11">
                {translate("{count} партнеров", "partners.partnersNumber", {
                  count: partners.count,
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PartnerCard;
