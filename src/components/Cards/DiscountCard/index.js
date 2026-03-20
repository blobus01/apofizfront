import React, { useState } from "react";
import classnames from "classnames";

import "./index.scss";
import { GearIcon } from "@components/UI/Icons";
import OrgAvatar from "@components/UI/OrgAvatar";
import { translate } from "@locales/locales";
import UserIcon from "@components/UI/Icons/UserIcon";
import { UsedIcon, UsedLine } from "./icons";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

const DiscountCard = ({
  card,
  item,
  clientStatus,
  onEditClick,
  name,
  isOwner,
  orgId
}) => {
  const [showImage, setShow] = useState(true);

  const history = useHistory();

  const { id } = useParams();
 
  

  const formatISOToUserDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    if (isNaN(date)) return "";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
  };

  if (card) {
    const percent = card.percent || 0;

    return (
      <div
        className={classnames("discount-card", `discount-card-${card.type}`)}
      >
        {isOwner && (
          <button
            type="button"
            className="discount-card__settings"
            onClick={onEditClick}
          >
            <GearIcon />
          </button>
        )}

        {card.image && showImage && (
          <img
            className="discount-card__img"
            src={card.image.large}
            onError={() => setShow(false)}
            alt={card.image.name}
          />
        )}

        <div className="discount-card__bottom">
          <div className="discount-card__percent f-28 f-600">{`${percent}%`}</div>
          {name && <p className="discount-card__name f-16 f-600">{name}</p>}
        </div>

        {clientStatus && clientStatus.total_spent < Number(card.limit) && (
          <div className="discount-card__overlay">
            <p className="discount-card__overlay-text f-17 f-600">
              {translate(
                "Вам совсем осталось <i></i> чуть-чуть до {percent} % скидки",
                "org.reachDiscount",
                { percent, i: () => <br /> }
              )}
            </p>
          </div>
        )}
      </div>
    );
  }

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (item) {
    const percent = item.percent || 0;

    return (
      <ul className="coupon-slides">
        <li className="coupon-slides__item">
          <div
            className="organization-coupon-create__content-wallpaper"
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="organization-coupon-create__content-wallpaper-discount">
              <span className="discount-text">{percent}%</span>
            </div>

            {item.used ? (
              <div className="organization-coupon-create__content-wallpaper-divider-line">
                <UsedLine />
              </div>
            ) : (
              <div className="organization-coupon-create__content-wallpaper-divider" />
            )}

            <div className="organization-coupon-create__content-wallpaper-content">
              <h2 className="organization-coupon-create__content-wallpaper-content-title">
                {item.expire_date !== null && item.is_updating && (
                  <span>
                    {translate("Получите скидку", "app.getDiscount")} <br />
                    {translate("До", "common.to")}{" "}
                    {formatISOToUserDate(item.expire_date)} <br />
                    {translate("Каждый день", "app.everyDay")}
                  </span>
                )}

                {item.expire_date !== null && !item.is_updating && (
                  <span>
                    {translate("Получите скидку", "app.getDiscount")} <br />
                    {translate("До", "common.to")}{" "}
                    {formatISOToUserDate(item.expire_date)}
                  </span>
                )}

                {item.expire_date === null && !item.is_updating && (
                  <span>{translate("Получите скидку", "app.getDiscount")}</span>
                )}

                {item.expire_date === null && item.is_updating && (
                  <span>
                    {translate("Получите скидку", "app.getDiscount")} <br />
                    {translate("Каждый день", "app.everyDay")}
                  </span>
                )}
              </h2>

              {/* PRODUCT INFO */}

              {item.coupon_type !== "discount" ? (
                <div className="organization-coupon-create__content-wallpaper-content-product">
                  <OrgAvatar
                    size={60}
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                  />

                  <div className="organization-coupon-create__content-wallpaper-content-product-info">
                    <p className="organization-coupon-create__content-wallpaper-content-product-info-title">
                      {item.product?.name}
                    </p>

                    <div className="organization-coupon-create__content-wallpaper-content-product-info-price">
                      <p className="organization-coupon-create__content-wallpaper-content-product-info-price-new">
                        {Number(item.product?.price) -
                          (Number(item.product?.price) * Number(percent)) / 100} {" "} {item.product?.currency}
                      </p>
                    </div>

                    <p className="organization-coupon-create__content-wallpaper-content-product-info-price-old">
                      {item.product?.price} {" "} {item.product?.currency}
                    </p>
                  </div>
                </div>
              ) : (
                <p
                  className="organization-coupon-create__content-wallpaper-content-description"
                  style={{
                    color: "#FFF",
                    maxWidth: "240px",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>

            {isOwner && (
              <button
                type="button"
                className="discount-card__settings"
                onClick={() =>
                  history.push(`/organizations/${id}/coupons/edit/${item.id}`, {
                    state:
                      item.coupon_type === "discount" ? "coupon-discount" : "",
                  })
                }
              >
                <GearIcon />
              </button>
            )}

            {item.used && (
              <div className="coupon-slides__item-used">
                <div className="coupon-slides__item-info">
                  <UsedIcon />
                  <p>
                    <span style={{ fontWeight: 500 }}>Использован:</span>{" "}
                    {formatDate(item.used_on)}{" "}
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </li>
      </ul>
    );
  }

  return null;
};

export default DiscountCard;
