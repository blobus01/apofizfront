import React from 'react';
import * as classnames from 'classnames';
import ReactIdSwiper from 'react-id-swiper/lib/ReactIdSwiper.custom';
import { Swiper } from 'swiper/swiper.esm.js';
import './index.scss';

const params = {
  Swiper,
  lazy: true,
  modules: [],
  spaceBetween: 20,
}

const FaqImageSlider = ({ images, className }) => {
  const swiperRef = React.useRef(null);
  const [currentIndex, setIndex] = React.useState(0);

  React.useEffect(() => {
    let current;

    if (swiperRef !== null) {
      swiperRef.current.swiper.on("slideChange", () => setIndex(swiperRef.current.swiper.realIndex));
      current = swiperRef.current;
    }

    return () => {
      if (current) {
        current.swiper.off("slideChange", () => setIndex(current.swiper.realIndex));
      }
    };
  }, [swiperRef]);

  return (
    <div className={classnames("faq-image-slider", className)}>
      <ReactIdSwiper {...params} ref={swiperRef}>
        {images.map((image, index) => (
          <div key={index} className="faq-image-slider__slide">
            <img
              src={image.src}
              alt={image.alt}
              data-src={image.src}
              className="swiper-lazy"
            />
          </div>
        ))}
      </ReactIdSwiper>
      <ul className="faq-image-slider__dots">
        {images.map((item, idx) => (
          <li
            key={item.alt}
            className={classnames("faq-image-slider__dot", idx === currentIndex && "faq-image-slider__dot-active")}
            onClick={() => swiperRef !== null && swiperRef.current.swiper.slideTo(idx)}
          />
        ))}
      </ul>
    </div>
  );
};

export default FaqImageSlider;