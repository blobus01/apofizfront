import React from 'react';
import moment from 'moment';
import OrgAvatar from '../UI/OrgAvatar';
import {DeliveryIcon, PhoneIcon} from '../UI/Icons';
import {translate} from '../../locales/locales';
import {DATE_FORMAT_DD_MM_YYYY, TIME_FORMAT_HH_MM} from '../../common/constants';
import './index.scss';
import * as classnames from "classnames";

const CourierInfo = ({deliveryInfo}) => {
  const {delivery_organization: organization, status} = deliveryInfo;
  const courierPhone = !!organization.phone_numbers.length && organization.phone_numbers[0].phone_number;

  const time = '2021-08-13T08:49:06.666696Z';

  return (
    <div className="courier-info">
      <div className="courier-info__left">
        <div className="courier-info__org-left">
          <div className="courier-info__avatar">
            <OrgAvatar
              size={62}
              src={organization.image.medium}
              alt="courier-avatar"
            />
            {status && (
              <div className={classnames("courier-info__badge", status)}>
                <DeliveryIcon color="#FFF" />
              </div>
            )}
          </div>
          <div className={classnames("courier-info__status f-13 f-500", status)}>{translate("-", `receipts.${status}`)}</div>
        </div>
        <div className="courier-info__org-right">
          <div>
            <div className="courier-info__title f-16 f-400">{organization.title}</div>
            <div className="courier-info__desc f-13 f-400">{translate("Курьерская служба", "delivery.courierService")}</div>
            <div className="courier-info__number f-13 f-400">{courierPhone}</div>
          </div>
          <div className="courier-info__date f-14 f-500">{moment(time).format(DATE_FORMAT_DD_MM_YYYY)} <b>{moment(time).format(TIME_FORMAT_HH_MM)}</b></div>
        </div>
      </div>
      <div className="courier-info__right">
        {courierPhone && (
          <a href={`tel:${courierPhone}`} className="courier-info__phone">
            <PhoneIcon color="#FFF" />
          </a>
        )}
      </div>
    </div>
  )
};

export default CourierInfo;