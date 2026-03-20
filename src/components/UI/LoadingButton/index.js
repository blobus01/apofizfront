import React from 'react';
import PropTypes from "prop-types";
import BaseButton from "../BaseButton";
import classnames from "classnames";
import Loader from "../Loader";

import './index.scss'

const LoadingButton = ({loading, children, className, loaderPosition, loaderColor, disabled, ...other}) => {
  return (
    <BaseButton className={classnames("loading-button", loading && 'loading', className)} disabled={disabled || loading} {...other}>
      <span className="loading-button__label tl">
        {children}
      </span>
      {loading && (
        <Loader
          className={`loader--pos-${loaderPosition === 'static' ? 'static' : 'absolute'}`}
          color={loaderColor}
        />
      )}
    </BaseButton>
  );
};

LoadingButton.propTypes = {
  loaderPosition: PropTypes.oneOf(['absolute', 'static'])
}

LoadingButton.defaultProps = {
  loaderPosition: 'static'
}

export default LoadingButton;