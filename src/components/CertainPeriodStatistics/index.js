import React from 'react';
import SavingsBlock from "../UI/SavingsBlock";
import {translate} from "../../locales/locales";
import * as moment from "moment/moment";
import {DATE_FORMAT_DD_MMMM_YYYY} from "../../common/constants";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";
import classNames from "classnames";
import {nullable} from "../../common/helpers";

import "./index.scss"

const CertainPeriodStatistics = ({stats, start, end, onClick, className}) => {
  const locale = useSelector(state => state.userStore.locale)
  return (
    <div className={classNames('certain-period-statistics', className)} onClick={onClick}>
      <div className="container">
        <SavingsBlock
          total={stats && stats.total_spent}
          savings={stats && stats.total_savings}
          currency={stats && stats.currency}
          className="certain-period-statistics__summary"
        />
        <div className="f-14 f-500">
          <button className="certain-period-statistics__calendar-btn f-14 f-500">
            {(start && end)
              ? translate("с {start} - по {end}", "app.dateRange", {
                start: moment(start).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY),
                end: moment(end).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)
              })
              : translate("За все время", "app.allTime")
            }
          </button>
        </div>
      </div>
    </div>
  );
};

CertainPeriodStatistics.propTypes = {
  start: nullable(PropTypes.instanceOf(Date)),
  end: nullable(PropTypes.instanceOf(Date))
}

export default CertainPeriodStatistics;