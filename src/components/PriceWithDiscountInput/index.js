import React from "react";
import { InputTextField } from "../UI/InputTextField";
import { translate } from "../../locales/locales";
import { validateForNumber } from "../../common/helpers";
import "./index.scss";

const PriceWithDiscountInput = ({
  value,
  percentDiscount,
  onChange,
  priceLabel = translate("Цена", "app.price"),
  discountLabel = `${translate("Цена", "app.price")} - %`,
  ...rest
}) => {
  const withDiscount =
    Number(value) - (Number(percentDiscount) * Number(value)) / 100;
  return (
    <div className="price-with-discount-input">
      <InputTextField
        label={priceLabel}
        value={value}
        className="price-with-discount-input__input"
        onChange={(e) => {
          const { isValid, isEmpty, value } = validateForNumber(
            e.target.value,
            {
              isFloat: true,
              min: 0,
              max: 100000000,
            }
          );
          if (isValid || isEmpty) {
            onChange(value);
          }
        }}
        {...rest}
      />
      {withDiscount && withDiscount !== Number(value) ? (
        <InputTextField
          name="cost-disc"
          label={discountLabel}
          value={withDiscount}
          onChange={() => null}
          className="price-with-discount-input__input"
          disabled
        />
      ) : null}
    </div>
  );
};

export default PriceWithDiscountInput;
