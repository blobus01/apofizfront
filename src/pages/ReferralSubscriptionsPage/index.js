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

const ReferralSubscriptionsPage = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("referrals");
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
    if (tabParam === "organizations") {
      setActiveTab("organizations");
    } else if (tabParam === "referrals") {
      setActiveTab("referrals");
    }
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "referrals") {
        const response = await axios.get("/users/referrals/");
        setReferralsList(
          response.data.list.map((referral) => ({
            ...referral,
            expanded: false,
            organizations: referral.organizations.map((org) => ({
              id: org.id,
              name: org.organization.title,
              type: org.organization.types[0]?.title || "Организация",
              daysLeft: org.days_left,
              logo:
                org.organization.image?.small ||
                "https://via.placeholder.com/40",
            })),
          }))
        );
      } else {
        const response = await axios.get("/users/referrals/organizations/");
        setOrganizationsList(
          response.data.list.map((org) => ({
            id: org.id,
            name: org.title,
            type: "Организация",
            logo: org.image?.small || "https://via.placeholder.com/40",
            expanded: false,
            referrals: org.users.map((user) => ({
              id: user.id,
              name: user.full_name,
              username: user.phone_number,
              avatar: user.avatar?.small || "https://via.placeholder.com/40",
            })),
          }))
        );
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
    history.push("/referral");
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
          title={translate(
            "Реферальные подписки",
            "referral.subscriptions.title"
          )}
          className={`referral-subscriptions__header ${
            isScrolled ? "referral-subscriptions__header--scrolled" : ""
          }`}
        />

        {/* Tabs */}
        <div className="referral-subscriptions__tabs">
          <button
            className={`referral-subscriptions__tab ${
              activeTab === "referrals"
                ? "referral-subscriptions__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("referrals")}
          >
            {translate("Рефералы", "referral.subscriptions.referrals")}
            {activeTab === "referrals" && (
              <div className="referral-subscriptions__tab-indicator"></div>
            )}
          </button>
          <button
            className={`referral-subscriptions__tab ${
              activeTab === "organizations"
                ? "referral-subscriptions__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("organizations")}
          >
            {translate("Организации", "referral.subscriptions.organizations")}
            {activeTab === "organizations" && (
              <div className="referral-subscriptions__tab-indicator"></div>
            )}
          </button>
        </div>

        {/* Referrals List */}
        {activeTab === "referrals" && (
          <div className="referral-subscriptions__list">
            {loading ? (
              <div className="referral-subscriptions__loading">
                {translate("Загрузка...", "app.loading")}
              </div>
            ) : referralsList.length > 0 ? (
              referralsList.map((referral) => (
                <div key={referral.id} className="referral-subscriptions__item">
                  <div
                    className="referral-subscriptions__referral"
                    onClick={() => toggleReferralExpand(referral.id)}
                  >
                    <div className="referral-subscriptions__avatar">
                      <img
                        src={referral.avatar?.small}
                        alt={referral.full_name}
                      />
                    </div>
                    <div className="referral-subscriptions__info">
                      <div className="referral-subscriptions__name">
                        {referral.full_name}
                      </div>
                      <div className="referral-subscriptions__username">
                        @{referral.username}
                      </div>
                    </div>
                    <button className="referral-subscriptions__expand-btn">
                      {referral.expanded ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}
                    </button>
                  </div>

                  {referral.expanded && referral.organizations.length > 0 && (
                    <div className="referral-subscriptions__organizations">
                      {referral.organizations.map((org) => (
                        <div
                          key={org.id}
                          className="referral-subscriptions__org-item"
                        >
                          <div className="referral-subscriptions__org-logo">
                            <img src={org.logo} alt={org.name} />
                          </div>
                          <div className="referral-subscriptions__org-info">
                            <div className="referral-subscriptions__org-type">
                              {org.type}
                            </div>
                            <div className="referral-subscriptions__org-name">
                              {org.name}
                            </div>
                            <div className="referral-subscriptions__org-days">
                              {translate(
                                "Осталось",
                                "referral.subscriptions.daysLeft"
                              )}{" "}
                              {org.daysLeft}{" "}
                              {translate("дня", "referral.subscriptions.days")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="referral-subscriptions__empty">
                {" "}
                {translate(
                  "Нет рефералов",
                  "referral.subscriptions.noReferrals"
                )}
              </div>
            )}
          </div>
        )}

        {/* Organizations List */}
        {activeTab === "organizations" && (
          <div className="referral-subscriptions__list">
            {loading ? (
              <div className="referral-subscriptions__loading">
                {translate("Загрузка...", "app.loading")}
              </div>
            ) : organizationsList.length > 0 ? (
              organizationsList.map((org) => (
                <div key={org.id} className="referral-subscriptions__item">
                  <div
                    className="referral-subscriptions__org-container"
                    onClick={() => toggleOrganizationExpand(org.id)}
                  >
                    <div className="referral-subscriptions__org-logo">
                      <img src={org.logo} alt={org.name} />
                    </div>
                    <div className="referral-subscriptions__org-info">
                      <div className="referral-subscriptions__org-type">
                        {org.type}
                      </div>
                      <div className="referral-subscriptions__org-name">
                        {org.name}
                      </div>
                    </div>
                    <button className="referral-subscriptions__expand-btn">
                      {org.expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  </div>

                  {org.expanded &&
                    org.referrals &&
                    org.referrals.length > 0 && (
                      <div className="referral-subscriptions__referrals">
                        {org.referrals.map((referral) => (
                          <div
                            key={referral.id}
                            className="referral-subscriptions__referral-info"
                          >
                            <div className="referral-subscriptions__avatar">
                              <img src={referral.avatar} alt={referral.name} />
                            </div>
                            <div className="referral-subscriptions__info">
                              <div className="referral-subscriptions__name">
                                {referral.name}
                              </div>
                              <div className="referral-subscriptions__username">
                                {referral.username}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="referral-subscriptions__empty">
                {translate(
                  "Нет организаций",
                  "referral.subscriptions.noOrganizations"
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSubscriptionsPage;
