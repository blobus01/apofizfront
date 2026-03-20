import React from "react";
import "./SubscriptionsPageSkeleton.scss";

const SubscriptionsPageSkeletonItem = ({ darkTheme }) => {
  return (
    <div className={`subscription-row-skeleton ${darkTheme ? "dark" : ""}`}>
      <div className="subscription-row-skeleton__left">
        <div className="subscription-row-skeleton__icon" />
      </div>

      <div className="subscription-row-skeleton__content">
        <div className="subscription-row-skeleton__line w-60" />
        <div className="subscription-row-skeleton__line w-40" />
        <div className="subscription-row-skeleton__line w-30" />
      </div>

      <div className="subscription-row-skeleton__right">
        <div className="subscription-row-skeleton__checkbox" />
      </div>
    </div>
  );
};

const SubscriptionsPageSkeleton = ({ darkTheme }) => {
  return (
    <div style={{ padding: "0 10px" }}>
      {Array.from({ length: 21 }).map((_, i) => (
        <SubscriptionsPageSkeletonItem darkTheme={darkTheme} key={i} />
      ))}
    </div>
  );
};

export default SubscriptionsPageSkeleton;
