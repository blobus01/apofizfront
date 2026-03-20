import React, {useState} from 'react';
import * as classnames from 'classnames';
import ReactIdSwiper from 'react-id-swiper/lib/ReactIdSwiper.custom';
import { Swiper, Pagination, Lazy } from 'swiper/swiper.esm.js';
import Preloader from '../Preloader';
import './index.scss';

const params = {
  Swiper,
  slidesPerView: 1,
  lazy: {
    loadPrevNext: true
  },
  modules: [Pagination, Lazy]
}

const pagination = {
  el: '.swiper-pagination',
  type: 'bullets',
  clickable: true,
  dynamicBullets: true
}

const PostSlider = ({ slides, className }) => {
  const swiperRef = React.useRef(null);
  const [playingVideo, setPlay] = useState(null);

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

  return (
    <div className={classnames("post-slider", className)}>
      <ReactIdSwiper {...params} ref={swiperRef}>
        {slides.map((slide, idx) => {
          if (slide.provider === 'youtube') {
            const isPlaying = playingVideo && playingVideo === slide.uid;
            return (
              <div key={idx} className="post-slider__slide">
                <div className={classnames("post-slider__video", !isPlaying && "youtube")}>
                  {isPlaying ? (
                    <iframe
                      src={slide.link}
                      allow='accelerometer; autoplay; fullscreen'
                      className={classnames("swiper-lazy post-slider__video-player", !isPlaying && 'hidden')}
                    />) : (
                    <img
                      onClick={() => setPlay(slide.uid)}
                      data-src={slide.preview}
                      alt='youtube-preview'
                      style={{objectFit: 'contain', cursor: "pointer"}}
                      className={classnames("swiper-lazy post-slider__video-preview", isPlaying && 'hidden')}
                    />
                  )}
                </div>
                <Preloader className="swiper-lazy-preloader post-slider__preloader" />
              </div>
            )
          }

          return (
            <div key={slide.id} className="post-slider__slide">
              <img
                data-src={slide.large}
                alt={slide.name}
                className="swiper-lazy"
              />
              <Preloader className="swiper-lazy-preloader post-slider__preloader" />
            </div>
          )
        })}
      </ReactIdSwiper>
    </div>
  )
}

export default PostSlider;