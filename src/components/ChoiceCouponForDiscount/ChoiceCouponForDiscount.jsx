import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useEffect, useState } from "react";

import axios from "axios-api";

import "./index.scss";
import "../../components/Cards/DiscountCard/index.scss";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { setSearchState } from "@store/actions/userActions";
import OrgAvatar from "@components/UI/OrgAvatar";
import { SettingsIcon } from "@pages/OrganizationCouponCreatePage/icons";
import Preloader from "@components/Preloader";
import { ChoiceDiscount, ChoiceProduct } from "./icons";
import {
  clearResponses,
  setDiscountState,
  setProductsState,
} from "@store/actions/couponDsicount";
import { UsedIcon, UsedLine } from "@components/Cards/DiscountCard/icons";

const ChoiceCouponForDiscount = ({
  setProductsResponse,
  setDiscountResponse,
  selectedProducts,
  selectedDiscount,
  setSelectedProducts,
  setSelectedDiscount,
  orgId,
  transaction_id,
}) => {
  const [couponsProduct, setCouponsProduct] = useState(null);
  const [couponsDiscount, setCouponsDiscount] = useState(null);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/coupons/${orgId}/available/?transaction_id=${transaction_id}`
        );

        setCouponsProduct(
          res.data.filter((coupon) => coupon.coupon_type === "product")
        );
        setCouponsDiscount(
          res.data.filter((coupon) => coupon.coupon_type === "discount")
        );
      } catch (error) {
        console.log(" COUPON ERROS ", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, []);

  const toggleProductCoupon = (id) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        const updated = prev.filter((item) => item !== id);

        // если список пуст → сбрасываем ответ
        if (updated.length === 0) {
          setProductsResponse(null); // <--- ВАЖНО
        }

        return updated;
      }

      return [...prev, id];
    });
  };

  const selectDiscountCoupon = (couponId) => {
    setSelectedDiscount((prev) => {
      if (prev.includes(couponId)) {
        // СНИМАЕМ выбор
        setDiscountResponse(null); // <--- ВАЖНО
        return [];
      }

      return [couponId];
    });
  };

  const handleSubmit = async () => {
    try {
      let resProducts = null;
      let resDiscount = null;

      if (selectedProducts.length > 0) {
        resProducts = await axios.post(`/coupons/calculate/`, {
          coupons: selectedProducts,
        });

        setProductsResponse(resProducts.data);
      }

      if (selectedDiscount.length > 0) {
        resDiscount = await axios.post(`/coupons/calculate/`, {
          coupons: selectedDiscount,
        });

        setDiscountResponse(resDiscount.data);
      }

      dispatch(setSearchState(false));
    } catch (error) {
      console.log("Ошибка при расчёте купонов:", error);
    }
  };

  const formatISOToUserDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    if (isNaN(date)) return "";

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
  };

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

  return (
    <div className="modal-for-choice-discount">
      <MobileTopHeader
        title={translate("Выбор купонов", "org.choiceCoupons")}
        onBack={() => dispatch(setSearchState(false))}
        onSubmit={() => handleSubmit()}
        onClick={() => handleSubmit()}
        submitLabel={translate("Готово", "app.ready")}
      />

      <div
        className="organization-module__card-cashback container"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: 22 }}>
          {translate("Купоны на товар", "discount.couponForProduct")}{" "}
        </h2>

        {/* PRODUCT COUPON */}

        {loading ? (
          <Preloader />
        ) : !couponsProduct?.length ? (
          <div>
            {" "}
            {translate(
              "У вас нет купонов на товар",
              "hint.noCouponProductCard"
            )}
          </div>
        ) : (
          couponsProduct.map((item) => (
            <ul className="coupon-slides" id={item.id}>
              <li
                style={{ marginBottom: 36, cursor: "pointer" }}
                onClick={() => (item.used ? "" : toggleProductCoupon(item.id))}
              >
                <div
                  className="organization-coupon-create__content-wallpaper"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                  }}
                >
                  <div className="organization-coupon-create__content-wallpaper-discount">
                    <span className="discount-text">{item.percent}%</span>
                  </div>

                  {item.used ? (
                    <div className="organization-coupon-create__content-wallpaper-divider-line">
                      <UsedLine />
                    </div>
                  ) : (
                    <div className="organization-coupon-create__content-wallpaper-divider" />
                  )}

                  <div className="organization-coupon-create__content-wallpaper-content">
                    {selectedProducts.includes(item.id) ? (
                      <div
                        className="organization-coupon-create__content-wallpaper-content-buttons"
                        style={{ position: "absolute", top: "10px", right: 10 }}
                      >
                        <button>
                          <ChoiceProduct />
                        </button>
                      </div>
                    ) : (
                      ""
                    )}

                    <h2 className="organization-coupon-create__content-wallpaper-content-title">
                      {item.expire_date !== null && item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("До", "common.to")}{" "}
                          {formatISOToUserDate(item.expire_date)}
                          <br />
                          {translate("Каждый день", "app.everyDay")}
                        </span>
                      )}

                      {item.expire_date !== null && !item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("До", "common.to")}{" "}
                          {formatISOToUserDate(item.expire_date)}
                        </span>
                      )}

                      {item.expire_date === null && !item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}
                        </span>
                      )}

                      {item.expire_date === null && item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("Каждый день", "app.everyDay")}
                        </span>
                      )}
                    </h2>

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
                              (Number(item.product?.price) *
                                Number(item.percent)) /
                                100}{" "}
                            {item.product?.currency}
                          </p>
                        </div>

                        <p className="organization-coupon-create__content-wallpaper-content-product-info-price-old">
                          {item.product?.price} {item.product?.currency}
                        </p>
                      </div>
                    </div>
                  </div>
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
          ))
        )}

        {/* DISCOUNT COUPON */}

        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: 22,
            marginTop: 56,
          }}
        >
          {translate("Купоны на скидку", "discount.couponForDsicount")}{" "}
        </h2>

        {loading ? (
          <Preloader />
        ) : !couponsDiscount?.length ? (
          <div>
            {" "}
            {translate("Нет купонов на скидку", "hint.noCouponDiscountCard")}
          </div>
        ) : (
          couponsDiscount.map((item) => (
            <ul className="coupon-slides" id={item.id}>
              <li
                style={{ marginBottom: 36, cursor: "pointer" }}
                onClick={() => (item.used ? "" : selectDiscountCoupon(item.id))}
              >
                <div
                  className="organization-coupon-create__content-wallpaper"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                  }}
                >
                  <div className="organization-coupon-create__content-wallpaper-discount">
                    <span className="discount-text">{item.percent}%</span>
                  </div>

                  {item.used ? (
                    <div className="organization-coupon-create__content-wallpaper-divider-line">
                      <UsedLine />
                    </div>
                  ) : (
                    <div className="organization-coupon-create__content-wallpaper-divider" />
                  )}
                  <div
                    className="organization-coupon-create__content-wallpaper-content"
                    style={{ position: "relative" }}
                  >
                    {selectedDiscount[0] === item.id && (
                      <div
                        className="organization-coupon-create__content-wallpaper-content-buttons"
                        style={{ position: "absolute", top: "-16px", right: 5 }}
                      >
                        <button>
                          <ChoiceDiscount />
                        </button>
                      </div>
                    )}

                    <h2 className="organization-coupon-create__content-wallpaper-content-title">
                      {item.expire_date !== null && item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("До", "common.to")}{" "}
                          {formatISOToUserDate(item.expire_date)}
                          <br />
                          {translate("Каждый день", "app.everyDay")}
                        </span>
                      )}

                      {item.expire_date !== null && !item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("До", "common.to")}{" "}
                          {formatISOToUserDate(item.expire_date)}
                        </span>
                      )}

                      {item.expire_date === null && !item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}
                        </span>
                      )}

                      {item.expire_date === null && item.is_updating && (
                        <span>
                          {translate("Получите скидку", "app.getDiscount")}{" "}
                          <br />
                          {translate("Каждый день", "app.everyDay")}
                        </span>
                      )}
                    </h2>

                    {/* PRODUCT INFO */}

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
                  </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default ChoiceCouponForDiscount;
