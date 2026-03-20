import React from "react";
import "./index.scss";
import classNames from "classnames";

const SkeletonItem = ({ darkTheme }) => (
  <div
    className={classNames("subscriptions-skeleton__card", darkTheme && "dark")}
  >
    <div className="subscriptions-skeleton__header" style={{ padding: 16 }}>
      <div className="subscriptions-skeleton__avatar" />
      <div className="subscriptions-skeleton__header-text">
        <div className="subscriptions-skeleton__line w-60" />
        <div className="subscriptions-skeleton__line w-40" />
      </div>
      <div className="subscriptions-skeleton__button-wrapper">
        <div className="subscriptions-skeleton__button-bottom" />
        <div className="subscriptions-skeleton__button" />
      </div>
    </div>

    <div className="subscriptions-skeleton__media" />

    <div className="subscriptions-skeleton__content" style={{ padding: 16 }}>
      <div className="subscriptions-skeleton__line w-90" />
      <div className="subscriptions-skeleton__line w-80" />
      <div className="subscriptions-skeleton__line w-70" />
      <div className="subscriptions-skeleton__line w-50" />
    </div>
  </div>
);

const PostsHomeSkeleton = ({ length, top, darkTheme }) => {
  return (
    <>
      <div className="subscriptions-skeleton" style={{ marginTop: top }}>
        {Array.from({ length: length }).map((_, i) => (
          <SkeletonItem darkTheme={darkTheme} key={i} />
        ))}
      </div>
    </>
  );
};

export default PostsHomeSkeleton;
