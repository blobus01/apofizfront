import React from "react";
import "./index.scss";
import MobileTopHeader from "@components/MobileTopHeader";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { translate } from "@locales/locales";
import { CategoryOption } from "@components/CategoryOption";
import registerOwnerIcon from "@/assets/icons/register_owner_icon.svg";
import registerCompanyIcon from "@/assets/icons/register_company_icon.svg";

const RegisterPaymentSelectPage = () => {
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.search);
  const organizationId = searchParams.get("organizationId");
  const transactionId = searchParams.get("transaction");

  return (
    <div className="register-payment-select">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("На кого формить", "register.paymentSelect")}
        className="payment-form__payment-system-selection-header"
      />
      <div className="register-payment-select__container container containerMax">
        <CategoryOption
          label={translate("Оформить на собственика", "register.toOwner")}
          icon={{ file: registerCompanyIcon }}
          onClick={() =>
            history.push(
              `/register/owner?organizationId=${organizationId}&transactionId=${transactionId}`
            )
          }
          className="register-payment-select__option"
        />
        <CategoryOption
          label={translate("Оформить на компанию", "register.toCompany")}
          icon={{ file: registerOwnerIcon }}
          onClick={() =>
            history.push(
              `/register/company?organizationId=${organizationId}&transactionId=${transactionId}`
            )
          }
          className="register-payment-select__option"
        />
      </div>
    </div>
  );
};

export default RegisterPaymentSelectPage;
