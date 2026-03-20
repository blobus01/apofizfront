import React, { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "../../axios-api";
import { translate } from "../../locales/locales";
import "./index.scss";

// Icons
import { ReactComponent as CopyIcon } from "../../assets/icons/copy.svg";
import MobileTopHeader from "@components/MobileTopHeader";

const ReferralDashboardView = () => {
  const history = useHistory();
  const { id } = useParams();
  const [copiedWallet, setCopiedWallet] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // API state
  const [soldData, setSoldData] = useState({
    total_count: 0,
    total_pages: 0,
    list: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const position = useRef(0);

  useEffect(() => {
    const el = document.getElementById("referral-dashboard__header");

    const onScroll = () => {
      position.current = window.pageYOffset;
      if (position.current > 0) {
        setIsScrolled(true);
        return el && el.classList.add("visible");
      }
      el && el.classList.remove("visible");
      setIsScrolled(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loading]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/applications/${id}/sold/`);
      setSoldData(response.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          translate(
            "Произошла ошибка при загрузке данных",
            "payment.requestError"
          )
      );
      console.error("Error fetching sold data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    history.push("/apps/refferal/sold/");
  };

  if (loading) {
    return (
      <div className="referral-dashboard">
        <div className="container">
          <div className="referral-dashboard__loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referral-dashboard">
        <div className="container">
          <div className="referral-dashboard__error">
            <h3>{translate("Ошибка", "common.error")}</h3>
            <p>{error}</p>
            <button
              className="referral-dashboard__retry-btn"
              onClick={fetchData}
            >
              {translate("Повторить", "common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-dashboard">
      <div className="container">
        <MobileTopHeader
          onBack={handleBack}
          title={translate("Покупки и продажи", "appsReferral.dashboard")}
          className={`referral-dashboard__header ${
            isScrolled ? "referral-dashboard__header--scrolled" : ""
          }`}
        />

        <div className="action-wrap">
          <div className="referral-dashboard__history">
            {soldData.list.length > 0 ? (
              soldData.list.map((item) => (
                <React.Fragment key={item.id}>
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
                        <p>
                          {translate(
                            "Комиссия 20%",
                            "appsReferral.commission20"
                          )}
                        </p>
                        <p>TRC20</p>
                        <span>
                          {item.created_at
                            ? item.created_at?.slice(11, 16)
                            : ""}
                        </span>
                      </div>
                      <div className="referral-dashboard__history-bonus-amount">
                        <span>{item.original_amount} USDT</span>
                        {translate("Оплата за приложение", "appsReferral.pay")}
                        <span>{item.profit_amount} USDT</span>
                      </div>
                    </div>
                    <div className="referral-dashboard__history-referral">
                      <div className="referral-dashboard__history-referral-info">
                        <div className="referral-dashboard__history-referral-avatar">
                          <img
                            src={
                              item.user?.avatar?.small ||
                              "https://via.placeholder.com/40"
                            }
                            alt={item.user?.full_name}
                          />
                        </div>
                        <div>
                          <div className="referral-dashboard__history-referral-label">
                            {translate("Клиент", "appsReferral.client")}
                          </div>
                          <div className="referral-dashboard__history-referral-name">
                            {item.user?.full_name}
                          </div>
                        </div>
                      </div>
                      <div className="referral-dashboard__history-status">
                        <button
                          className={`referral-dashboard__history-status-btn ${
                            item.is_paid ? "paid" : ""
                          }`}
                        >
                          {item.is_paid
                            ? translate("Оплатил", "appsReferral.paid")
                            : translate(
                                "Ожидает оплаты",
                                "appsReferral.awaitingPayment"
                              )}
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="referral-dashboard__empty">
                {translate("История продаж пуста", "referral.emptySales")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboardView;
