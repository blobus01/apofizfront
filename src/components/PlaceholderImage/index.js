import React from 'react';
import placeholderImage from "../../assets/images/image_placeholder.svg";
import classNames from "classnames";
import "./index.scss"

const PlaceholderImage = ({wrapperProps={}, ...rest}) => {
  const {className} = wrapperProps
  return (
    <div
      {...wrapperProps}
      className={classNames('image-placeholder', className)}
    >
      <img
        src={placeholderImage}
        alt="compilation"
        loading="lazy"
        width="60%"
        height="60%"
        {...rest}
      />
    </div>
  )
}

export default PlaceholderImage;