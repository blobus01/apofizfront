import React from 'react';
import * as classnames from 'classnames';
import {DEFAULT_CURRENCY} from '../../../common/constants';
import {translate} from '../../../locales/locales';

const SavingsBlock = ({ total, savings, currency, className }) => {
  return (
    <div className={classnames("row", className)}>
      <p className="f-14" style={{ marginRight: '10px' }}>{translate("Сумма", "app.sum")}: <span className="f-600">{`${total || 0} ${currency || DEFAULT_CURRENCY}`}</span></p>
      <p className="f-14">{translate("Экономия", "app.savings")}: <span className="f-600">{`${savings || 0} ${currency || DEFAULT_CURRENCY}`}</span></p>
    </div>
  );
};

export default SavingsBlock;