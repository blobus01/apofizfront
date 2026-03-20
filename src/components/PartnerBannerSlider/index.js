import React from "react";
import * as classnames from "classnames";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper } from "swiper/swiper.esm.js";
import { Link } from "react-router-dom";
import OrganizationCard from "../Cards/OrganizationCard";
import "./index.scss";

const params = {
  Swiper,
  modules: [],
  slidesPerView: "auto",
  centeredSlides: true,
  loop: true,
  spaceBetween: 40,
};

const PartnerBannerSlider = ({ banners, className }) => {
  return (
    <div className={classnames("partner-banner-slider", className)}>
      <ReactIdSwiper {...params}>
        {banners.map((banner, index) => (
          <Link
            to={`/organizations/${banner.linked_organization.id}`}
            key={index}
            className="partner-banner-slider__slide"
          >
            <img
              src={banner.image && banner.image.file}
              alt={banner.linked_organization.title}
              className="partner-banner-slider__slide-image"
            />
            <div className="partner-banner-slider__slide-organization">
              <OrganizationCard
                title={banner.linked_organization.title}
                image={
                  banner.linked_organization.image &&
                  banner.linked_organization.image.medium
                }
                onClick={() => null}
                size={40}
                className="partner-banner-slider__slide-organization-card"
              />
            </div>
          </Link>
        ))}
      </ReactIdSwiper>
    </div>
  );
};

export default PartnerBannerSlider;
