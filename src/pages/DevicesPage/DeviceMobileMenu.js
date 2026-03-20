import React from 'react';
import MobileMenuHeader from "../../components/MobileMenu/MobileMenuHeader";
import {DATE_FORMAT_HH_MM_DD_MM_YYYY, DEFINED_OSes} from "../../common/constants";
import {
  AndroidDeviceIcon,
  AppleDeviceIcon, ArrowRight,
  CloseButton,
  DeviceIPIcon,
  GlobalLocationIcon, TimeIcon,
  TimerIcon,
  UserLastActiveIcon,
  UserShieldIcon,
  WebDeviceIcon
} from "../../components/UI/Icons";
import MobileMenuContent from "../../components/MobileMenu/MobileMenuContent";
import moment from "moment/moment";
import MobileMenuLayer from "../../components/MobileMenu/MobileMenuLayer";
import {mobileMenuStyles} from '../../assets/styles/modal';
import Button from '../../components/UI/Button';
import {translate} from '../../locales/locales';
import {prettyDate} from "../../common/utils";
import classNames from "classnames";

import './index.scss'

const DeviceDetail = ({icon, label, modifierClassName, ...other}) => {
  return (
    <div className={classNames('devices-page__device-detail', modifierClassName && `devices-page__device-detail--${modifierClassName}`)} {...other}>
      <div className="devices-page__device-detail-icon-box">
        {icon}
      </div>
      <div className="devices-page__device-detail-label">
        {label}
      </div>
    </div>
  )
}

const DeviceMobileMenu = props => {
  const {isOpen, device, leaveDevice, canChangeExpTime, openExpirationTimeSelection, onClose} = props

  let deactivationTimeLeft
  if (device.expired_time_choice === 7) {
    deactivationTimeLeft = translate('1 неделя', 'profile.week')
  } else if (device.expired_time_choice === 30) {
    deactivationTimeLeft = translate('1 месяц', 'profile.month')
  } else if (device.expired_time_choice === 90) {
    deactivationTimeLeft = translate('3 месяца', 'profile.threeMonths')
  } else if (device.expired_time_choice === 180) {
    deactivationTimeLeft = translate('6 месяцев', 'profile.sixMonths')
  }

  return (
    <MobileMenuLayer
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        ...mobileMenuStyles,
        overlay: {
          ...mobileMenuStyles.overlay,
          zIndex: 1111111
        }
      }}
    >
      <MobileMenuHeader
        center={(
          <div>
            {device.operating_system && (
              <>
                {device.operating_system === DEFINED_OSes.iOS && <AppleDeviceIcon/>}
                {device.operating_system === DEFINED_OSes.ANDROID && <AndroidDeviceIcon/>}
                {device.operating_system === DEFINED_OSes.WEB && <WebDeviceIcon/>}
              </>
            )}
            <h6 className="tl f-800" style={{
              marginTop: 14
            }}>
              {device.device}
            </h6>
          </div>
        )}
        right={<CloseButton onClick={onClose}/>}
        rightClassName="devices-page__mobile-menu-right"
      />
      <MobileMenuContent className="devices-page__mobile-menu-content">
        <DeviceDetail
          icon={<TimeIcon />}
          label={<span className="devices-page__log-time-label f-15">{moment(device.log_time).format(DATE_FORMAT_HH_MM_DD_MM_YYYY)}</span>}
        />
        <DeviceDetail
          icon={<DeviceIPIcon/>}
          label={<span className="devices-page__ip-label f-15">{device.ip}</span>}
        />
        {device.location && (
          <DeviceDetail
            icon={<GlobalLocationIcon/>}
            label={<span className="devices-page__location-label f-15">{device.location}</span>}
          />
        )}
        {device.user_agent && (
          <DeviceDetail
            icon={<UserShieldIcon/>}
            label={<span className="devices-page__agent-label f-13">{device.user_agent}</span>}
            modifierClassName="user-agent"
          />
        )}
        <DeviceDetail
          icon={<UserLastActiveIcon/>}
          label={<span
            className="devices-page__last-active-label">{translate(`Был активен: ${prettyDate(device.last_active)}`, 'profile.wasActive', {
            activeTime: prettyDate(device.last_active)
          })}</span>}
        />
        <DeviceDetail
          icon={<TimerIcon />}
          label={(
            <div className="devices-page__expiration-time-label">
              <p className="devices-page__expiration-time-label-name f-16">{translate('Время деактивации', 'profile.deactivationTime')}</p>
              <div className="devices-page__expiration-time-label-value f-15">{canChangeExpTime && `${deactivationTimeLeft} -`} {moment(device.log_time).format(DATE_FORMAT_HH_MM_DD_MM_YYYY)}</div>
              {canChangeExpTime && (
                <ArrowRight className="devices-page__expiration-time-label-arrow" />
              )}
            </div>
          )}
          onClick={canChangeExpTime && openExpirationTimeSelection}
          modifierClassName={canChangeExpTime && 'deactivation-time'}
        />
        {leaveDevice && (
          <Button className="devices-page__leave-device-btn button-danger"
                  label={translate('Выйти с устройства', 'profile.leaveDevice')} onClick={leaveDevice}/>
        )}
      </MobileMenuContent>
    </MobileMenuLayer>
  );
};

export default DeviceMobileMenu;