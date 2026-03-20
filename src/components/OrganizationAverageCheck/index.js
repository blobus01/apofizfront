import React from "react";
import { AvgCheck } from "../UI/Icons";
import Preloader from "../Preloader";
import { translate } from "../../locales/locales";
import classnames from "classnames";
import "./index.scss";
import { formatWithCommas } from "@common/helpers";

const OrganizationAverageCheck = ({
  id,
  sum,
  currency,
  converted,
  loading,
  onClick,
  currentConvertedItem,
  className,
  color,
}) => {
  return (
    <div
      onClick={onClick}
      className={classnames("organization-average-check dfc f-14", className)}
    >
      <AvgCheck color={color ? color : "#818C99"} />
      <span className="organization-average-check__label">
        {translate("Средний чек", "org.averageBill")}:
      </span>
      <span className="organization-average-check__sum f-500">
        {converted ? (
          <>
            {" "}
            {formatWithCommas(converted.price + "")} {converted.currency}{" "}
          </>
        ) : (
          <>
            {" "}
            {formatWithCommas(sum + "")} {currency}{" "}
          </>
        )}
      </span>
      {loading && currentConvertedItem === id && (
        <Preloader className="organization-average-check__loading" />
      )}
    </div>
  );
};

export default OrganizationAverageCheck;
