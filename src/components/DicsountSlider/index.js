import React, { forwardRef, useRef, useImperativeHandle } from "react";
import * as classnames from "classnames";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Navigation, Pagination } from "swiper/swiper.esm.js";
import { DISCOUNT_TYPES } from "../../common/constants";
import { translate } from "../../locales/locales";
import "./index.scss";
import { formatWithCommas } from "@common/helpers";

const params = {
  Swiper,
  modules: [Navigation, Pagination],
  pagination: {
    el: ".swiper-pagination",
    type: "bullets",
    clickable: true,
  },
  spaceBetween: 30,
};

const DiscountSlider = forwardRef(
  ({ clientStatus, children, cards, className, slideClassName, darkTheme }, ref) => {
    const internalSwiperRef = useRef(null);
    useImperativeHandle(ref, () => internalSwiperRef.current);
    const [currentIndex, setIndex] = React.useState(0);

    React.useEffect(() => {
      let current;

      if (internalSwiperRef !== null) {
        internalSwiperRef.current.swiper.on("slideChange", () =>
          setIndex(internalSwiperRef.current.swiper.realIndex)
        );
        current = internalSwiperRef.current;
      }

      return () => {
        if (current) {
          current.swiper.off("slideChange", () =>
            setIndex(current.swiper.realIndex)
          );
        }
      };
    }, [internalSwiperRef]);

    return (
  <div className={classnames("discount-slider", darkTheme && "dark")}>
        <ReactIdSwiper {...params} ref={internalSwiperRef}>
          {children.map((card, index) => (
            <div key={index} className={slideClassName}>
              {card}
            </div>
          ))}
        </ReactIdSwiper>

        {clientStatus && clientStatus.type === DISCOUNT_TYPES.cumulative && (
          <div className="discount-slider__earned f-14">
            {translate("Накоплено", "app.accumulated")}:{" "}
            <span>
              {(clientStatus &&
                formatWithCommas(Math.floor(clientStatus.total_spent))) ||
                0}
            </span>{" "}
            <span>/</span>{" "}
            <span>
              {cards[currentIndex] &&
                formatWithCommas(Math.round(cards[currentIndex].limit))}{" "}
              {cards[currentIndex].currency}
            </span>
          </div>
        )}

        {clientStatus && clientStatus.type === DISCOUNT_TYPES.cashback && (
          <div className="discount-slider__earned f-14">
            {translate("Доступный кэшбек", "app.availableCashback")}:{" "}
            <span>
              {clientStatus.accrued_cashback} {clientStatus.currency}
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default DiscountSlider;
