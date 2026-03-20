import React from 'react';
import {useDispatch} from "react-redux";
import MenuItem from "../../LanguageTranslateList/MenuItem";
import IconRussia from "../../../assets/icons/icon_russia.svg";
import IconUSA from "../../../assets/icons/icon_usa.svg";
import IconEuropeanUnion from "../../../assets/icons/icon_european_union.svg";
import IconKazakhstan from "../../../assets/icons/icon_kazakhstan.svg";
import IconUAE from "../../../assets/icons/icon_united_arab_emirates.svg";
import {SocialIcon} from "../../UI/Icons";
import {round} from "../../../common/utils";
import {getCurrencyConversion, setViews} from "../../../store/actions/commonActions";
import {VIEW_TYPES} from "../../GlobalLayer";
import {translate} from "../../../locales/locales";
import './index.scss'

const CurrencyMenu = ({onClose, orgCurrency, item, currentCode}) => {
  const dispatch = useDispatch();

  const currencyConversion = country => {
    if (currentCode === country) return;
    const price = round(item.price, 2);
    dispatch(getCurrencyConversion(orgCurrency, country, price, item.id, item.name));
    onClose();
  };

  const onShowCurrencyView = () => {
    dispatch(setViews({
      type: VIEW_TYPES.currency_list,
      onChange: (country) => {
        currencyConversion(country.currency.code);
      },
      currentCode,
    }));
    onClose();
  };

  return (
    <div className="container">
      <MenuItem
        title="kzt"
        img={IconKazakhstan}
        alt="Kazakhstan Flag"
        onClick={() => currencyConversion("KZT")}
        currentCode={currentCode}
        code="KZT"
        className="currency-menu__item"
      />

      <MenuItem
        title="rub"
        img={IconRussia}
        alt="Russia Flag"
        onClick={() => currencyConversion("RUB")}
        currentCode={currentCode}
        code="RUB"
        className="currency-menu__item"
      />

      <MenuItem
        title="aed"
        img={IconUAE}
        alt="United Arab Emirates Flag"
        onClick={() => currencyConversion("AED")}
        currentCode={currentCode}
        code="AED"
        className="currency-menu__item"
      />

      <MenuItem
        title="euro"
        img={IconEuropeanUnion}
        alt="European Union Flag"
        onClick={() => currencyConversion("EUR")}
        currentCode={currentCode}
        code="EUR"
        className="currency-menu__item"
      />

      <MenuItem
        title="usd"
        img={IconUSA}
        alt="USA Flag"
        onClick={() => currencyConversion("USD")}
        currentCode={currentCode}
        code="USD"
        className="currency-menu__item"
      />

      <MenuItem
        title={translate("Другие валюты","app.otherCurrency")}
        icon={<SocialIcon/>}
        onClick={onShowCurrencyView}
      />
    </div>
  );
};

export default CurrencyMenu;