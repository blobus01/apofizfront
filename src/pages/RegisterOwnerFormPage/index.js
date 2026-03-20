  import MobileTopHeader from "@components/MobileTopHeader";
  import { InputTextField } from "@components/UI/InputTextField";
  import { translate } from "@locales/locales";
  import React, { useState, useEffect } from "react";
  import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
  import "./index.scss";
  import Notify from "@components/Notification";

  import { useDispatch, useSelector } from "react-redux";
  import {
    clearCompanyInvoiceData,
    setOwnerInvoiceData,
  } from "@store/actions/invoiceActions";

  import registerCompanyIcon from "@/assets/icons/register_company_icon.svg";
  import { CategoryOption } from "@components/CategoryOption";

  import axios from "../../axios-api";

  function RegisterOwnerFormPage() {
    const history = useHistory();
    const searchParams = new URLSearchParams(window.location.search);
    const organizationId = searchParams.get("organizationId");
    const transactionId = searchParams.get("transactionId");

    const dispatch = useDispatch();
    const savedOwnerData = useSelector((state) => state.invoice.ownerData);

    const [formData, setFormData] = useState({
      fullname: "",
      country: "",
      city: "",
      address: "",
      email: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // preload if owner data exists
    useEffect(() => {
      if (savedOwnerData) {
        setFormData({
          fullname: savedOwnerData.data.full_name || "",
          country: savedOwnerData.data.country || "",
          city: savedOwnerData.data.city || "",
          address: savedOwnerData.data.address || "",
          email: savedOwnerData.data.email || "",
        });
      }
    }, [savedOwnerData]);

    const validateField = (name, value) => {
      let error = "";
      switch (name) {
        case "fullname":
          if (!value.trim()) error = "ФИО обязательно для заполнения";
          else if (value.trim().split(" ").length < 2)
            error = "Введите полное ФИО (минимум 2 слова)";
          break;
        case "country":
          if (!value.trim()) error = "Страна обязательна";
          break;
        case "city":
          if (!value.trim()) error = "Город обязателен";
          break;
        case "address":
          if (!value.trim()) error = "Адрес обязателен";
          break;
        case "email":
          if (!value.trim()) error = "Email обязателен";
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            error = "Введите корректный email";
          break;
        default:
          break;
      }
      return error;
    };

    const handleFieldChange = (name, event) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const isFormValid = () =>
      Object.values(formData).every((v) => v.trim() !== "") &&
      Object.values(errors).every((e) => e === "");

    const handleSubmit = async () => {
      // защита от повторных кликов
      if (isSubmitting) return;

      if (!isFormValid()) {
        Notify.error({ text: "Заполните все обязательные поля корректно." });
        return;
      }

      // подготовка полезной нагрузки
      const payload = {
        invoice_type: "owner",
        payment_method: "bank",
        data: {
          full_name: formData.fullname,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          email: formData.email,
        },
        organization: Number(organizationId),
        transactionId,
      };

      // ставим флаг отправки
      setIsSubmitting(true);

      try {
        // сохраняем в локальный стейт (redux) сразу — удобно для UI и отката
        dispatch(setOwnerInvoiceData(payload));
        dispatch(clearCompanyInvoiceData());

        // отправляем на сервер
        const res = await axios.post(
          "/organization/create/invoice-info/",
          payload
        );

        console.log("Invoice created:", res.data);

        // после успешного ответа переходим на страницу способов оплаты
        history.push(
          `/organizations/${organizationId}/payment-methods?transaction=${transactionId}`
        );
      } catch (err) {
        console.error("Error creating invoice:", err);

        // если сервер вернул сообщение об ошибке — показываем его, иначе общее уведомление
        const message =
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Ошибка при создании счёта. Попробуйте ещё раз.";

        Notify.error({ text: message });
      } finally {
        // сбрасываем флаг — если произошёл переход, компонент вероятно размонтируется,
        // но всё равно корректно снять isSubmitting для безопасности
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <MobileTopHeader
          onBack={() => history.goBack()}
          title={translate("Данные собственника", "register.ownerForm")}
          className="payment-form__payment-system-selection-header"
          onNext={handleSubmit}
          submitLabel={translate("Далее", "app.next")}
          isSubmitting={isSubmitting}
          disabled={!isFormValid() || isSubmitting}
        />
        <div className="register-owner-form-page container containerMax">
          <CategoryOption
            label={translate("Оформить на собственика", "register.choice")}
            icon={{ file: registerCompanyIcon }}
            onClick={() =>
              history.push(
                `/organization/${organizationId}/register/company/choicelist/${"owner"}`
              )
            }
            className="register-payment-select__option"
          />

          <div className="register-owner-form-page__container container">
            <InputTextField
              name="fullname"
              label={translate("ФИО", "register.fullnameLabel")}
              value={formData.fullname}
              onChange={(e) => handleFieldChange("fullname", e)}
              error={errors.fullname}
            />
            <InputTextField
              name="country"
              label={translate("Укажите страну", "register.countryLabel")}
              value={formData.country}
              onChange={(e) => handleFieldChange("country", e)}
              error={errors.country}
            />
            <InputTextField
              name="city"
              label={translate("Укажите город", "register.cityLabel")}
              value={formData.city}
              onChange={(e) => handleFieldChange("city", e)}
              error={errors.city}
            />
            <InputTextField
              name="address"
              label={translate(
                "Улица, номер, номер здания, квартира",
                "register.addressLabel"
              )}
              value={formData.address}
              onChange={(e) => handleFieldChange("address", e)}
              error={errors.address}
            />
            <InputTextField
              name="email"
              label={translate("Укажите Email", "hint.enterEmail")}
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e)}
              error={errors.email}
            />
          </div>
        </div>
      </>
    );
  }

  export default RegisterOwnerFormPage;
