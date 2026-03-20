import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "../../axios-api";
import { translate } from "../../locales/locales";
import "./index.scss";

// Icons
import { ReactComponent as BackIcon } from "../../assets/icons/back.svg";
import { ReactComponent as CopyIcon } from "../../assets/icons/copy.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as UserIcon } from "../../assets/icons/user-group.svg";
import { ReactComponent as BuildingIcon } from "../../assets/icons/building.svg";
import { ReactComponent as CoinIcon } from "../../assets/icons/coin.svg";
import MobileTopHeader from "@components/MobileTopHeader";

const AppsRefferalPage = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("statistics");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(null);

  // API state
  const [promoCode, setPromoCode] = useState("");
  const [balance, setBalance] = useState({
    current_balance: 0,
    currency: "USDT",
  });
  const [stats, setStats] = useState({
    referrals: 0,
    organizations: 0,
    turnover: 0,
  });
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, statsRes] = await Promise.all([
        axios.get("/applications/balance/"),
        axios.get("/applications/stats/"),
      ]);

      setBalance(balanceRes.data);
      setStats({
        referrals: statsRes.data.clients_count,
        organizations: statsRes.data.purchases_count,
        turnover: statsRes.data.total_profit,
      });
    } catch (e) {
      setError(
        e.response?.data?.message ||
          translate(
            "Произошла ошибка при загрузке данных",
            "payment.requestError"
          )
      );
      console.error("Error fetching referral data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error("Error copying code:", e);
    }
  };

  const handleCopyWallet = async (wallet) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedWallet(wallet);
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch (e) {
      console.error("Error copying wallet:", e);
    }
  };

  const handleBack = () => {
    history.push("/apps");
  };

  const handleWithdraw = async () => {
    // if (withdrawalLoading) return;
    // setWithdrawalLoading(true);
    // try {
    //   // Implement withdrawal logic here
    //   await axios.post("/users/referral-withdraw/", {
    //     amount: balance.current_balance,
    //   });
    //   await fetchData(); // Refresh data after withdrawal
    // } catch (e) {
    //   setError(e.response?.data?.message || "Ошибка при выводе средств");
    //   console.error("Error processing withdrawal:", e);
    // } finally {
    //   setWithdrawalLoading(false);
    // }
  };

  if (loading) {
    return (
      <div className="referral-dashboard">
        <div className="container">
          <div className="referral-dashboard__loading">
            <div className="spinner"></div>
            <div>{translate("Загрузка...", "app.loading")}</div>
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

        {/* Balance */}
        <div className="referral-dashboard__balance-container">
          <div className="referral-dashboard__balance">
            <span className="referral-dashboard__balance-amount">
              {balance.current_balance}
            </span>
            <p className="referral-dashboard__balance-currency">
              <CoinIcon />
              {balance.currency}
            </p>
          </div>
          <div className="referral-dashboard__balance-label">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 13C12.7549 13.0003 13 13.0979 13.1854 13.2728C13.3707 13.4478 13.4822 13.687 13.4972 13.9414C13.5121 14.1958 13.4293 14.4464 13.2657 14.6418C13.1021 14.8373 12.8701 14.9629 12.617 14.993L12.5 15H9.106L8.273 16.489C8.14945 16.7137 7.94433 16.8823 7.70002 16.96C7.45571 17.0378 7.19086 17.0187 6.9602 16.9068C6.72954 16.7949 6.55068 16.5986 6.46057 16.3586C6.37046 16.1185 6.37598 15.8531 6.476 15.617L6.528 15.511L6.814 15.001H6.3C6.04357 15.003 5.79615 14.9065 5.60889 14.7313C5.42163 14.5561 5.30883 14.3156 5.29381 14.0596C5.27879 13.8036 5.36269 13.5516 5.52818 13.3557C5.69367 13.1598 5.92809 13.035 6.183 13.007L6.3 13H12.5ZM14.393 10.012L16.066 13H17.7C17.9652 13 18.2196 13.1054 18.4071 13.2929C18.5946 13.4804 18.7 13.7348 18.7 14C18.7 14.2652 18.5946 14.5196 18.4071 14.7071C18.2196 14.8946 17.9652 15 17.7 15H17.186L17.473 15.512C17.5992 15.7432 17.6292 16.0148 17.5563 16.2679C17.4835 16.521 17.3137 16.7352 17.0839 16.8638C16.854 16.9925 16.5827 17.0253 16.3289 16.9551C16.075 16.885 15.8591 16.7174 15.728 16.489L12.648 10.989C12.5218 10.7578 12.4918 10.4862 12.5647 10.2331C12.6375 9.97998 12.8073 9.76584 13.0371 9.63717C13.2669 9.50849 13.5383 9.47569 13.7921 9.54587C14.046 9.61605 14.2619 9.78355 14.393 10.012ZM11.873 5.512L12 5.739L12.127 5.512C12.2566 5.28047 12.4728 5.10988 12.7281 5.03777C12.9834 4.96567 13.257 4.99794 13.4885 5.1275C13.72 5.25706 13.8906 5.47329 13.9627 5.72862C14.0348 5.98395 14.0026 6.25747 13.873 6.489L10.793 11.989C10.6619 12.2174 10.446 12.385 10.1921 12.4551C9.93825 12.5253 9.66695 12.4925 9.43713 12.3638C9.20731 12.2352 9.03754 12.021 8.96468 11.7679C8.89182 11.5148 8.92176 11.2432 9.048 11.012L10.854 7.786L10.128 6.489C10.0622 6.37433 10.0198 6.24775 10.0032 6.11658C9.98666 5.98541 9.99627 5.85226 10.0315 5.72483C10.0667 5.5974 10.1269 5.47822 10.2085 5.37418C10.29 5.27015 10.3915 5.18333 10.5068 5.11874C10.6222 5.05415 10.7492 5.01308 10.8805 4.9979C11.0119 4.98272 11.1449 4.99374 11.272 5.03031C11.399 5.06688 11.5176 5.12828 11.6207 5.21096C11.7239 5.29365 11.8096 5.39596 11.873 5.512Z"
                fill="#fff"
              />
              <path
                d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 3.66667C7.39763 3.66667 3.66667 7.39763 3.66667 12C3.66667 16.6024 7.39763 20.3333 12 20.3333C16.6024 20.3333 20.3333 16.6024 20.3333 12C20.3333 7.39763 16.6024 3.66667 12 3.66667Z"
                fill="#fff"
              />
            </svg>
            {translate("Выплаты за приложения", "apps.balance")}
          </div>
        </div>

        <div className="action-wrap">
          {/* Withdraw Button */}
          <div className="referral-dashboard__action-container">
            <button
              className={`referral-dashboard__withdraw-btn ${
                withdrawalLoading ? translate("Загрузка...", "app.loading") : ""
              }`}
              onClick={handleWithdraw}
              disabled={withdrawalLoading || balance.current_balance <= 0}
            >
              {withdrawalLoading ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <ArrowUpIcon />
                  <span>{translate("Вывести", "referral.withdraw")}</span>
                </>
              )}
            </button>
          </div>
          <div className="referral-dashboard__subscription-info">
            <h3 className="referral-dashboard__subscription-title">
              {translate("Покупки приложения", "apps.paymentApps")}
            </h3>
            <p className="referral-dashboard__subscription-description">
              {translate(
                "Оплата ресурсу 20% от приложения",
                "apps.commissionInfo"
              )}
            </p>

            {/* Stats */}
            <div className="referral-dashboard__stats">
              <div
                className="referral-dashboard__stat-item"
                // onClick={() => history.push("/apps/refferal/sold?tab=sales")}
              >
                <div className="referral-dashboard__stat-icon">
                  <UserIcon />
                </div>
                <div className="referral-dashboard__stat-value">
                  {stats.referrals}
                </div>
                <div className="referral-dashboard__stat-label">
                  {translate("Клиенты", "apps.referralsCount")}
                </div>
              </div>

              <div
                className="referral-dashboard__stat-item"
                onClick={() =>
                  history.push("/apps/refferal/sold?tab=purchases")
                }
              >
                <div className="referral-dashboard__stat-icon">
                  <BuildingIcon />
                </div>
                <div className="referral-dashboard__stat-value">
                  {stats.organizations}
                </div>
                <div className="referral-dashboard__stat-label">
                  {translate("Покупки", "apps.organizationsCount")}
                </div>
              </div>

              <div
                className="referral-dashboard__stat-item"
                onClick={() => history.push("/apps/refferal/sold?tab=sales")}
              >
                <div className="referral-dashboard__stat-icon">
                  <CoinIcon />
                </div>
                <div className="referral-dashboard__stat-value">
                  {stats.turnover}
                </div>
                <div className="referral-dashboard__stat-label">
                  {translate("Оборот", "referral.turnover")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsRefferalPage;
