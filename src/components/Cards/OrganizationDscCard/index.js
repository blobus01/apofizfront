import React from "react";
import * as classnames from "classnames";
import AvatarSquare from "../../UI/AvatarSquare";
import { Link } from "react-router-dom";
import { translate } from "../../../locales/locales";
import { PromotionIcon } from "../../UI/Icons";
import OrgVerification from "../../UI/OrgVerification";
import "./index.scss";

const OrganizationDscCard = ({ organization, is_banned, className }) => {
  if (!organization) {
    return null;
  }
  const {
    id,
    title,
    types,
    image,
    discounts,
    promo_cashback,
    verification_status,
  } = organization;

  return (
    <Link
      to={`/organizations/${id}`}
      className={classnames("organization-dsc-card", className)}
    >
      <AvatarSquare
        className="organization-dsc-card__avatar"
        src={image && image.medium}
        alt={title}
        size={45}
      />

      <div className="organization-dsc-card__right">
        <p className="f-12 f-400 tl">{types[0] && types[0].title}</p>
        <h5
          className={classnames(
            "organization-dsc-card__title f-16 f-400 tl",
            is_banned && "organization-dsc-card__title--banned"
          )}
        >
          <OrgVerification
            status={verification_status}
            className="organization-dsc-card__title--verified"
          />
          {title}
        </h5>
        {discounts && !!discounts.length ? (
          <ul className="organization-dsc-card__discounts">
            {discounts?.slice(-3)?.map((discount) => (
              <li
                key={discount}
                className="organization-dsc-card__discount f-14 f-600"
              >
                {`${discount}%`}
              </li>
            ))}
            {promo_cashback && (
              <li className="organization-dsc-card__discount-promo">
                <PromotionIcon />
              </li>
            )}
          </ul>
        ) : (
          <div
            className={classnames(
              "organization-dsc-card__discounts",
              promo_cashback && "promo"
            )}
          >
            <div className="organization-dsc-card__discount f-14 f-600">
              {translate("Нет скидок", "app.noDiscount")}
            </div>
            {promo_cashback && <PromotionIcon />}
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrganizationDscCard;
