import React, { useEffect, useState } from "react";
import paymentSystemIconCrypto from "@/assets/images/payment_system_icon_crypto.svg";
import paymentSystemIconInvoice from "@/assets/images/payment_system_icon_invoice.svg";
import Preloader from "@components/Preloader";
import OptionLoader from "@components/OptionLoader";
import MobileTopHeader from "@components/MobileTopHeader";
import Notify from "@components/Notification";
import api from "../../axios-api";

import { CategoryOption } from "@components/CategoryOption";
import { translate } from "@locales/locales";
import { useHistory, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setInvoiceData, setInvoiceNumb } from "@store/actions/invoiceActions";

const SubscriptionPaymentSystemPage = () => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const tariffId = useSelector(
    (state) => state.subscriptionTarrifReducer.tariffId
  );
  const companyData = useSelector((state) => state.invoice.companyData);
  const ownerData = useSelector((state) => state.invoice.ownerData);

  const searchParams = new URLSearchParams(location.search);
  const transactionId = searchParams.get("transaction");

  useEffect(() => {
    api
      .get("/transactions/payment-systems/")
      .then((response) => {
        if (response.data && response.data.list) {
          const paymentSystems = response.data.list;
          if (paymentSystems.length === 0) {
            history.goBack();
          }

          setOptions(paymentSystems);
        }
      })
      .catch((error) => console.error("Error fetching payment systems:", error))
      .finally(() => setLoading(false));
  }, [history]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleInvoicePayment = async () => {
    try {
      const isCompany = !!companyData;
      const invoiceSource = isCompany ? companyData : ownerData;

      if (!invoiceSource) {
        Notify.error({
          text: "Нет данных для создания счёта. Заполните форму.",
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        invoice_type: isCompany ? "company" : "owner",
        payment_method: "bank",
        tariff_id: tariffId,
        organization: invoiceSource.organization,
        data: {
          full_name: invoiceSource.data.full_name,
          country: invoiceSource.data.country,
          city: invoiceSource.data.city,
          address: invoiceSource.data.address,
          email: invoiceSource.data.email,
          ...(isCompany && {
            company_name: invoiceSource.data.company_name,
            tax_id: invoiceSource.data.tax_id,
          }),
        },
      };

      const response = await api.post(
        "/organizations/tariff/invoice/",
        payload
      );

      if (!response?.data?.invoice_number)
        throw new Error("Сервер не вернул invoice_number");

      const invoiceNumber = response.data.invoice_number;
      dispatch(setInvoiceNumb(invoiceNumber));

      await sleep(2500);

      const invoiceInfoResponse = await api.get(
        `/organizations/${invoiceNumber}/invoice`
      );

      // ✅ сохраняем полностью ответ
      dispatch(setInvoiceData(invoiceInfoResponse));

      setIsSubmitting(false);

      // ✅ Переход на страницу /organizations/:id/invoicePage
      history.push(
        `/organizations/${invoiceSource.organization}/invoicePage`
      );
    } catch (error) {
      console.error("❌ Ошибка:", error);
      Notify.error({
        text:
          error.response?.data?.detail ||
          error.message ||
          translate("Ошибка", "app.error"),
      });
      setIsSubmitting(false);
    }
  };

  const handleOnlinePayment = async (code) => {
    const response = await api.post("/transactions/new-pay/", {
      transaction_id: transactionId,
      payment_method_code: code,
    });

    if (response.data?.redirect_url) {
      window.location.href = response.data.redirect_url;
    } else {
      throw new Error("No redirect URL received");
    }
  };

  const paymentHandlers = {
    cryptocloud: handleOnlinePayment,
    Invoice: handleInvoicePayment,
  };

  const handleCategoryClick = async (code) => {
    if (isSubmitting) return;

    setSelected(code);
    setIsSubmitting(true);

    const handler = paymentHandlers[code];
    if (!handler) return;

    try {
      await handler(code);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const paymentIcons = {
    Invoice: paymentSystemIconInvoice,
    cryptocloud: paymentSystemIconCrypto,
  };

  return (
    <div className="payment-form__payment-system-selection">
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Выбор оплаты", "payment.paymentSelection")}
        className="payment-form__payment-system-selection-header"
      />

      <div className="container containerMax">
        <div className="payment-from__payment-category-wrapper">
          {loading && <Preloader />}

          {options.map((option) => (
            <CategoryOption
              key={option.code}
              label={option.name}
              icon={{
                file: paymentIcons[option.code] || paymentSystemIconInvoice,
              }}
              onClick={() => handleCategoryClick(option.code)}
              className="payment-form__payment-system-selection-option"
              renderRight={
                selected === option.code &&
                isSubmitting &&
                (() => <OptionLoader />)
              }
            />
          ))}
        </div>
      </div>

      {/* {showPdfViewer && invoicePdfUrl && (
        <div className="container">
          <div className="pdf-modal">
            <iframe
              src={invoicePdfUrl}
              title="Invoice PDF"
              style={{ width: "100%", height: "100%", border: "none" }}
            />

            <div className="pdf-actions">
              <button onClick={handleDownload}>Скачать PDF</button>
              <button onClick={handleCloseViewer}>Закрыть</button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SubscriptionPaymentSystemPage;
