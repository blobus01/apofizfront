import React from 'react';
import moment from 'moment';
import * as classnames from 'classnames';
import {Link} from 'react-router-dom';
import {DATE_FORMAT_S_DD_MM_YYYY, TIME_FORMAT_HH_MM} from '../../../common/constants';
import './index.scss'

const EmployeeCard = ({ employee, className }) => {
  if (!employee) { return null; }
  const { id, user, role, attendance } = employee;

  return (
    <Link
      to={`employees/${id}`}
      className={classnames("employee-card", className)}
    >
      <div className="employee-card__top">
        <div className={classnames(
          "employee-card__avatar",
          attendance && (attendance.is_active ? "employee-card__avatar-active" : "employee-card__avatar-inactive"))
        }>
          <div className="employee-card__avatar-inner">
            <img src={user && user.avatar && user.avatar.medium} alt={user && user.full_name} />
          </div>
        </div>

        <div className="employee-card__content">
          <div className="employee-card__title f-16">{user && user.full_name}</div>
          <div className="employee-card__role f-14">{role && role.title}</div>
          {attendance ? (
            <div className={classnames(
              "employee-card__attendance row f-12",
              attendance.is_active ? "employee-card__attendance-active" : "employee-card__attendance-inactive"
            )}>
              <div>{moment(attendance.is_active ? attendance.arrival_time : attendance.departure_time).format(DATE_FORMAT_S_DD_MM_YYYY)}</div>
              <div>
                {attendance.is_active ? moment(attendance.arrival_time).format(TIME_FORMAT_HH_MM) : (
                  `${moment(attendance.arrival_time).format(TIME_FORMAT_HH_MM)} - ${moment(attendance.departure_time).format(TIME_FORMAT_HH_MM)}`
                )}
              </div>
            </div>
          ) : (
            <div className="card__attendance employee-card__attendance-inactive f-12">Не был</div>
          )}
        </div>
      </div>

      <div className="employee-card__id f-14 f-600">ID {user.id}</div>
    </Link>
  );
};

export default EmployeeCard;