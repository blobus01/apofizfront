import React from "react";
import "./SubscriptionsSkeleton.scss";
import classNames from "classnames";

const SkeletonItem = ({ darkTheme }) => (
  <div
    className={classNames(
      "subscriptions-skeleton__card",
      darkTheme && "subscriptions-skeleton__card--dark",
    )}
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

const SubscriptionsSkeleton = ({
  length,
  top,
  padding,
  leftRight,
  darkTheme,
}) => {
  return (
    <div
      className="subscriptions-skeleton"
      style={{
        marginTop: top,
        padding: padding ? "0 9px" : 0,
        margin: `${leftRight ? "0 9px" : ""}`,
      }}
    >
      {Array.from({ length: length }).map((_, i) => (
        <SkeletonItem darkTheme={darkTheme} key={i} />
      ))}
    </div>
  );
};

export default SubscriptionsSkeleton;
