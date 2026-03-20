import React from 'react';
import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import {MESSAGE_CHAR_LIMIT} from "../../../common/constants";
import "./index.scss"

const BorderedTextarea = ({className, minRows = 1, isError, ...rest}) => {
  return (
    <TextareaAutosize
      minRows={minRows}
      className={classNames(
        'bordered-textarea',
        isError && 'bordered-textarea--error',
        className
      )}
      maxLength={MESSAGE_CHAR_LIMIT}
      {...rest}
    />
  );
};

export default BorderedTextarea;