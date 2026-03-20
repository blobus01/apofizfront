import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { getOrgPromotions } from "@store/actions/organizationActions";
import "./index.scss";

import Preloader from "@components/Preloader";
import EmptyBox from "@components/EmptyBox";
import { PromotionIcon } from "@components/UI/Icons";
import OrganizationCard from "@components/Cards/OrganizationCard";
import ShopControls from "@components/ShopControls";
import axios from "../../axios-api";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";
import classNames from "classnames";

function PromotionsPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const orgPromotions = useSelector(
    (state) => state.organizationStore.orgPromotions,
  );
  const regionObj = useSelector((state) => state.userStore.region);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [promoTypes, setPromoTypes] = useState([]);
  const [selectedPromoTypeId, setSelectedPromoTypeId] = useState(null);

  const fetchPromoTypes = useCallback(async () => {
    try {
      const { country_code: country } = regionObj || {};
      const response = await axios.get(`/promos/types/`, {
        params: { country },
      });
      setPromoTypes(response.data.list);
    } catch (e) {
      console.error("Error fetching promo types:", e);
      // Optionally set error for types fetching if needed
    }
  }, [regionObj]);

  const fetchPromotionsData = useCallback(
    async (typeId = null) => {
      setIsLoading(true);
      setError(null);
      try {
        const { country_code: country, city } = regionObj || {};
        const params = { page: 1, limit: 100, country, city };
        if (typeId) {
          params.type_id = typeId;
        }
        await dispatch(getOrgPromotions(params));
      } catch (e) {
        console.error("Error fetching promotions:", e);
        setError(
          e.message ||
            translate(
              "Произошла ошибка при загрузке акций",
              "promotions.loadError",
            ),
        );
      } finally {
        setIsLoading(false);
        setIsFetched(true);
      }
    },
    [dispatch, regionObj],
  );

  useEffect(() => {
    fetchPromoTypes();
  }, [fetchPromoTypes]);

  useEffect(() => {
    fetchPromotionsData(selectedPromoTypeId);
  }, [fetchPromotionsData, selectedPromoTypeId]);

  const handleBack = () => {
    history.push("/home");
  };
  const handleTypeSelect = (category) => {
    setSelectedPromoTypeId(category ? category.id : null);
  };

  const promotions = orgPromotions?.data?.list || [];

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("promotions-page", {
        dark: darkTheme,
      })}
    >
      <MobileTopHeader
        onBack={handleBack}
        style={{ background: darkTheme ? "#090027" : "", padding: '4px 0' }}
        darkTheme={darkTheme}
        renderRight={() => (
          <span
            style={{ marginLeft: "20px" }}
            className="theme-toggle"
            onClick={() => dispatch(setDarkThemeRT(!darkTheme))}
          >
            <div
              key={darkTheme ? "dark" : "light"}
              className="theme-toggle__icon"
            >
              {darkTheme ? <DarkTheme /> : <LightTheme />}
            </div>
          </span>
        )}
        title={translate("Акции", "app.promotions")}
      />
      <ShopControls
        darkTheme={darkTheme}
        className="shop-controls-with-view-change__shop-controls sticky"
        categories={promoTypes}
        selectedCategory={selectedPromoTypeId}
        onCategorySelect={handleTypeSelect}
      />
      <div className="container">
        {isLoading && !isFetched ? (
          <Preloader />
        ) : error ? (
          <div className="promotions-page__message promotions-page__message--error">
            <h3>{translate("Ошибка", "common.error")}</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              {translate("Повторить", "common.retry")}
            </button>
          </div>
        ) : isFetched && promotions.length === 0 ? (
          <EmptyBox
            title={translate("Акций не найдено", "promotions.notFound")}
            description={translate(
              "Попробуйте позже или измените регион",
              "promotions.tryLater",
            )}
          />
        ) : (
          <div className="promotions-page__grid">
            {promotions.map((banner, index) => (
              <Link
                to={`/organizations/${banner.organization.id}`}
                key={index}
                className="promotions-page-slider__slide"
              >
                <img
                  src={banner.image && banner.image.large}
                  alt={banner.organization.title}
                  className="promotions-page-slider__slide-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {banner.organization && (
                  <div className="promotions-page-slider__slide-organization">
                    <OrganizationCard
                      size={24}
                      title={banner.organization.title}
                      image={
                        banner.organization.image &&
                        banner.organization.image.small
                      }
                      onClick={() => null}
                    />
                  </div>
                )}

                {banner.organization && (
                  <div className="promotions-page-slider__slide-tile">
                    <div className="promotions-page-slider__slide-tile-content">
                      <span className="f-12 f-500 promotions-page-slider__slide-tile-text">
                        {translate(
                          "Подпишитесь и получите кэшбэк",
                          "promoCashback.cashbackForSubs",
                        )}{" "}
                        {Number(banner.cashback)} {banner.organization.currency}
                      </span>
                      <PromotionIcon color="#FFF" />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PromotionsPage;
