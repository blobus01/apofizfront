import React from 'react';
import * as classnames from 'classnames';
import './index.scss';

const GroupedImages = ({images, className}) => {
  if (!images.length) {
    return null;
  }

  return (
    <div className={classnames("grouped-images", className)}>
      <div className="grouped-images__inner">
        {images.map((image, idx) => (
          <div key={idx} className="grouped-images__image">
            <img
              src={image.src}
              alt={image.alt}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupedImages;