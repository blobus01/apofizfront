import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "@locales/locales";
import { StandardButton } from "@ui/Buttons";
import "./index.scss";
import { useParams } from "react-router-dom";
import axios from "../../axios-api";
import Preloader from "../../components/Preloader";
import { formatWithCommas } from "@common/helpers";
import useDialog from "@components/UI/Dialog/useDialog";

const SubscriptionPlansPage = () => {
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams();
  const [selectedPlan, setSelectedPlan] = useState(
    location.state?.selectedPlan || "standard"
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const countryCode = location.state?.countryCode;
  const { confirm } = useDialog();

  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/organizations/tariffs/?country=${countryCode}`
        );
        if (
          !Array.isArray(response.data.list) ||
          response.data.list.length === 0
        ) {
          confirm({
            title: translate("Ошибка", "common.error"),
            description: translate(
              "Нет доступных тарифов",
              "tariffs.noTariffs"
            ),
          })
            .then(() => {
              history.push(`/organizations/${id}`, { fromChildRoute: true });
            })
            .catch(() => {
              history.push(`/organizations/${id}`, { fromChildRoute: true });
            });
          setTariffs([]); // или не обновлять, если не нужно
          return;
        }
        if (response.data && response.data.list) {
          setTariffs(response.data.list);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tariffs:", err);
        setError("Failed to load subscription plans");
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [countryCode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const plans = tariffs.map((tariff) => ({
    id: tariff.tariff_type,
    name: translate(
      tariff.tariff_type_display,
      `subscription.${tariff.tariff_type}`
    ),
    price: `${formatWithCommas(tariff.price_per_month)} ${tariff.currency}/${
      tariff.duration_months
    } ${
      tariff.duration_months === 1
        ? translate("месяц", "subscription.month")
        : translate("месяцев", "subscription.months")
    }`,
    discount: tariff.discount ? `${tariff.discount}%` : "",
    originalPrice: tariff.original_price,
    duration: tariff.duration_months,
    features: [
      translate(
        "Доступ ко всем пользователям",
        "subscription.accessToAllUsers"
      ),
      translate("Возможность верификации", "subscription.verificationOption"),
      translate("Возможность кредитов", "subscription.creditOption"),
      translate(
        "Возможность поиска Вашей организации",
        "subscription.searchOption"
      ),
      translate(
        "Возможность подключения платежей",
        "subscription.paymentOption"
      ),
    ],
  }));

  const handleSubscribe = (selectedPlan) => {
    setSelectedPlan(selectedPlan);
    const selectedPlanData = plans.find((plan) => plan.id === selectedPlan);
    const selectedTariff = tariffs.find(
      (tariff) => tariff.tariff_type === selectedPlan
    );

    history.push({
      pathname: `/organizations/${id}/payment`,
      state: {
        plan: selectedPlanData,
        organizationId: id,
        countryCode: countryCode,
        selectedPlan: selectedPlan,
        total_price: selectedTariff?.total_price,
        tariff_id: selectedTariff?.id,
      },
    });
  };

  if (loading) {
    return (
      <div className="subscription-plans">
        <MobileTopHeader
          onBack={() => history.push(`/organizations/${id}`)}
          title={translate("Доступные тарифы", "subscription.availablePlans")}
          className={`subscription-plans__header ${
            isScrolled ? "payment-page__header--scrolled" : ""
          }`}
        />
        <div className="subscription-plans__loading">
          <Preloader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-plans">
        <MobileTopHeader
          onBack={() => history.push(`/organizations/${id}`)}
          title={translate("Доступные тарифы", "subscription.availablePlans")}
          className={`subscription-plans__header ${
            isScrolled ? "payment-page__header--scrolled" : ""
          }`}
        />
        <div className="subscription-plans__error">
          <p>{error}</p>
          <button
            className="subscription-plans__retry-btn"
            onClick={() => window.location.reload()}
          >
            {translate("Попробовать снова", "common.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-plans">
      <MobileTopHeader
        onBack={() =>
          history.push(`/organizations/${id}`, { fromChildRoute: true })
        }
        title={translate("Доступные тарифы", "subscription.availablePlans")}
        className={`subscription-plans__header ${
          isScrolled ? "subscription-plans__header--scrolled" : ""
        }`}
      />

      <div className="subscription-plans__content">
        <div className="container">
          <h2 className="subscription-plans__title">
            <span className="orange-text">
              {translate("Выбери ", "subscription.chooseYourPlanStart")}
            </span>
            <span className="white-text">
              {translate("Свой ", "subscription.chooseYourPlanMiddle")}
            </span>
            <span className="orange-text">
              {translate("Тариф %", "subscription.chooseYourPlanEnd")}
            </span>
          </h2>

          <div className="subscription-plans__features">
            {plans[0].features.map((feature, index) => (
              <div key={index} className="subscription-plans__feature-item">
                <span className="subscription-plans__feature-check">✓</span>
                <span className="subscription-plans__feature-text">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="subscription-plans__plans">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`subscription-plans__plan ${
                  selectedPlan === plan.id
                    ? "subscription-plans__plan--selected"
                    : ""
                }`}
                onClick={() => handleSubscribe(plan.id)}
              >
                <div className="subscription-plans__plan-header">
                  <h3 className="subscription-plans__plan-name">{plan.name}</h3>
                  <p className="subscription-plans__plan-price">{plan.price}</p>
                </div>

                {plan.discount && (
                  <div
                    className={`subscription-plans__plan-discount ${
                      plan.discount === "50%"
                        ? "subscription-plans__plan-discount--fifty"
                        : plan.discount === "20%"
                        ? "subscription-plans__plan-discount--twenty"
                        : ""
                    }`}
                  >
                    <span>- {plan.discount}</span>
                  </div>
                )}

                <div className="subscription-plans__plan-selector">
                  <div
                    className={`subscription-plans__plan-radio ${
                      selectedPlan === plan.id
                        ? "subscription-plans__plan-radio--selected"
                        : ""
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="subscription-plans__plan-radio-inner"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
