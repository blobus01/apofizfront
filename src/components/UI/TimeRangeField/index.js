import React from 'react';
import {HOURS24, MINUTES} from './constants';
import classnames from 'classnames';
import './index.scss';

export const DEFAULT_START_H = '09';
export const DEFAULT_START_M = '00';
export const DEFAULT_END_H = '18';
export const DEFAULT_END_M = '00';

const TimeRangeField = (props) => {
  const {disabled, label, className} = props;

  const start = props.start.split(':');
  const end = props.end.split(':');
  const [range, setRange] = React.useState({
    startHour: start[0] || DEFAULT_START_H,
    startMinute: start[1] || DEFAULT_START_M,
    endHour: end[0] || DEFAULT_END_H,
    endMinute: end[1] || DEFAULT_END_M
  });

  const onStartHourChange = async (e) => {
    const {value} = e.target
    const current = [value, range.startMinute].join(':');
    if (current >= `${range.endHour}:${range.endMinute}`) return

    await setRange({...range, startHour: value});
    props.onStartChange(current);
  };

  const onStartMinuteChange = async (e) => {
    const {value} = e.target
    const current = [range.startHour, value].join(':');
    if (current >= `${range.endHour}:${range.endMinute}`) return

    await setRange({...range, startMinute: value});
    props.onStartChange(current);
  };

  const onEndHourChange = async (e) => {
    const {value} = e.target
    const current = [value, range.endMinute].join(':');
    if (current <= `${range.startHour}:${range.startMinute}`) return

    await setRange({...range, endHour: value});
    props.onEndChange(current);
  };

  const onEndMinuteChange = async (e) => {
    const {value} = e.target
    const current = [range.endHour, value].join(':');
    if (current <= `${range.startHour}:${range.startMinute}`) return

    await setRange({...range, endMinute: value});
    props.onEndChange(current);
  };

  return (
    <div className={classnames("time-range-field", disabled && "disabled", className)}>
      {label && <label htmlFor="time-range" className="time-range-field__label f-14">{label}</label>}
      <div className="time-range-field__grid">
        <div className="time-range-field__block">
          <span>c</span>
          <select name="select-start-hour" id="select-start-hour" value={disabled ? "00" : range.startHour} disabled={disabled} onChange={onStartHourChange}>
            {HOURS24.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
          :
          <select name="select-start-minute" id="select-start-minute" value={disabled ? "00" : range.startMinute} disabled={disabled} onChange={onStartMinuteChange}>
            {MINUTES.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </div>

        <div className="time-range-field__block">
          <span>до</span>
          <select name="select-end-hour" id="select-end-hour" value={disabled ? "00" : range.endHour} disabled={disabled} onChange={onEndHourChange}>
            {HOURS24.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
          :
          <select name="select-end-minute" id="select-end-minute" value={disabled ? "00" : range.endMinute} disabled={disabled} onChange={onEndMinuteChange}>
            {MINUTES.map(hour => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeField;