import React from "react";
import { inTimeRange } from "../../common/utils";
import * as classnames from "classnames";
import { ClockHistoryIcon } from "../UI/Icons";
import { translate } from "../../locales/locales";
import { WORKING_TIME_STATUSES } from "../../common/constants";
import "./index.scss";

export const OrganizationWorkingTime = ({
  start,
  end,
  status,
  isDayOff,
  className,
  onClick,
}) => {
  if (!start || !end) {
    return null;
  }

  const isOpen =
    status === WORKING_TIME_STATUSES.open ||
    status === WORKING_TIME_STATUSES.around_the_clock;

  const isClosedByTime = status === WORKING_TIME_STATUSES.closed && !isDayOff;

  let time;

  if (isDayOff) {
    time = translate("Выходной", "app.dayOff");
  } else if (isClosedByTime) {
    time = translate("Сейчас закрыто", "org.closedNow");
  } else if (status === WORKING_TIME_STATUSES.around_the_clock) {
    time = translate("Круглосуточно", "app.timeAllDay");
  } else {
    time = translate("{start} до {end}", "app.timeFromTo", {
      start: start.split(":").slice(0, 2).join(":"),
      end: end.split(":").slice(0, 2).join(":"),
    });
  }

  return (
    <div
      className={classnames(
        "organization-working-time",
        isOpen && "online",
        (isClosedByTime || isDayOff) && "offline",
        className,
      )}
      onClick={onClick}
    >
      <span className="organization-working-time__icon">
        <ClockHistoryIcon />
      </span>

      <span className="organization-working-time__label f-14">
        {translate("Время работы", "app.workTime")}:
      </span>

      <span className="organization-working-time__text f-14 f-500">{time}</span>
    </div>
  );
};
