import React, { Component } from "react";
import { getServices } from "@store/actions/commonActions";
import { connect } from "react-redux";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Lazy } from "swiper/swiper.esm.js";
import { Link } from "react-router-dom";
import { translate } from "@locales/locales";
import classnames from "classnames";
import StarIcon from "@ui/Icons/StarIcon";
import "./index.scss";
import classNames from "classnames";

const params = {
  Swiper,
  modules: [Lazy],
  slidesPerView: "auto",
  slidesOffsetAfter: 25,
  spaceBetween: 28,
  lazy: true,
};

const SERVICE_SLIDER_ITEM_TYPES = {
  DEFAULT: "DEFAULT",
  EXTERNAL_LINK: "EXTERNAL_LINK",
};

const ServiceSliderItem = ({
  link,
  icon,
  name,
  banner,
  description,
  type = SERVICE_SLIDER_ITEM_TYPES.DEFAULT,
  className,
  ...other
}) => {
  const content = (
    <>
      <div
        className="services-slider__slide-banner"
        style={{
          backgroundImage: `url(${banner && banner.large})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="services-slider__slide-wrap">
        <div className="services-slider__slide-image-wrap">
          <img
            src={icon && icon.small}
            alt={name}
            className="services-slider__slide-image"
            loading="lazy"
          />
        </div>
        <div className="services-slider__slide-title-wrap dfc">
          <h5
            className={classnames(
              "services-slider__slide-title f-700",
              className,
            )}
          >
            {name}
          </h5>
          <p>{description}</p>
        </div>
      </div>
    </>
  );

  return type === SERVICE_SLIDER_ITEM_TYPES.DEFAULT ? (
    <Link
      to={link}
      state={{
        fromMainPage: true,
      }}
      className="services-slider__slide-link"
      {...other}
    >
      {content}
    </Link>
  ) : (
    <a
      href="http://iw.kg/"
      className="services-slider__slide-link"
      {...other}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  );
};

class ServicesSlider extends Component {
  constructor(props) {
    super(props);
    this.swiperRef = React.createRef();
  }
  componentDidMount() {
    const { country, city } = this.props.region;
    this.props.getServices({ country, city });
  }
  handlePrevClick = () => {
    if (this.swiperRef.current && this.swiperRef.current.swiper) {
      this.swiperRef.current.swiper.slidePrev();
    }
  };

  handleNextClick = () => {
    if (this.swiperRef.current && this.swiperRef.current.swiper) {
      this.swiperRef.current.swiper.slideNext();
    }
  };

  render() {
    const { services, regionObj, darkTheme } = this.props;

    if (!services.length) {
      return null;
    }

    const discountIndex = services.findIndex((item) => item["is_discounts"]);
    if (discountIndex > 0) {
      const discount = services.splice(discountIndex, 1);
      services.unshift(discount[0]);
    }

    return (
      <div className={classNames("services-slider", darkTheme && "dark")}>
        <div className="services-slider__top-row dfc">
          <h2 className="services-slider__title f-16 f-700 tl">
            <span style={{ verticalAlign: "middle" }}>
              {translate("Сервисы", "app.services")}
            </span>
            <StarIcon
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
                onClick={this.handlePrevClick}
                className="prev"
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
                onClick={this.handleNextClick}
                className="next"
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
            to="/home/services"
            className="home-partners__top-link f-14 f-500"
          >
            {translate("Показать все", "app.showAll")}
          </Link>
        </div>
        <div
          className={classnames(
            "services-slider__wrap",
            !darkTheme && "white-shadow-slider",
          )}
        >
          <ReactIdSwiper {...params} ref={this.swiperRef}>
            {services.map((service, index) => {
              let link = `/services/${service.id}`;
              const props = {};

              if (service.is_discounts) {
                link = "/home/discounts";
              } else if (service.is_entertainment) {
                link = "http://iw.kg/";
                props.type = SERVICE_SLIDER_ITEM_TYPES.EXTERNAL_LINK;
              } else if (service.is_map) {
                link = `/organizations-map/${service.id}`;
              } else if (service.is_resume) {
                link =
                  "/services/resumes" +
                  (regionObj ? `?region=${JSON.stringify(regionObj)}` : "");
              } else if (service.is_application) {
                link = "/apps/store";
              }
              return (
                <div className="services-slider__slide" key={index}>
                  <ServiceSliderItem
                    key={index}
                    link={link}
                    icon={service.icon}
                    name={service.name}
                    banner={service.banner}
                    description={service.description}
                    className={
                      service.name.length > 17 &&
                      "services-slider__slide-title--clamp-text"
                    }
                    {...props}
                  />
                </div>
              );
            })}
          </ReactIdSwiper>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  services: state.commonStore.services,
  regionObj: state.userStore.region,
});

const mapDispatchToProps = (dispatch) => ({
  getServices: (params) => dispatch(getServices(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServicesSlider);
