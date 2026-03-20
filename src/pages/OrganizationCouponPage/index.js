import React, { useEffect, useState } from "react";
import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { useHistory, useParams } from "react-router-dom";
import { CouponIcon, TrashIcon } from "@components/UI/Icons";
import OrgAvatar from "@components/UI/OrgAvatar";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios-api";

import { setSearchState } from "@store/actions/userActions";
import Notify from "@components/Notification";
import Loader from "@components/UI/Loader";
import { clearChosenProduct } from "@store/actions/chosenProductActions";
import CouponCard from "@components/CouponCard/CouponCard";

const OrganizationCouponPage = () => {
  const history = useHistory();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(setSearchState(true));
  }, []);

  const items = useSelector((state) => state.couponBanner);

  console.log(items);

  const fetchCoupon = async () => {
    try {
      const response = await axios.get(`/coupon/?organization_id=${id}`);
      console.log("COUPON DATA:", response);
      setData(response.data);
      return response.data;
    } catch (e) {
      console.log("GET ERROR:", e.response?.data || e);
      Notify.error({ text: "Ошибка загрузки купона" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupon();
  }, []);

  const handleSubmit = async () => {
    history.push(`/organizations/${id}`);
    dispatch(setSearchState(false));
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

  return (
    <div className="organization-coupon-page">
      <MobileTopHeader
        title={translate("Купоны", "org.coupons")}
        onSubmit={handleSubmit}
        onClick={handleSubmit}
        disabled={isSubmitting}
        submitLabel={translate("Готово", "app.done")}
        onBack={() => {
          history.push(`/organizations/${id}`);
          dispatch(setSearchState(false));
        }}
      />

      {/* купоны на товар */}

      <div className="organization-coupon-page__content container">
        <div className="organization-coupon-page__content-item">
          <h2>{translate("Купон на товар", "app.couponToProduct")}</h2>
          <button
            onClick={() => history.push(`/organizations/${id}/coupons/create`)}
          >
            <h3>
              <CouponIcon />
              {translate("Добавить купон на товар", "app.addCouponToProduct")}
            </h3>
            <p>
              {translate(
                "Добавив купон на товар, вы предлагаете скидку на выбранную позицию для привлечения покупателей.",
                "app.addCouponToProductYou"
              )}
            </p>
          </button>

          <ul>
            {loading ? (
              <div className="coupon-loader">
                <Loader />
              </div>
            ) : data === null ? (
              <div className="coupon-empty">Нет доступных купонов</div>
            ) : (
              data
                .filter((item) => item.coupon_type === "product")
                .map((item) => <CouponCard item={item} />)
            )}
          </ul>
        </div>

        {/* купоны на скидку */}

        <div className="organization-coupon-page__content-item">
          <h2>{translate("Купон на скидку", "app.couponToDiscount")}</h2>
          <button
            onClick={() =>
              history.push({
                pathname: `/organizations/${id}/coupons/create`,
                state: {
                  state: "coupon-discount"
                }
              })
            }
          >
            <h3>
              <CouponIcon />
              {translate("Добавить купон на скидку", "app.addCouponToDiscount")}
            </h3>
            <p>
              {translate(
                "Добавив купон на скидку, вы предлагаете снижение цены для привлечения покупателей.",
                "app.addCouponToDiscountYou"
              )}
            </p>
          </button>

          <ul>
            {loading ? (
              <div className="coupon-loader">
                <Loader />
              </div>
            ) : data === null ? (
              <div className="coupon-empty">Нет доступных купонов</div>
            ) : (
              data
                .filter((item) => item.coupon_type === "discount")
                .map((item) => <CouponCard item={item} />)
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCouponPage;
