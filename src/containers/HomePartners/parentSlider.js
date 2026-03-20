import React from "react";
import * as classnames from "classnames";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Lazy } from "swiper/swiper.esm.js";
import PartnersChildSlider from "./childSlider";
import { Link } from "react-router-dom";
import OrgVerification from "../../components/UI/OrgVerification";

const getSlidesPerView = () => {
  const width = window.innerWidth;
  if (width < 410) return 2; // Мобильные
  if (width < 435) return 3; // Мобильные
  if (width < 600) return 5; // Планшеты
  if (width < 700) return 7; // Планшеты
  if (width < 800) return 8; // Планшеты
  return 9;
};
const slidesPerView = getSlidesPerView();

const PartnersSlider = ({ partners, swiperRef }) => {
  // const swiperRef = React.useRef(null);
  const [currentIndex, setIndex] = React.useState(0);
  const [reloaded, setReloaded] = React.useState(true);
  const params = {
    Swiper,
    modules: [Lazy],
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: 40,
    lazy: true,
    loop: partners && partners.length >= slidesPerView,
    loopedSlides: slidesPerView,
  };

  React.useEffect(() => {
    let current;

    if (swiperRef.current) {
      current = swiperRef.current;

      current.swiper.on("slideChange", () => {
        setReloaded(false);
        setIndex(current.swiper.realIndex);
        setReloaded(true);
      });
    }

    return () => {
      if (current) {
        current.swiper.off("slideChange", () => {
          setReloaded(false);
          setIndex(current.swiper.realIndex);
          setReloaded(true);
        });
      }
    };
  }, []);

  if (!partners) return null; // TODO: Refactor at top level

  return (
    <div className="home-partners__slider-wrapper container">
      <div className="home-partners__slider white-shadow-slider">
        <ReactIdSwiper {...params} ref={swiperRef}>
          {partners.map((partner, index) => (
            <Link
              to={`/home/partners/${partner.id}`}
              key={index}
              className="home-partners__slide home-partners__slide-parent"
            >
              <div
                className={classnames(
                  "home-partners__slide-image-wrap",
                  currentIndex === index &&
                    "home-partners__slide-image-wrap-active"
                )}
              >
                <img
                  src={partner.image && partner.image.small}
                  alt={partner.title}
                  className="home-partners__slide-image"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </ReactIdSwiper>

        <div className="container">
          <div
            className={classnames(
              "home-partners__slide-description",
              partners[currentIndex] &&
                "home-partners__slide-description-active"
            )}
          >
            <p className="f-14">
              <OrgVerification
                status={partners[currentIndex].verification_status}
              />
              {partners[currentIndex] &&
                (partners[currentIndex].title.length > 18
                  ? partners[currentIndex].title?.slice(0, 18)
                  : partners[currentIndex].title)}
            </p>
            <p className="home-partners__slide-subtitle f-12">
              {partners[currentIndex] && partners[currentIndex].types[0].title}
            </p>
          </div>
        </div>
      </div>

      {reloaded && (
        <PartnersChildSlider partners={partners[currentIndex].partners} />
      )}
    </div>
  );
};

export default PartnersSlider;
