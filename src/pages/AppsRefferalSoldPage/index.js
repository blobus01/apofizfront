import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { translate } from "../../locales/locales";
import axios from "../../axios-api";
import "./index.scss";

// Icons
import { ReactComponent as BackIcon } from "../../assets/icons/back.svg";
import { ReactComponent as ChevronDownIcon } from "../../assets/icons/chevron-down.svg";
import { ReactComponent as ChevronUpIcon } from "../../assets/icons/chevron-up.svg";
import MobileTopHeader from "@components/MobileTopHeader";

const FallbackImage = ({
  text = translate("Нет изображения", "apps.noImage"),
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "162px",
        aspectRatio: "16 / 9",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: "16px",
        fontWeight: "500",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};

const AppsReferralSoldPage = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralsList, setReferralsList] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const position = useRef(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".referral-subscriptions__header");
    const onScroll = () => {
      position.current = window.pageYOffset;
      if (position.current > 0) {
        setIsScrolled(true);
        return el && el.classList.add("visible");
      }
      setIsScrolled(false);
      el && el.classList.remove("visible");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam === "purchases") {
      setActiveTab("purchases");
    } else if (tabParam === "sales") {
      setActiveTab("sales");
    }
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "sales") {
        const response = await axios.get("/applications/sold/");
        setReferralsList(response.data.list);
      } else {
        const response = await axios.get("/applications/purchases/");
        setOrganizationsList(response.data.list);
      }
    } catch (e) {
      setError(
        e.response?.data?.message || "Произошла ошибка при загрузке данных"
      );
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleBack = () => {
    history.push("/apps/refferal");
  };

  const toggleReferralExpand = (id) => {
    setReferralsList(
      referralsList.map((referral) =>
        referral.id === id
          ? { ...referral, expanded: !referral.expanded }
          : referral
      )
    );
  };

  const toggleOrganizationExpand = (id) => {
    setOrganizationsList(
      organizationsList.map((org) =>
        org.id === id ? { ...org, expanded: !org.expanded } : org
      )
    );
  };

  return (
    <div className="referral-subscriptions">
      <div className="container">
        {/* Header */}
        <MobileTopHeader
          onBack={handleBack}
          title={translate("Покупки и продажи", "appsReferral.dashboard")}
          className={`referral-subscriptions__header ${
            isScrolled ? "referral-subscriptions__header--scrolled" : ""
          }`}
        />

        {/* Tabs */}
        <div className="referral-subscriptions__tabs">
          <button
            className={`referral-subscriptions__tab ${
              activeTab === "sales" ? "referral-subscriptions__tab--active" : ""
            }`}
            onClick={() => setActiveTab("sales")}
          >
            {translate("Продажи", "shop.sales")}
            {activeTab === "sales" && (
              <div className="referral-subscriptions__tab-indicator"></div>
            )}
          </button>
          <button
            className={`referral-subscriptions__tab ${
              activeTab === "purchases"
                ? "referral-subscriptions__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("purchases")}
          >
            {translate("Покупки", "apps.organizationsCount")}
            {activeTab === "purchases" && (
              <div className="referral-subscriptions__tab-indicator"></div>
            )}
          </button>
        </div>

        {/* Referrals List */}
        {activeTab === "sales" && (
          <div className="referral-subscriptions__list">
            {loading ? (
              <div className="referral-subscriptions__loading">
                {translate("Загрузка...", "app.loading")}
              </div>
            ) : referralsList.length > 0 ? (
              referralsList.map((referral) => (
                <div className="card-wrap" key={referral.id}>
                  <div className="apps__content__item">
                    {referral.selected_banner ? (
                      <div
                        onClick={() =>
                          history.push(`/apps/refferal/sold/${referral.id}`)
                        }
                        className="apps__content__item__banner"
                        style={{
                          "--bg-image": `url(${referral.selected_banner.image.file})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          cursor: "pointer",
                        }}
                      ></div>
                    ) : (
                      <FallbackImage />
                    )}

                    <div className="apps__content__item__info">
                      <div className="apps__content__item__info__title">
                        <div className="apps__content__item__info__title__logo">
                          <img
                            src={referral.image.medium}
                            alt={referral.title}
                          />
                        </div>
                        <div className="apps__content__item__info__title__text">
                          <h4 className="tl">{referral.title}</h4>
                          <p className="tl">
                            {referral.types
                              .map((type) => type.title)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="apps__content__item__info__actions">
                        <h4>
                          {referral.price} <span>USDT</span>
                        </h4>
                        <p>
                          {translate(
                            "за весь период",
                            "appsReferral.forAllPeriod"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="referral-subscriptions__empty">
                {" "}
                {translate(
                  "Нет продаж",
                  "appReferral.subscriptions.noReferrals"
                )}
              </div>
            )}
          </div>
        )}

        {/* Organizations List */}
        {activeTab === "purchases" && (
          <div className="referral-subscriptions__list">
            {loading ? (
              <div className="referral-subscriptions__loading">
                {translate("Загрузка...", "app.loading")}
              </div>
            ) : organizationsList.length > 0 ? (
              organizationsList.map((item) => (
                <div
                  className="referral-subscriptions__list__item"
                  key={item.id}
                >
                  <div className="referral-dashboard__history-date">
                    {item.created_at
                      ? item.created_at
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join(".")
                      : ""}
                  </div>
                  <div className="referral-dashboard__history-item">
                    <div className="referral-dashboard__history-bonus">
                      <div className="referral-dashboard__history-bonus-title">
                        <p>TRC20 </p>
                        <span>
                          {item.created_at ? item.created_at.slice(11, 16) : ""}
                        </span>
                      </div>
                      <div className="referral-dashboard__history-bonus-amount">
                        <span>
                          {item.original_amount} {item.original_currency}
                        </span>
                        {translate("Оплата за приложение", "appsReferral.pay")}
                        <span>{item.amount} USDT</span>
                      </div>
                    </div>
                    <div className="referral-dashboard__history-organization">
                      <div className="referral-dashboard__history-content">
                        <div className="referral-dashboard__history-org-logo">
                          <img
                            src={
                              item.app?.image?.medium ||
                              "https://via.placeholder.com/40"
                            }
                            alt={item.subscription?.organization?.title}
                          />
                        </div>
                        <div className="referral-dashboard__history-org-info">
                          <h4 className="referral-dashboard__history-org-name tl">
                            {item.app?.title}
                          </h4>
                          <p className="referral-dashboard__history-org-type tl">
                            {item.app?.types
                              ?.map((item) => item.title)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <span>
                        {translate("Покупка", "appsReferral.purchase")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="referral-subscriptions__empty">
                {translate(
                  "Нет покупок",
                  "appReferral.subscriptions.noOrganizations"
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppsReferralSoldPage;
