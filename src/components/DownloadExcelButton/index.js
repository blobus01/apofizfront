import React from 'react';
import AnimatedDownloadIcon from "../Animated/AnimatedDownloadIcon";
import ExcelIcon from "../UI/Icons/ExcelIcon";
import {translate} from "../../locales/locales";
import classNames from "classnames";

import "./index.scss"

const DownloadExcelButton = ({loading, onClick, className, ...props}) => {
  return (
    <button onClick={onClick} className={classNames('download-excel-btn f-14', className)} {...props}>
      {loading ?
        <AnimatedDownloadIcon
          style={{marginRight: '0.5rem'}}
        /> :
        <ExcelIcon />}
      {loading ?
        translate('Загрузка', 'app.loading').replace('...', '') :
        translate('Скачать', 'app.download')}
    </button>
  );
};

export default DownloadExcelButton;