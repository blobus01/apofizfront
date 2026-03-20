import React, { useEffect, useState } from "react";
import * as classnames from "classnames";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ReactIdSwiper from "react-id-swiper";
import Swiper, { Lazy, Pagination } from "swiper";
import { CloseIcon } from "../UI/Icons";
import "./index.scss";

const pagination = {
  el: ".swiper-pagination",
  type: "bullets",
  clickable: true,
  dynamicBullets: true,
};

const params = {
  Swiper,
  slidesPerView: 1,
  lazy: {
    loadPrevNext: true,
  },
  modules: [Pagination, Lazy],
  pagination,
};

const Slideshow = ({ slides, onClose, className }) => {
  const swiperRef = React.useRef(null);
  const [playingVideo, setPlay] = useState(null);
  const resetEvents = {};
  const transformRefs = React.useRef([]);

  React.useEffect(() => {
    if (swiperRef !== null) {
      swiperRef.current.swiper.on("slideChange", () => setPlay(null));
    }

    return () => {
      if (swiperRef !== null) {
        swiperRef.current.swiper.off("slideChange", () => setPlay(null));
      }
    };
  }, [swiperRef]);

  if (slides.length > 1) {
    params.pagination = pagination;
  }

  // Получить индекс текущего слайда
  const getCurrentIndex = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      return swiperRef.current.swiper.activeIndex;
    }
    return 0;
  };

  // Zoom helpers
  const ZOOM_STEP = 0.2;
  const MAX_ZOOM = 3;
  const MIN_ZOOM = 1;

  const applyManualZoom = (scale) => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    const slideEl = swiper.slides[swiper.activeIndex];
    const zoomContainer = slideEl?.querySelector(".swiper-zoom-container");

    if (zoomContainer) {
      zoomContainer.style.transform = `scale(${scale})`;
      swiper.zoom.scale = scale;
    }
  };

  const zoomIn = () => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    const currentScale = swiper.zoom.scale || 1;
    const newScale = Math.min(currentScale + ZOOM_STEP, MAX_ZOOM);
    applyManualZoom(newScale);
  };

  const zoomOut = () => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    const currentScale = swiper.zoom.scale || 1;
    const newScale = Math.max(currentScale - ZOOM_STEP, MIN_ZOOM);
    applyManualZoom(newScale);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose && onClose();
      }
      if (e.key === "ArrowRight") {
        goNext();
      }
      if (e.key === "ArrowLeft") {
        goPrev();
      }
      if (e.key === "ArrowDown") {
        zoomOut();
      }
      if (e.key === "ArrowUp") {
        zoomIn();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Manipulate swiper from outside
  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
      resetPrevious(swiperRef.current.swiper.previousIndex);
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
      resetPrevious(swiperRef.current.swiper.previousIndex);
    }
  };

  const resetPrevious = (index) => {
    !isNaN(index) && resetEvents[index] && resetEvents[index]();
  };

  return (
    <div className={classnames("slideshow", className)}>
      <button type="button" onClick={onClose} className="slideshow__close">
        <CloseIcon />
      </button>
      <button type="button" onClick={goPrev} className="slideshow__prev">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="#FFF" d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z" />
        </svg>
      </button>
      <button type="button" onClick={goNext} className="slideshow__next">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="#FFF" d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z" />
        </svg>
      </button>
      <ReactIdSwiper {...params} ref={swiperRef}>
        {slides.map((slide, idx) => {
          return (
            <div key={slide.id} className="slideshow__slide">
              <TransformWrapper
                ref={(ref) => (transformRefs.current[idx] = ref)}
              >
                {({ resetTransform, zoomIn, zoomOut }) => {
                  resetEvents[idx] = resetTransform;
                  // Сохраняем методы для zoom
                  transformRefs.current[idx] = { zoomIn, zoomOut };
                  return (
                    <TransformComponent className="swiper-zoom-container">
                      <img
                        src={slide.large}
                        alt={slide.name}
                        className="swiper-lazy"
                      />
                    </TransformComponent>
                  );
                }}
              </TransformWrapper>
            </div>
          );
        })}
      </ReactIdSwiper>
    </div>
  );
  //
  // return (
  //   <div className="slideshow">
  //     <TransformWrapper>
  //       {/*<TransformComponent>*/}
  //         <FullViewSlider slides={slides} />
  //       {/*</TransformComponent>*/}
  //     </TransformWrapper>
  //   </div>
  // );
};

export default Slideshow;
