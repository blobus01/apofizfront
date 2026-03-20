import * as classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { ImageWithPlaceholder } from "../../ImageWithPlaceholder";
import { BlueRoundCheckIcon, PlayIcon } from "../../UI/Icons/";
import { SLIDE_TYPES } from "../../../common/constants";
import urlParser from "js-video-url-parser";
import "./index.scss";

const PostSelectCard = ({
  post,
  className,
  onClick,
  onVideoPlay,
  selected,
}) => {
  const getSlides = (post) => {
    const slides = [];

    post.images.map((image) =>
      slides.push({ type: SLIDE_TYPES.image, ...image })
    );
    post.youtube_links &&
      post.youtube_links.forEach((url, index) => {
        const info = urlParser.parse(url);
        info &&
          info.id &&
          info.provider === "youtube" &&
          slides.push({
            type: SLIDE_TYPES.youtube_video,
            videoID: `${post.id}-${index}-${info.id}`,
            link: `https://www.youtube.com/embed/${info.id}?autoplay=1`,
            preview: `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`,
            preview2: `https://img.youtube.com/vi/${info.id}/0.jpg`,
          });
      });
    post.instagram_data.images?.map((image) =>
      slides.push({ type: SLIDE_TYPES.instagram_image, ...image })
    );
    if (post.videos.length > 0) {
      post.videos?.map((video, index) =>
        slides.push({
          type: SLIDE_TYPES.instagram_video,
          ...video,
          videoID: `${post.id}-${index}`,
        })
      );
    } else {
      post.instagram_data.videos?.map((video, index) =>
        slides.push({
          type: SLIDE_TYPES.instagram_video,
          ...video,
          videoID: `${post.id}-${index}`,
        })
      );
    }
    return slides;
  };

  const slides = getSlides(post);
  const firstSlide = slides[0];
  const hasVideo = firstSlide?.type === SLIDE_TYPES.instagram_video;

  const onPlayButtonClick = (event) => {
    event.stopPropagation();
    onVideoPlay(slides);
  };

  return (
    <div
      className={classnames("post-select-card", className)}
      onClick={onClick}
    >
      <div className="post-select-card__image">
        {hasVideo && (
          <button
            type="button"
            onClick={onPlayButtonClick}
            className="post-select-card__play-button"
          >
            <PlayIcon />
          </button>
        )}
        <ImageWithPlaceholder
          src={hasVideo ? firstSlide?.thumbnail : firstSlide?.large}
          alt={post.name}
          loading="lazy"
        />
        <BlueRoundCheckIcon
          className="post-select-card__selected-mark"
          style={{
            transform: `scale(${selected ? 1 : 0})`,
          }}
        />
      </div>

      <div className="post-select-card__content">
        <p className="post-select-card__name tl f-13">{post.name}</p>
        <p className="post-select-card__desc">
          {post.price && (
            <span className="post-select-card__price f-14 f-500">
              {post.price} {post?.currency}
            </span>
          )}
          {post.subcategory?.name && (
            <span className="post-select-card__subcategory-name f-14">
              {post.subcategory?.name}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

PostSelectCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    organization: PropTypes.number,
    name: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        file: PropTypes.string,
        name: PropTypes.string,
        large: PropTypes.string,
        medium: PropTypes.string,
        small: PropTypes.string,
      })
    ),
    subcategory: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    price(props, propName) {
      if (props[propName] !== null && typeof props[propName] !== "number") {
        return new Error(
          "Failed prop type: PostSelectCard: prop type `price` is invalid; it must be null or an number but received " +
            typeof props[propName]
        );
      }
    },
    discounted_price(props, propName) {
      if (props[propName] !== null && typeof props[propName] !== "number") {
        return new Error(
          "Failed prop type: PostSelectCard: prop type `discounted_price` is invalid; it must be null or an number but received " +
            typeof props[propName]
        );
      }
    },
    in_set: PropTypes.bool,
  }),
  selected: PropTypes.bool,
};

export default PostSelectCard;
