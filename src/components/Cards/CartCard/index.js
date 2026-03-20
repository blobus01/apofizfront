import React from "react";
import * as classnames from "classnames";
import { Link } from "react-router-dom";
import OrgAvatar from "../../UI/OrgAvatar";
import GroupedImages from "../../GroupedImages";
import { DeliveryIcon, SetIcon } from "../../UI/Icons";
import { prettyFloatMoney } from "../../../common/utils";
import { translate } from "../../../locales/locales";
import "./index.scss";
import { setOrganizationId } from "@store/actions/orgIdAction";
import { useDispatch } from "react-redux";

const CartCard = ({ cart, link, onMenuClick, showCartID, className }) => {
  const { organization, items_count, transaction, totals } = cart;
  const hasDiscount =
    !!totals.discounted_price &&
    totals.discounted_price < totals.original_price;
  const showPrice = hasDiscount
    ? totals.discounted_price
    : totals.original_price;

  const dispatch = useDispatch()
  

  return (
    <Link
      to={link ? link : `/carts/${cart.id}`}
      onClick={() => dispatch(setOrganizationId(cart.organization.id))}
      className={classnames("cart-card", className)}
    >
      <div className="cart-card__organization">
        <OrgAvatar
          src={organization.image && organization.image.medium}
          alt={organization.title}
          size={72}
          borderRadius={18}
          className="cart-card__avatar"
        />
        {transaction && transaction.delivery_info && (
          <div
            className={classnames(
              "cart-card__badge",
              transaction.delivery_info.status
            )}
          >
            <DeliveryIcon color="#FFF" />
          </div>
        )}
      </div>
      <div className="cart-card__content">
        <h5 className="cart-card__title f-16 tl">{organization.title}</h5>
        <div className="cart-card__middle">
          <GroupedImages
            className="cart-card__partners"
            images={cart.images?.map((image) => ({
              alt: `Image ${image.id}`,
              src: image.medium,
            }))}
          />
          <p className="cart-card__count">
            {showCartID ? (
              <span className="f-13 f-700">{`№ ${
                cart.transaction && cart.transaction.id
              }`}</span>
            ) : (
              <span className="f-12">
                {translate("Количество", "shop.quantity")}: <b>{items_count}</b>
              </span>
            )}
          </p>
        </div>
        <div className="cart-card__cost f-15 f-500 tl">
          {prettyFloatMoney(showPrice, false, organization.currency)}
          {hasDiscount && " - "}{" "}
          {hasDiscount && (
            <span>
              {prettyFloatMoney(
                totals.original_price,
                false,
                organization.currency
              )}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        className="cart-card__menu"
        onClick={(e) => {
          e.preventDefault();
          onMenuClick && onMenuClick(cart.id);
        }}
      >
        <SetIcon />
      </button>
    </Link>
  );
};

export default CartCard;
