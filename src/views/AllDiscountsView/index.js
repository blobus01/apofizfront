import { DISCOUNT_TYPES } from "@common/constants";
import DiscountCard from "@components/Cards/DiscountCard";
import DiscountSlider from "@components/DicsountSlider";
import {
  CouponIcon,
  DiscountIcon,
  MenuDots,
  QuestionIcon,
} from "@components/UI/Icons";
import { translate } from "@locales/locales";
import {
  Link,
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios-api";

import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { useEffect, useRef, useState } from "react";
import RowButton, { ROW_BUTTON_TYPES } from "@components/UI/RowButton";

import * as classnames from "classnames";
import MobileMenu from "@components/MobileMenu";

const AllDiscountsView = ({
  orgDetail,
  user,
  permissions,
  client_status,
  onCardEditClick,
  discounts,
  currency,
  onBack,
}) => {
  console.log(orgDetail.data.id);

  const [couponsProduct, setCouponsProduct] = useState(null);
  const [couponsDiscount, setCouponsDiscount] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const res = await axios.get(`/coupons/${orgDetail.data.id}/list/`);

        setCouponsProduct(
          res.data.filter((coupon) => coupon.coupon_type === "product")
        );
        setCouponsDiscount(
          res.data.filter((coupon) => coupon.coupon_type === "discount")
        );
      } catch (error) {
        console.log(" COUPON ERROS ", error);
      }
    };

    loadCoupon();
  }, []);

  const handleUnset = () => {
    document.body.style.overflow = "unset";
    setShowMenu(false);
    const root = document.getElementById("views");
    if (root) {
      root.classList.remove("active");
      root.classList.remove("active-coupon");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  const handleSubmit = () => {
    setShowMenu(true);
    const root = document.getElementById("views");
    if (root) root.classList.add("active-coupon");
  };

  const handleBack = () => {
    onBack(); // вызываем проп (переданную извне)
    handleUnset(); // делаем локальную очистку
  };

  const history = useHistory();
  return (
    <div className="all-discounts-page">
      <MobileTopHeader
        onBack={handleBack}
        // onSubmit={handleSubmit}
        onClick={handleSubmit}
        submitLabel={permissions.is_owner ? <MenuDots /> : ""}
        title={translate("Скидки и бонусы", "org.discountTitle")}
      />
      <div className="organization-module__cards container">
        <div className="organization-module__card-cumulative">
          <h2 className="organization-module__cards-title">
            {translate("Фиксированная карта", "org.cumulativeCard")}{" "}
            <Link
              to="/faq/discounts#cumulative"
              onClick={handleUnset}
              className="organization-module__cards-tooltip"
            >
              <QuestionIcon />
            </Link>
          </h2>
          {!discounts.cumulative.length ? (
            permissions && permissions.is_owner ? (
              <div>
                {translate(
                  "У вас нет фиксированных карт",
                  "hint.noFixedCardOwner"
                )}
              </div>
            ) : (
              <div>
                {translate("Нет фиксированных карт", "hint.noFixedCard")}
              </div>
            )
          ) : (
            <DiscountSlider
              className="organization-module__slider"
              clientStatus={{
                ...client_status,
                type: DISCOUNT_TYPES.cumulative,
              }}
              cards={discounts.cumulative}
            >
              {discounts.cumulative.map((card) => (
                <DiscountCard
                  key={card.id}
                  card={card}
                  clientStatus={client_status}
                  isOwner={permissions && permissions.can_edit_organization}
                  onEditClick={() => onCardEditClick(card.id)}
                  name={user && user.full_name}
                />
              ))}
            </DiscountSlider>
          )}
        </div>

        <div className="organization-module__card-fixed">
          <h2 className="organization-module__cards-title">
            {translate("Акционная карта", "org.promotionalCard")}{" "}
            <Link
              to="/faq/discounts#fixed"
              onClick={handleUnset}
              className="organization-module__cards-tooltip"
            >
              <QuestionIcon />
            </Link>
          </h2>
          {!discounts.fixed.length ? (
            permissions && permissions.is_owner ? (
              <div>
                {translate(
                  "У вас нет акционных карт",
                  "hint.noPromotionCardOwner"
                )}
              </div>
            ) : (
              <div>
                {translate("Нет акционных карт", "hint.noPromotionCard")}
              </div>
            )
          ) : (
            <DiscountSlider
              className="organization-module__slider"
              cards={discounts.fixed}
            >
              {discounts.fixed.map((card) => (
                <DiscountCard
                  key={card.id}
                  card={card}
                  onEditClick={() => onCardEditClick(card.id)}
                  isOwner={permissions && permissions.can_edit_organization}
                  name={user && user.full_name}
                />
              ))}
            </DiscountSlider>
          )}
        </div>

        <div className="organization-module__card-cashback">
          <h2 className="organization-module__cards-title">
            {translate("Кэшбек карта", "org.cashbackCard")}{" "}
            <Link
              to="/faq/discounts#cashback"
              onClick={handleUnset}
              className="organization-module__cards-tooltip"
            >
              <QuestionIcon />
            </Link>
          </h2>
          {!discounts.cashback.length ? (
            permissions && permissions.is_owner ? (
              <div>
                {translate("У вас нет кэшбек карт", "hint.noCashbackCardOwner")}
              </div>
            ) : (
              <div>{translate("Нет кэшбек карт", "hint.noCashbackCard")}</div>
            )
          ) : (
            <DiscountSlider
              className="organization-module__slider"
              clientStatus={{
                ...client_status,
                currency,
                type: DISCOUNT_TYPES.cashback,
              }}
              cards={discounts.cashback}
            >
              {discounts.cashback.map((card) => (
                <DiscountCard
                  key={card.id}
                  card={card}
                  onEditClick={() => onCardEditClick(card.id)}
                  isOwner={permissions && permissions.can_edit_organization}
                  name={user && user.full_name}
                />
              ))}
            </DiscountSlider>
          )}
        </div>

        <div className="organization-module__card-cashback">
          <h2 className="organization-module__cards-title">
            {translate("Купоны на скидку %", "discount.couponForDiscount")}{" "}
          </h2>
          {!couponsDiscount?.length ? (
            permissions && permissions.is_owner ? (
              <div>
                {translate(
                  "У вас нет купонов на скидку",
                  "hint.noCouponDiscountOwner"
                )}
              </div>
            ) : (
              <div>
                {" "}
                {translate(
                  "Нет купонов на скидку",
                  "hint.noCouponDiscountCard"
                )}
              </div>
            )
          ) : (
            <DiscountSlider
              className="organization-module__slider"
              cards={couponsDiscount}
            >
              {couponsDiscount.map((item) => (
                <DiscountCard
                  key={item.id}
                  item={item}
                  onEditClick={() => onCardEditClick(item.id)}
                  isOwner={permissions && permissions.can_edit_organization}
                  name={user && user.full_name}
                />
              ))}
            </DiscountSlider>
          )}
        </div>

        <div className="organization-module__card-cashback">
          <h2 className="organization-module__cards-title">
            {translate("Купоны на товар", "discount.couponForProduct")}{" "}
          </h2>
          {!couponsProduct?.length ? (
            permissions && permissions.is_owner ? (
              <div>
                {translate(
                  "У вас нет купонов на товар",
                  "hint.noCouponProductOwner"
                )}
              </div>
            ) : (
              <div>
                {" "}
                {translate("Нет купонов на товар", "hint.noCouponProduct")}
              </div>
            )
          ) : (
            <DiscountSlider
              className="organization-module__slider"
              cards={couponsProduct}
            >
              {couponsProduct.map((item) => (
                <DiscountCard
                  key={item.id}
                  item={item}
                  onEditClick={() => onCardEditClick(item.id)}
                  isOwner={permissions && permissions.can_edit_organization}
                  name={user && user.full_name}
                />
              ))}
            </DiscountSlider>
          )}
        </div>
      </div>

      <MobileMenu
        isOpen={showMenu}
        contentLabel={"Настройка"}
        onClose={() => setShowMenu(false)}
        onCloseCoupon={showMenu}
        coupons={true}
      >
        <div
          className={classnames(
            "organization-module__menu",
            showMenu && "organization-module__menu-active"
          )}
        >
          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Управление скидками", "org.discountManage")}
            showArrow={false}
            onClick={handleUnset}
            to={`/organizations/${orgDetail.data.id}/edit-discounts`}
          >
            <DiscountIcon />
          </RowButton>

          <RowButton
            type={ROW_BUTTON_TYPES.link}
            label={translate("Управление купонами", "org.couponsManage")}
            showArrow={false}
            onClick={handleUnset}
            to={`/organizations/${orgDetail.data.id}/coupons`}
          >
            <CouponIcon />
          </RowButton>
        </div>
      </MobileMenu>
    </div>
  );
};
export default AllDiscountsView;
