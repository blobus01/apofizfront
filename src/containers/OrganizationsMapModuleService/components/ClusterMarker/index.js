import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const ClusterMarker = ({ images, count }) => {
  return (
    <div className="organization-map-module__cluster-marker">
      <MarkerBorderIcon />
      {images.map((image, idx) => {
        const isLast = idx === images.length - 1;
        const isLessThanK = count < 1000;
        return (
          <div
            key={idx}
            className="organization-map-module__cluster-marker-image-container"
          >
            <img
              src={image}
              alt="organization"
              loading="lazy"
              className="organization-map-module__cluster-marker-image"
            />
            {isLast && (
              <div
                className={classNames(
                  "organization-map-module__cluster-marker-count f-10 f-700",
                  !isLessThanK &&
                    "organization-map-module__cluster-marker-count--small"
                )}
              >
                {!isLessThanK ? "999" : count}
                {!isLessThanK && "+"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

ClusterMarker.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  count: PropTypes.number.isRequired,
};

const MarkerBorderIcon = () => {
  return (
    <svg
      width={42}
      height={47}
      viewBox="0 0 42 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 1H30C36.0751 1 41 5.92487 41 12V30.2175C41 36.1725 36.1721 41 30.2171 41H28.3113C25.4307 41 22.7364 42.3092 20.9559 44.5087C18.9918 42.2942 16.1585 41 13.1531 41H11.8562C5.86092 41 1 36.1398 1 30.1447V12C1 5.92487 5.92487 1 12 1Z"
        fill="#F5F5F5"
        stroke="#E76035"
        strokeWidth={2}
      />
    </svg>
  );
};

export default ClusterMarker;
