import React from 'react';
import {DoneIcon} from "../../UI/Icons";
import classnames from "classnames";
import './index.scss';

const CurrencyCard = ({country, onClick, selected}) => {
  return (
    <div
      className={classnames("currency-card row", selected && "currency-card--disabled")}
      onClick={onClick}>
      <div className="currency-card__left dfc">
        <div className="currency-card__image"><img src={country.flag} alt={country.name}/></div>
        <p className="f-15 country-card__name">{country.name}</p>
        {selected && <DoneIcon className="language-translate-item__right"/>}
      </div>
      <div className="f-15 currency-card__code">
        {country.currency.code}
      </div>
    </div>
  )
};

export default CurrencyCard;