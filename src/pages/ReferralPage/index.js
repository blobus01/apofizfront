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

const ReferralDashboardView = () => {
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
      const [promoRes, balanceRes, statsRes, historyRes] = await Promise.all([
        axios.get("/users/promocode/"),
        axios.get("/users/referral-balance/"),
        axios.get("/users/referral-stats/"),
        axios.get("/users/referral-history/"),
      ]);

      setPromoCode(promoRes.data.code);
      setBalance(balanceRes.data);
      setStats({
        referrals: statsRes.data.total_referrals,
        organizations: statsRes.data.total_organizations,
        turnover: statsRes.data.total_profit_usdt,
      });
      setHistoryItems(historyRes.data.list);
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
    history.push("/profile");
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
          title={translate("Реферальный кабинет", "referral.dashboard")}
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
            {translate("Реферальный баланс", "referral.balance")}
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

          {/* Referral Code */}
          <div className="referral-dashboard__code-container">
            <p className="referral-dashboard__code-description">
              {translate(
                "Приглашай новых пользователей и зарабатывай USDT",
                "referral.inviteDescription"
              )}
            </p>
            <div className="referral-dashboard__code">
              <span className="referral-dashboard__code-text">{promoCode}</span>
              <button
                className="referral-dashboard__copy-btn"
                onClick={handleCopyCode}
              >
                <CopyIcon />
                {copiedCode && (
                  <span className="copy-tooltip">
                    {translate("Скопировано", "referral.copy")}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="referral-dashboard__tabs">
            <button
              className={`referral-dashboard__tab ${
                activeTab === "statistics"
                  ? "referral-dashboard__tab--active"
                  : ""
              }`}
              onClick={() => setActiveTab("statistics")}
            >
              {translate("Статистика", "referral.statistics")}
            </button>
            <button
              className={`referral-dashboard__tab ${
                activeTab === "history" ? "referral-dashboard__tab--active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              {translate("История", "referral.history")}
            </button>
          </div>

          {/* Subscription Info */}
          {activeTab === "statistics" && (
            <div className="referral-dashboard__subscription-info">
              <h3 className="referral-dashboard__subscription-title">
                {translate(
                  "Реферальные подписки (Тарифы)",
                  "referral.subscriptions"
                )}
              </h3>
              <p className="referral-dashboard__subscription-description">
                {translate(
                  "Вы получаете 10% с каждого тарифа и продления",
                  "referral.commissionInfo"
                )}
              </p>

              {/* Stats */}
              <div className="referral-dashboard__stats">
                <div
                  className="referral-dashboard__stat-item"
                  onClick={() =>
                    history.push("/referral/subscriptions?tab=referrals")
                  }
                >
                  <div className="referral-dashboard__stat-icon">
                    <UserIcon />
                  </div>
                  <div className="referral-dashboard__stat-value">
                    {stats.referrals}
                  </div>
                  <div className="referral-dashboard__stat-label">
                    {translate("Рефералов", "referral.referralsCount")}
                  </div>
                </div>

                <div
                  className="referral-dashboard__stat-item"
                  onClick={() =>
                    history.push("/referral/subscriptions?tab=organizations")
                  }
                >
                  <div className="referral-dashboard__stat-icon">
                    <BuildingIcon />
                  </div>
                  <div className="referral-dashboard__stat-value">
                    {stats.organizations}
                  </div>
                  <div className="referral-dashboard__stat-label">
                    {translate("Организаций", "referral.organizationsCount")}
                  </div>
                </div>

                <div className="referral-dashboard__stat-item">
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
          )}
          {activeTab === "history" && (
            <div className="referral-dashboard__history">
              {historyItems.length > 0 ? (
                historyItems.map((item) => (
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
                    <div
                      key={item.id}
                      className="referral-dashboard__history-item"
                    >
                      {item.type === "referral_income" && (
                        <>
                          <div className="referral-dashboard__history-bonus">
                            <div className="referral-dashboard__history-bonus-title">
                              <p>
                                {translate("Бонус", "referral.bonus")}{" "}
                                {item.profit_percent || 10}%{" "}
                                {translate(
                                  "от подписки",
                                  "referral.fromSubscription"
                                )}
                              </p>
                              <p>
                                {item.original_currency}{" "}
                                {translate("в", "referral.to")} USDT
                              </p>
                              <span>
                                {item.created_at
                                  ? item.created_at?.slice(11, 16)
                                  : ""}
                              </span>
                            </div>
                            <div className="referral-dashboard__history-bonus-amount">
                              <span>
                                {item.original_amount} {item.original_currency}
                              </span>
                              {translate(
                                "конвертация в",
                                "referral.conversion"
                              )}
                              <span>{item.profit_amount_usdt} USDT</span>
                            </div>
                          </div>
                          <div className="referral-dashboard__history-organization">
                            <div className="referral-dashboard__history-org-logo">
                              <img
                                src={
                                  item.subscription?.organization?.image
                                    ?.small || "https://via.placeholder.com/40"
                                }
                                alt={item.subscription?.organization?.title}
                              />
                            </div>
                            <div className="referral-dashboard__history-org-info">
                              <div className="referral-dashboard__history-org-type">
                                {
                                  item.subscription?.organization?.types?.[0]
                                    ?.title
                                }
                              </div>
                              <div className="referral-dashboard__history-org-name">
                                {item.subscription?.organization?.title}
                              </div>
                              <div className="referral-dashboard__history-org-subscription">
                                {item.subscription?.tariff?.tariff_type_display}{" "}
                                {item.subscription?.tariff?.duration_months
                                  ? `${translate(
                                      "Оплата тариф",
                                      "referral.payment"
                                    )} ${
                                      item.subscription.tariff.duration_months
                                    } ${translate(
                                      "месяцев",
                                      "referral.months"
                                    )}`
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <div className="referral-dashboard__history-referral">
                            <div className="referral-dashboard__history-referral-info">
                              <div className="referral-dashboard__history-referral-avatar">
                                <img
                                  src={
                                    item.referred_user?.avatar?.small ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={item.referred_user?.full_name}
                                />
                              </div>
                              <div>
                                <div className="referral-dashboard__history-referral-label">
                                  Реферал
                                </div>
                                <div className="referral-dashboard__history-referral-name">
                                  {item.referred_user?.full_name}
                                </div>
                              </div>
                            </div>
                            <div className="referral-dashboard__history-status">
                              <button className="referral-dashboard__history-status-btn paid">
                                Оплатил
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {item.type === "withdrawal" && (
                        <>
                          <div className="referral-dashboard__history-withdrawal">
                            <div className="referral-dashboard__history-withdrawal-title">
                              {translate(
                                "Вывод на кошелек:",
                                "referral.withdrawalCash"
                              )}
                              <div className="referral-dashboard__history-withdrawal-amount">
                                {item.amount}
                              </div>
                            </div>
                            <div className="referral-dashboard__history-wallet">
                              <span>{item.wallet}</span>
                              <button
                                className={`referral-dashboard__copy-wallet-btn ${
                                  copiedWallet === item.wallet ? "copied" : ""
                                }`}
                                onClick={() => handleCopyWallet(item.wallet)}
                              >
                                <CopyIcon />
                                {copiedWallet === item.wallet && (
                                  <span className="copy-tooltip">
                                    {translate("Скопировано", "referral.copy")}
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="referral-dashboard__history-withdrawal-status">
                            <span>11:59</span>
                            <button className="referral-dashboard__history-status-btn">
                              {translate("Вывод", "referral.withdraw")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="referral-dashboard__empty">
                  {translate("История пуста", "referral.emptyHistory")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboardView;
