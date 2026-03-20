import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import { getServices } from "@store/actions/commonActions";
import "./index.scss";
import classNames from "classnames";
import Preloader from "@components/Preloader";
import EmptyBox from "@components/EmptyBox";
import { setDarkThemeRT } from "@store/actions/themeDark";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";

function ServicesPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const services = useSelector((state) => state.commonStore.services);
  const regionObj = useSelector((state) => state.userStore.region);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchServicesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await dispatch(
          getServices({
            country: regionObj
              ? regionObj.country_code || regionObj.code
              : null,
            city: regionObj ? regionObj.id : null,
          }),
        );
      } catch (e) {
        console.error("Error fetching services:", e);
        setError(
          e.message ||
            translate(
              "Произошла ошибка при загрузке сервисов",
              "services.loadError",
            ),
        );
      } finally {
        setIsLoading(false);
        setIsFetched(true); // Mark as fetched regardless of success or failure
      }
    };

    fetchServicesData();
  }, [dispatch, regionObj]);

  const handleBack = () => {
    history.push("/home");
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("services-page", {
        dark: darkTheme,
      })}
    >
      <MobileTopHeader
        onBack={handleBack}
        
        style={{ background: darkTheme ? "#090027" : "" }}
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
        title={translate("Все сервисы", "app.allServices")}
      />
      <div className="container">
        {isLoading ? (
          <Preloader />
        ) : isFetched && services.length === 0 ? (
          <EmptyBox
            title="Нет сервисов"
            description={!!this.state.search && "Поиск не дал результатов"}
          />
        ) : (
          <div className="services-page__grid">
            {services.map((service, index) => {
              let link = `/services/${service.id}`;
              let itemComponent = Link;
              let externalProps = {};

              if (service.is_discounts) {
                link = "/home/discounts";
              } else if (service.is_entertainment) {
                link = "http://iw.kg/";
                itemComponent = "a";
                externalProps = { target: "_blank", rel: "noreferrer" };
              } else if (service.is_map) {
                link = `/organizations-map/${service.id}`;
              } else if (service.is_resume) {
                link =
                  "/services/resumes" +
                  (regionObj ? `?region=${JSON.stringify(regionObj)}` : "");
              } else if (service.is_application) {
                link = "/apps/store";
              }

              const ServiceItemWrapper = itemComponent;

              return (
                <ServiceItemWrapper
                  key={index}
                  to={itemComponent === Link ? link : undefined}
                  href={itemComponent === "a" ? link : undefined}
                  className="services-page__grid-item"
                  {...externalProps}
                >
                  <div
                    className="services-slider__slide-banner"
                    style={{
                      backgroundImage: `url(${
                        service.banner && service.banner.large
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <div className="services-slider__slide-wrap">
                    <div className="services-slider__slide-image-wrap">
                      <img
                        src={service.icon && service.icon.small}
                        alt={service.name}
                        className="services-slider__slide-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="services-slider__slide-title-wrap dfc">
                      <h5
                        className={classNames(
                          "services-slider__slide-title f-700",
                        )}
                      >
                        {service.name}
                      </h5>
                      <p>{service.description}</p>
                    </div>
                  </div>
                </ServiceItemWrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesPage;
