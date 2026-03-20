import React from 'react';
import PropTypes from "prop-types";
import classnames from "classnames";

import './index.scss'

const BaseButton = ({variant, type, className, ...other}) => {
  return (
    <button
      type={type || 'button'}
      className={classnames('base-button', variant, className)}
      {...other}
    />
  );
};

BaseButton.propTypes = {
  variant: PropTypes.oneOf(['contained', 'text'])
}

BaseButton.defaultProps = {
  variant: 'contained',
  className: 'accept-button'
}

export default BaseButton;