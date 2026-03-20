import React from "react";
import AnimatedStockImage from "../../components/Animated/AnimatedStockImage";
import MobileTopHeader from "../../components/MobileTopHeader";
import { InfoTitle } from "../../components/UI/InfoTitle";
import { translate } from "../../locales/locales";
import "./index.scss";

const StockInfoView = ({ onBack, onNext }) => {
  const defaultMessage =
    "Отличная новость!!!  Вам доступен склад, управление товарами и ценами. Планирование закупок и контроль остатков. Резервы. Модификации. Инвентаризации. Теперь Ваша, товароучетная система в одном приложение";
  return (
    <>
      <MobileTopHeader
        title={translate("Склад", "stock.stock")}
        onNext={onNext}
        onBack={onBack}
      />
      <div className="stock-view">
        <div className="stock-view__container">
          <AnimatedStockImage />
          <InfoTitle
            title={translate("Информация", "app.information") + ":"}
            className="stock-view__title"
            animated
          />
          <p className="stock-view__info">
            {translate(defaultMessage, "stock.info")}
          </p>
        </div>
      </div>
    </>
  );
};

export default StockInfoView;
