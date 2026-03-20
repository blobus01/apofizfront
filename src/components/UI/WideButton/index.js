import React from 'react';
import classnames from "classnames";
import LoadingButton from "../LoadingButton";
import "./index.scss"

export const WIDE_BUTTON_VARIANTS = {
  ACCEPT: 'accept-button',
  ACCEPT_CONTAINED: 'contained-submit-button',
  DANGER: 'danger-button'
}

const WideButton = ({variant=WIDE_BUTTON_VARIANTS.DANGER, fullWidth=true, className, children, ...other}) => {
  return (
    <LoadingButton
      className={classnames('wide-button', variant, 'f-15 f-500', fullWidth && 'wide-button--full-width', className)}
      loaderColor="#FFF"
      loaderPosition="absolute"
      {...other}
    >
      {children}
    </LoadingButton>
  );
};

export default WideButton;