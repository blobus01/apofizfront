import React, { useRef } from "react";
import * as classnames from "classnames";
import { Link } from "react-router-dom";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Lazy } from "swiper/swiper.esm.js";
import OrganizationCard from "../Cards/OrganizationCard";
import { PromotionIcon } from "../UI/Icons";
import { translate } from "../../locales/locales";
import PresentIcon from "../UI/Icons/PresentIcon";
import "./index.scss";

const PromotionBannerSlider = ({ banners, darkTheme }) => {
  const swiperRef = useRef(null);

  const params = {
    Swiper,
    modules: [Lazy],
    slidesPerView: "auto",
    centeredSlides: true,
    loop: banners.length >= 3,
    spaceBetween: 27,
    lazy: true,
  };

  const handlePrevClick = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNextClick = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };
  return (
    <>
      <div className="promotion-banner-slider__top">
        <h2 className="promotion-banner-slider__title f-16 f-700 tl">
          <span style={{ verticalAlign: "middle" }}>
            {translate("Акции", "app.promotions")}
          </span>
          <PresentIcon
            style={{
              marginLeft: 5,
              height: 26,
              width: 21,
              verticalAlign: "middle",
            }}
          />
          <div className="slide-btns">
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={handlePrevClick}
              className="prev"
              style={{ cursor: "pointer" }}
            >
              <path
                d="M8 2L2 8L8 14"
                stroke="#007AFF"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleNextClick}
              className="next"
              style={{ cursor: "pointer" }}
            >
              <path
                d="M2 14L8 8L2 2"
                stroke="#007AFF"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </h2>
        <Link
          to="/home/promotions"
          className="home-partners__top-link f-14 f-500"
        >
          {translate("Показать все", "app.showAll")}
        </Link>
      </div>
      <div
        className={classnames("promotion-banner-slider", "white-shadow-slider")}
      >
        <div className="slider-wrapp">
          <ReactIdSwiper {...params} ref={swiperRef}>
            {banners.map((banner, index) => (
              <Link
                to={`/organizations/${banner.organization.id}`}
                key={index}
                className="promotion-banner-slider__slide"
              >
                <img
                  src={banner.image && banner.image.file}
                  alt={banner.organization.title}
                  className="promotion-banner-slider__slide-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {banner.organization && (
                  <div className="promotion-banner-slider__slide-organization">
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
                  <div className="promotion-banner-slider__slide-tile">
                    <div className="promotion-banner-slider__slide-tile-content">
                      <span className="f-12 f-500 promotion-banner-slider__slide-tile-text">
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
          </ReactIdSwiper>
        </div>
      </div>
    </>
  );
};

export default PromotionBannerSlider;
