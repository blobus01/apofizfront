import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "@locales/locales";
import { StandardButton } from "@ui/Buttons";
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";
import { getOrganizationDetail } from "@store/services/organizationServices";
import useDialog from "@components/UI/Dialog/useDialog";
import logo from "../../assets/images/apofizLogo.png";
import { formatWithCommas } from "@common/helpers";
import axios from "../../axios-api";
import moment from "moment";
import { setTariffId } from "@store/actions/subTarrif";

const SubscriptionPaymentPage = () => {
  const history = useHistory();
  const location = useLocation();
  const {
    plan,
    organizationId,
    selectedPlan,
    countryCode,
    total_price,
    tariff_id,
  } = location.state || {};
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [promoError, setPromoError] = useState("");
  const [finalPrice, setFinalPrice] = useState(total_price);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { confirm } = useDialog();
  const dispatch = useDispatch()

  dispatch(setTariffId(tariff_id)) // передача tarrif_id в глобальный state, для использования в Forms
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.scrollTo(0,0)
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Extract price value from plan price string (e.g. "400 AED/6 месяцев" -> 400)
  const priceValue = plan?.price
    ? parseInt(plan.price.split(" ")[0].replace(/,/g, ""))
    : 0;
  const currency = plan?.price ? plan.price.split(" ")[1].split("/")[0] : "AED";
  const duration = plan?.duration || 1;
  const durationText =
    duration === 1
      ? translate("месяц", "subscription.month")
      : translate("месяцев", "subscription.months");
  const totalPrice = isPromoApplied ? priceValue * 0.9 : priceValue; //

  const handleApplyPromo = async () => {
    if (promoCode.trim()) {
      setIsPromoLoading(true);
      setPromoError("");

      try {
        const response = await axios.post("/users/promocode/", {
          promocode: promoCode.trim(),
          total_price: total_price,
        });

        if (response.data.is_valid) {
          setIsPromoApplied(true);
          setFinalPrice(response.data.final_price);
          setDiscountPercent(response.data.discount_percent);
        } else {
          // Use confirm dialog instead of setting error state
          await confirm({
            title: translate("Ошибка", "common.error"),
            description: translate(
              "Промокод недействителен",
              "payment.invalidPromoCode"
            ),
            confirmTitle: translate("OK", "common.ok"),
            cancelTitle: false,
          });
        }
      } catch (error) {
        console.error("Error validating promocode:", error);
        let errorMessage = "";

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.status === 404) {
            errorMessage = translate(
              "Сервис промокодов недоступен",
              "payment.promoServiceUnavailable"
            );
          } else {
            errorMessage = translate(
              "Ошибка при проверке промокода",
              "payment.promoCheckError"
            );
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = translate(
            "Нет ответа от сервера",
            "payment.noServerResponse"
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = translate(
            "Ошибка при отправке запроса",
            "payment.requestError"
          );
        }

        // Display error using confirm dialog
        await confirm({
          title: translate("Ошибка", "common.error"),
          description: errorMessage,
          confirmTitle: translate("OK", "common.ok"),
          cancelTitle: false,
        });
      } finally {
        setIsPromoLoading(false);
      }
    }
  };

  const handlePayment = async () => {
    try {
      // Get current UTC offset in minutes
      setIsPaymentLoading(true);
      const utcOffsetMinutes = moment().utcOffset();

      // Prepare request data
      const requestData = {
        organization: +organizationId,
        tariff: tariff_id,
        utc_offset_minutes: utcOffsetMinutes,
      };

      // Add promocode if applied
      if (isPromoApplied && promoCode) {
        requestData.promocode = promoCode.trim();
      }

      // Make API request to create transaction
      const response = await axios.post(
        "/organizations/subscription/purchase/",
        requestData
      );

      if (response.data && response.data.transaction_id) {
        // Navigate to payment selection page with transaction ID
        history.push(
          `/register/payment-select?transaction=${response.data.transaction_id}&organizationId=${organizationId}`
        );
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);

      // Show error message to user
      await confirm({
        title: translate("Ошибка", "common.error"),
        description: translate(
          "Не удалось создать транзакцию. Пожалуйста, попробуйте еще раз.",
          "payment.transactionError"
        ),
        confirmTitle: translate("OK", "common.ok"),
        cancelTitle: false,
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (!plan) {
    // Redirect back if no plan data
    history.replace(`/organizations/${organizationId}/subscription-plans`);
    return null;
  }

  return (
    <div className="payment-page">
      <MobileTopHeader
        onBack={() =>
          history.push(`/organizations/${organizationId}/subscription-plans`, {
            selectedPlan: selectedPlan,
            countryCode: countryCode,
          })
        }
        title={translate("Провести Оплату", "payment.makePayment")}
        className={`payment-page__header ${
          isScrolled ? "payment-page__header--scrolled" : ""
        }`}
      />
      <div className="subscription-payment__content">
        <div className="container">
          <div className="subscription-payment__card">
            <div className="subscription-payment__logo-container">
              <div className="subscription-payment__logo">
                <img src={logo} alt="Apofiz" />
              </div>
              <div className="subscription-payment__logo-text">
                <h3>Apofiz</h3>
                <p>
                  {translate("Торгово - Социальная сеть", "app.socialCommerce")}
                </p>
                <p className="subscription-payment__subscription-label">
                  {translate("Подписка", "payment.subscription")}
                </p>
              </div>
            </div>

            <div className="subscription-payment__plan-price">
              {plan?.price}
            </div>
            <div className="subscription-payment__plan-details">
              <div className="subscription-payment__plan-description">
                {translate(
                  "Отмените в любое время в Настройках организации. Минимум за один день до даты следующего продления. Подписка автоматически продлевается до отмены.",
                  "payment.subscriptionTerms"
                )}
              </div>
            </div>

            <div className="subscription-payment__promo-code">
              {!isPromoApplied ? (
                promoCode ? (
                  <div className="subscription-payment__promo-input-container">
                    <input
                      type="text"
                      className="subscription-payment__promo-input"
                      placeholder={translate(
                        "Введите промокод",
                        "payment.enterPromoCode"
                      )}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="subscription-payment__promo-submit"
                      disabled={isPromoLoading}
                      onClick={handleApplyPromo}
                    >
                      {isPromoLoading ? (
                        <span className="subscription-payment__loading-icon">
                          •••
                        </span>
                      ) : (
                        <span className="subscription-payment__arrow-icon">
                          →
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    className="subscription-payment__promo-button"
                    onClick={() => setPromoCode(" ")} // Set to space to trigger input display
                  >
                    {translate(
                      "Использовать код и получить скидку %",
                      "payment.usePromoCode"
                    )}
                  </div>
                )
              ) : (
                <div className="subscription-payment__promo-applied">
                  <span className="subscription-payment__promo-code-text">
                    {promoCode}
                  </span>
                  <div className="subscription-payment__promo-icon">
                    <span>✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="subscription-payment__pay-button">
            <button
              onClick={handlePayment}
              className="subscription-payment__pay-btn"
              disabled={isPaymentLoading}
            >
              <span className="subscription-payment__pay-text">
                {isPaymentLoading
                  ? "•••"
                  : isPromoApplied
                  ? `${translate(
                      "Оплатить",
                      "payment.pay"
                    )} -${discountPercent}%`
                  : translate("Оплатить", "payment.pay")}
              </span>
              <span className="subscription-payment__pay-amount">
                {formatWithCommas(isPromoApplied ? finalPrice : total_price)}{" "}
                {currency}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPaymentPage;
