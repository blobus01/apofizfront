import React from "react";
import { LOCALES, translate } from "../../locales/locales";
import MobileTopHeader from "../../components/MobileTopHeader";
import { CategoryOption } from "../../components/CategoryOption";
import VisaAndMasterCardIcon from "../../components/UI/Icons/VisaAndMasterCardIcon";
import koverSamoletIcon from "../../assets/images/kover_samolet_icon.png";

const FaqPartnersAndConditions = ({
  language,
  goBack,
  isWebviewMode,
  isIosWebviewMode,
}) => {
  const WEBVIEW_MESSAGES = Object.freeze({
    visa: "visa",
    kover: "kover",
  });

  const isEn = language !== LOCALES.ru;

  return (
    <>
      {!isWebviewMode && !isIosWebviewMode && (
        <MobileTopHeader
          title={translate(
            "Партнеры приложения и условия",
            "faq.partnersAndConditions"
          )}
          onBack={() => goBack("/faq")}
          className="faq-partners-and-conditions__header"
        />
      )}
      <div className="faq-partners-and-conditions">
        <div className="container faq__mt-50">
          <CategoryOption
            icon={<VisaAndMasterCardIcon />}
            label="Visa and Master Card KGS"
            className="faq-partners-and-conditions__link faq__mb-24"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.visa);
              // ===============
              !isIosWebviewMode &&
                window.location.assign("https://freedompay.money/kg");
            }}
          />
          <CategoryOption
            icon={{ file: koverSamoletIcon }}
            label={
              isEn
                ? "Kover Samolet - Delivery Service"
                : "Ковер самолет служба доставки"
            }
            className="faq-partners-and-conditions__link"
            onClick={() => {
              // For iOS webview
              isIosWebviewMode && console.log(WEBVIEW_MESSAGES.kover);
              // ===============
              !isIosWebviewMode &&
                window.location.assign("https://dostavka312.kg/");
            }}
          />
        </div>
      </div>
    </>
  );
};

export default FaqPartnersAndConditions;
