import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as classnames from "classnames";
import { useDispatch } from "react-redux";
import ReactIdSwiper from "react-id-swiper/lib/ReactIdSwiper.custom";
import { Swiper, Navigation, Pagination, Zoom } from "swiper/swiper.esm.js";
import { CloseIcon } from "../../components/UI/Icons";
import { SLIDE_TYPES } from "../../common/constants";
import { setPlayingVideoID } from "../../store/actions/commonActions";
import {
  ImageSlide,
  InstagramImageSlide,
  InstagramVideoSlide,
  YoutubeVideoSlide,
} from "../../components/PostZoomSlider";
import { isMobile } from "../../common/utils";
import "./index.scss";

const pagination = {
  el: ".swiper-pagination",
  type: "bullets",
  clickable: true,
};

const Slideshow = ({ slides, onBack, activeSlide, className }) => {
  const swiperRef = React.useRef(null);
  const dispatch = useDispatch();
  const firstMount = useRef(true);

  // Используем Ref для хранения текущего индекса, чтобы избежать замыканий в callback-е Swiper
  const activeSlideRef = useRef(activeSlide);

  const [activeIndex, setActiveIndex] = useState(activeSlide);
  const [swiperKey, setSwiperKey] = useState(0);

  useEffect(() => {
    setSwiperKey((k) => k + 1);
    // При смене набора слайдов обновляем и ref
    activeSlideRef.current = activeSlide;
  }, [slides]);

  const stopVideo = useCallback(() => {
    dispatch(setPlayingVideoID(null));
  }, [dispatch]);

  // Этот эффект нам больше не нужен для остановки, но нужен для снятия флага firstMount
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, [stopVideo]);

  const moreThanOne = slides.length > 1;

  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const source = [];
  const isDesktop = !(
    isMobile.Android() ||
    isMobile.iOS() ||
    isMobile.BlackBerry()
  );

  // ... (Zoom logic remains the same) ...
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
        onBack && onBack();
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
  }, [onBack]);

  slides.forEach((src, slideIndex) => {
    // Добавили slideIndex
    if (src.type === SLIDE_TYPES.image) {
      source.push(<ImageSlide image={src} showOriginal key={slideIndex} />);
    }
    if (src.type === SLIDE_TYPES.instagram_image) {
      source.push(
        <InstagramImageSlide image={src} showOriginal key={slideIndex} />,
      );
    }
    if (src.type === SLIDE_TYPES.youtube_video) {
      const currentIndex = source.length;

      source.push(
        <YoutubeVideoSlide
          key={slideIndex}
          video={src}
          isVisible={activeIndex === currentIndex}
          source="fullscreen"
          isFullscreen={true} // <--- ИСПРАВЛЕНО: Говорим слайду, что он в фулскрине
        />,
      );
    }
    if (src.type === SLIDE_TYPES.instagram_video) {
      const currentIndex = source.length;

      source.push(
        <InstagramVideoSlide
          key={slideIndex}
          video={src}
          isVisible={activeIndex === currentIndex}
          isFullscreen={true} // <--- ИСПРАВЛЕНО
        />,
      );
    }
  });

  const swiperParams = useMemo(
    () => ({
      Swiper,
      modules: [Pagination, Navigation, Zoom],
      pagination,
      zoom: true,
      slidesPerView: 1,
      // 1. Обязательно указываем начальный слайд
      initialSlide: activeSlide,
      lazy: {
        loadPrevNext: false,
      },
      on: {
        slideChange: (swiper) => {
          const newIndex = swiper.activeIndex;

          // 2. ЗАЩИТА ОТ ОСТАНОВКИ ВИДЕО ПРИ ОТКРЫТИИ
          // Если текущий активный слайд (в Ref) равен новому индексу (от Swiper),
          // значит это инициализация или ложное срабатывание, и видео останавливать НЕЛЬЗЯ.
          // Видео нужно стопить, только если мы реально ушли на другой слайд.
          if (activeSlideRef.current !== newIndex) {
            stopVideo();
          }

          setActiveIndex(newIndex);
          activeSlideRef.current = newIndex; // Обновляем Ref
        },
      },
    }),
    [stopVideo, activeSlide], // Добавляем activeSlide в зависимости
  );

  return (
    <div className={classnames("slideshow", !moreThanOne && "less", className)}>
      <button type="button" onClick={onBack} className="slideshow__close">
        <CloseIcon />
      </button>
      {moreThanOne && isDesktop && (
        <>
          <button type="button" onClick={goPrev} className="slideshow__prev">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="#FFF"
                d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"
              />
            </svg>
          </button>
          <button type="button" onClick={goNext} className="slideshow__next">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="#FFF"
                d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z"
              />
            </svg>
          </button>
        </>
      )}

      {!!source.length && (
        <ReactIdSwiper {...swiperParams} ref={swiperRef} key={swiperKey}>
          {source.map((slide, idx) => (
            <div
              key={idx.toString()}
              className="swiper-slide swiper-zoom-container"
            >
              {slide}
            </div>
          ))}
        </ReactIdSwiper>
      )}
    </div>
  );
};

export default Slideshow;
