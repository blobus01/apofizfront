import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import TrackVisibility from "react-on-screen";
import ZoomSlider from "react-instagram-zoom-slider";
import * as classnames from "classnames";
import { SLIDE_TYPES } from "../../common/constants";
import { FullscreenIcon } from "../UI/Icons";
import { ImageWithPlaceholder } from "../ImageWithPlaceholder";
import config from "../../config";
import "./index.scss";

// --- ИКОНКИ ---
const SoundOnIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFF">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);
const SoundOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFF">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const PostZoomSlider = ({ slides, onFullScreenClick }) => {
  const sliderParent = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slidesContent = slides.map((src, index) => {
    const isSlideActive = activeIndex === index;
    const key = `slide-${index}-${src.type}`;

    if (src.type === SLIDE_TYPES.image) {
      return (
        <ImageSlide
          key={key}
          image={src}
          onClick={onFullScreenClick}
          index={index}
        />
      );
    }
    if (src.type === SLIDE_TYPES.instagram_image) {
      return (
        <InstagramImageSlide
          key={key}
          image={src}
          onClick={onFullScreenClick}
          index={index}
        />
      );
    }
    if (src.type === SLIDE_TYPES.youtube_video) {
      return (
        <TrackVisibility key={key} style={{ height: "100%" }} partialVisibility>
          {({ isVisible }) => (
            <YoutubeVideoSlide
              video={src}
              onClick={onFullScreenClick}
              isVisible={isVisible && isSlideActive}
              index={index}
            />
          )}
        </TrackVisibility>
      );
    }
    if (src.type === SLIDE_TYPES.instagram_video) {
      return (
        <TrackVisibility key={key} style={{ height: "100%" }} partialVisibility>
          {({ isVisible }) => (
            <InstagramVideoSlide
              video={src}
              onClick={onFullScreenClick}
              index={index}
              isVisible={isVisible && isSlideActive}
            />
          )}
        </TrackVisibility>
      );
    }
    return null;
  });

  return (
    <div className="post-zoom-slider" ref={sliderParent}>
      <ZoomSlider
        slides={slidesContent}
        activeDotColor="#D72C20"
        dotColor="#DDE3E8"
        parentEl={sliderParent}
        onSlideUpdate={(index) => {
          setActiveIndex(index);
          window.dispatchEvent(new CustomEvent("scroll"));
        }}
      />
    </div>
  );
};

export default PostZoomSlider;

// --- СЛАЙДЫ ---

export const ImageSlide = ({ image, onClick, showOriginal, index }) => (
  <div
    className={classnames(
      "post-zoom-slider__slide",
      !showOriginal && "post-zoom-slider__slide--feed", // 🔥 лента
      showOriginal && "swiper-zoom-container",
    )}
    onClick={onClick}
    data-slide={index}
  >
    <ImageWithPlaceholder
      src={showOriginal ? image.file : image.large}
      alt={image.name}
      loading="lazy"
    />
  </div>
);

export const InstagramImageSlide = ({
  image,
  onClick,
  showOriginal,
  index,
}) => (
  <div
    className={classnames(
      "post-zoom-slider__slide",
      !showOriginal && "post-zoom-slider__slide--feed",
      showOriginal && "swiper-zoom-container",
    )}
    onClick={onClick}
    data-slide={index}
  >
    <ImageWithPlaceholder
      src={config.instaProxy + image.large}
      alt={image.name}
      loading="lazy"
    />
  </div>
);

export const YoutubeVideoSlide = ({
  video,
  isVisible,
  index,
  onClick,
  isFullscreen,
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const [muted, setMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isForcePaused, setIsForcePaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const extractVideoId = (url) => {
    if (!url) return null;

    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/,
    );

    return match ? match[1] : video.videoID;
  };

  const videoId = extractVideoId(video?.link);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");

    const updateDeviceType = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateDeviceType();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateDeviceType);
    } else {
      mediaQuery.addListener(updateDeviceType);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateDeviceType);
      } else {
        mediaQuery.removeListener(updateDeviceType);
      }
    };
  }, []);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current || !window.YT?.Player) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          loop: 1,
          playlist: videoId,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            event.target.mute();
            setMuted(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.ENDED) {
              event.target.seekTo(0);
              if (shouldPlay) {
                event.target.playVideo();
              }
            }
          },
          onAutoplayBlocked: () => {},
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("youtube-api-script")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "youtube-api-script";
        document.body.appendChild(tag);
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}

      playerRef.current = null;
      setIsReady(false);
    };
  }, [videoId, isFullscreen]);

  const shouldPlay = useMemo(() => {
    if (isForcePaused) return false;

    if (isFullscreen) {
      return isVisible;
    }

    if (isMobile) {
      return isVisible;
    }

    return isVisible && isHovered;
  }, [isForcePaused, isFullscreen, isMobile, isVisible, isHovered]);

  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current || !window.YT?.Player) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          loop: 1,
          playlist: videoId,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            event.target.mute();
            setMuted(true);

            if (shouldPlay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            // если нужно держать бесконечный цикл
            // хотя loop + playlist обычно уже хватает
            if (event.data === window.YT?.PlayerState?.ENDED) {
              event.target.seekTo(0);
              if (shouldPlay) {
                event.target.playVideo();
              }
            }
          },
          onAutoplayBlocked: () => {},
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("youtube-api-script")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "youtube-api-script";
        document.body.appendChild(tag);
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}

      playerRef.current = null;
      setIsReady(false);
    };
  }, [videoId, isFullscreen, shouldPlay]);

  useEffect(() => {
    if (
      !playerRef.current ||
      !isReady ||
      typeof playerRef.current.playVideo !== "function"
    ) {
      return;
    }

    try {
      if (shouldPlay) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [shouldPlay, isReady]);

  const toggleSound = (e) => {
    e.stopPropagation();

    if (!playerRef.current) return;

    try {
      if (muted) {
        playerRef.current.unMute();
        setMuted(false);
      } else {
        playerRef.current.mute();
        setMuted(true);
      }
    } catch {}
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();

    if (!isFullscreen) {
      setIsForcePaused(true);
      playerRef.current?.pauseVideo?.();
      onClick?.(e);
      return;
    }

    if (!playerRef.current) return;

    try {
      const state = playerRef.current.getPlayerState();

      if (state === 1) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {}
  };

  if (!videoId) return null;

  return (
    <div
      className={classnames(
        "post-zoom-slider__slide",
        "post-zoom-slider__slide--youtube",
        !isFullscreen && "post-zoom-slider__slide--feed",
        isFullscreen && "post-zoom-slider__slide--fullscreen",
      )}
      data-slide={index}
      onMouseEnter={() => {
        if (!isMobile && !isFullscreen) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !isFullscreen) {
          setIsHovered(false);
        }
      }}
    >
      <div className="post-zoom-slider__youtube-inner">
        <div ref={containerRef} className="post-zoom-slider__youtube-frame" />

        <div
          className="youtube-overlay"
          data-slide={index}
          onClick={handleOverlayClick}
        />

        <button
          type="button"
          className="post-zoom-slider__sound-toggle"
          onClick={toggleSound}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
      </div>
    </div>
  );
};

export const InstagramVideoSlide = ({
  video,
  isVisible,
  onClick,
  index,
  isFullscreen,
}) => {
  const videoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isForcePaused, setIsForcePaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isVisibleRef = useRef(isVisible);
  const isForcePausedRef = useRef(isForcePaused);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");

    const updateDeviceType = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateDeviceType();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateDeviceType);
    } else {
      mediaQuery.addListener(updateDeviceType);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateDeviceType);
      } else {
        mediaQuery.removeListener(updateDeviceType);
      }
    };
  }, []);

  useEffect(() => {
    isVisibleRef.current = isVisible;
    isForcePausedRef.current = isForcePaused;

    if (!isVisible) {
      setIsForcePaused(false);
    }
  }, [isVisible, isForcePaused]);

  const shouldPlay = (() => {
    if (isForcePaused) return false;

    if (isFullscreen) return isVisible;

    if (isMobile) return isVisible;

    return isVisible && isHovered;
  })();

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = isMuted;

    if (shouldPlay) {
      const playPromise = videoEl.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isVisibleRef.current || isForcePausedRef.current) {
              videoEl.pause();
            }
          })
          .catch(() => {});
      }
    } else {
      videoEl.pause();
    }

    return () => {
      videoEl.pause();
    };
  }, [shouldPlay, isMuted]);

  const toggleSound = (e) => {
    e.stopPropagation();

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();

    if (!isFullscreen) {
      setIsForcePaused(true);
      videoRef.current?.pause();
      onClick?.(e);
      return;
    }

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const posterSrc = video.withShlyuzer
    ? config.instaProxy + video.thumbnail
    : video.thumbnail;

  const videoSrc = video.withShlyuzer
    ? config.instaProxy + (video.video_url || video.video)
    : video.video_url || video.video;

  return (
    <div
      className={classnames(
        "post-zoom-slider__slide",
        "post-zoom-slider__slide--video",
        !isFullscreen && "post-zoom-slider__slide--feed",
        isFullscreen && "post-zoom-slider__slide--fullscreen",
        "video",
      )}
      data-slide={index}
      onClick={handleVideoClick}
      onMouseEnter={() => {
        if (!isMobile && !isFullscreen) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !isFullscreen) {
          setIsHovered(false);
        }
      }}
    >
      <video
        ref={videoRef}
        className="post-zoom-slider__media"
        poster={posterSrc}
        preload="metadata"
        playsInline
        muted={isMuted}
        defaultMuted
        controls={false}
        loop
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {!isFullscreen && (
        <div className="post-zoom-slider__slide-fullscreen">
          <FullscreenIcon data-slide={index} />
        </div>
      )}

      <button
        type="button"
        className="post-zoom-slider__sound-toggle"
        onClick={toggleSound}
      >
        {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
      </button>
    </div>
  );
};
