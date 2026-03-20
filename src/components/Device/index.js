import React from 'react';
import {DATE_FORMAT_HH_MM_DD_MM_YYYY, DEFINED_OSes} from '../../common/constants';
import {AndroidDeviceIcon, AppleDeviceIcon, WebDeviceIcon} from "../UI/Icons";
import moment from "moment";
import classnames from "classnames";
import {translate} from "../../locales/locales";
import {prettyDate} from "../../common/utils";

import './index.scss'

function Device(props) {
  const {device, onClick, className} = props
  const {device: deviceName, operating_system, location, log_time: logTimeStamp, version_app, last_active} = device

  let DeviceIcon
  if (operating_system === DEFINED_OSes.WEB) DeviceIcon = WebDeviceIcon
  if (operating_system === DEFINED_OSes.iOS) DeviceIcon = AppleDeviceIcon
  if (operating_system === DEFINED_OSes.ANDROID) DeviceIcon = AndroidDeviceIcon

  const logTime = moment(logTimeStamp).format(DATE_FORMAT_HH_MM_DD_MM_YYYY)

  return (
    <div className={classnames("device", className)} onClick={onClick}>
      {DeviceIcon && <DeviceIcon style={{minWidth: 60, minHeight: 60}}/>}
      <div className="device__info">
        <h6 className="device__name f-700 f-16">
          {deviceName}
        </h6>
        <div className="device__platform f-600 f-13">
          {version_app}
        </div>
        <div className="device__additional-data f-13">
          {location} {logTime}
        </div>
        <div className="device__additional-data device__additional-data--last-active f-13">
          {translate(`Был активен: ${prettyDate(last_active)}`, 'profile.wasActive', {
            activeTime: prettyDate(last_active)
          })}
        </div>
      </div>
    </div>
  );
}

export default Device;