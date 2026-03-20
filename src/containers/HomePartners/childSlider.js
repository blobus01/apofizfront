import React from "react";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Lazy } from "swiper/swiper.esm.js";
import { Link } from "react-router-dom";
import OrgVerification from "../../components/UI/OrgVerification";
import classnames from "classnames";
import "./index.scss";

const params = {
  Swiper,
  lazy: true,
  modules: [Lazy],
  slidesPerView: "auto",
  slidesOffsetAfter: 25,
  spaceBetween: 15,
  loop: true,
};

const PartnersChildSlider = ({ partners }) => (
  <div className="home-partners__slider home-partners__slider-child white-shadow-slider">
    <ReactIdSwiper {...params}>
      {partners.map((partner, index) => (
        <Link
          to={`/organizations/${partner.id}`}
          key={index}
          className="home-partners__slide home-partners__slide-child"
        >
          <div className="home-partners__slide-image-wrap home-partners__slide-child-image-wrap">
            <img
              src={partner.image && partner.image.small}
              alt={partner.title}
              className="home-partners__slide-image home-partners__slide-child-image"
              loading="lazy"
            />
          </div>

          <div className="home-partners__slide-child-title-wrap">
            <p
              className={classnames(
                "home-partners__slide-child-title f-12",
                partner.title.length > 19 &&
                  "home-partners__slide-child-title--clamp-text"
              )}
            >
              <OrgVerification
                status={partner.verification_status}
                className="home-partners__slide-child-verified"
              />
              <span
                className={classnames(
                  "home-partners__slide-child-title f-12",
                  partner.verification_status === "verified" &&
                    "home-partners__slide-child-title--verified"
                )}
              >
                {partner.title}
              </span>
            </p>
          </div>
        </Link>
      ))}
    </ReactIdSwiper>
  </div>
);

export default PartnersChildSlider;
