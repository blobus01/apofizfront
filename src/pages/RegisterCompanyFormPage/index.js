import MobileTopHeader from "@components/MobileTopHeader";
import { InputTextField } from "@components/UI/InputTextField";
import { translate } from "@locales/locales";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./index.scss";
import Notify from "@components/Notification";
import { useDispatch, useSelector } from "react-redux";
import {
  clearOwnerInvoiceData,
  setCompanyInvoiceData,
  setInvoiceData,
} from "@store/actions/invoiceActions";
import { CategoryOption } from "@components/CategoryOption";
import registerOwnerIcon from "@/assets/icons/register_owner_icon.svg";

import axios from "../../axios-api";

function RegisterCompanyFormPage() {
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.search);
  const organization = searchParams.get("organizationId");
  const transactionId = searchParams.get("transactionId");

  const dispatch = useDispatch();
  const savedCompanyData = useSelector((state) => state.invoice.companyData);
  const savedOWnerData = useSelector((state) => state.invoice.ownerData);

  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    city: "",
    address: "",
    email: "",
    filialName: "",
    taxNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== Авто-загрузка данных если уже есть ====================

  useEffect(() => {
    if (savedCompanyData?.data) {
      setFormData({
        companyName: savedCompanyData.data.company_name || "",
        country: savedCompanyData.data.country || "",
        city: savedCompanyData.data.city || "",
        address: savedCompanyData.data.address || "",
        email: savedCompanyData.data.email || "",
        filialName: savedCompanyData.data.full_name || "",
        taxNumber: savedCompanyData.data.tax_id || "",
      });
    }
  }, [savedCompanyData]);

  // ==================== Валидация ====================

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "companyName":
        if (!value.trim()) error = "Название компании обязательно";
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
      case "filialName":
        if (!value.trim()) error = "Название филиала обязательно";
        break;
      case "taxNumber":
        if (!value.trim()) error = "Налоговый номер обязателен";
        else if (!/^\d+$/.test(value.trim())) error = "Только цифры";
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

  const isFormValid = () => {
    return (
      Object.values(formData).every((value) => value.trim() !== "") &&
      Object.values(errors).every((error) => error === "")
    );
  };

  // ==================== Сохранение и переход ====================

  const handleSubmit = async () => {
    if (isSubmitting) return; // защита от повторных кликов

    if (!isFormValid()) {
      Notify.error({ text: "Заполните поля корректно" });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      invoice_type: "company",
      payment_method: "bank",
      data: {
        full_name: formData.filialName,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        email: formData.email,
        company_name: formData.companyName,
        tax_id: formData.taxNumber,
      },
      organization: Number(organization),
      transactionId,
    };

    try {
      // Сохраняем данные в redux
      dispatch(setCompanyInvoiceData(payload));
      dispatch(clearOwnerInvoiceData());

      // Отправляем POST-запрос
      const res = await axios.post(
        "/organization/create/invoice-info/",
        payload
      );

      console.log("✅ Company invoice created:", res.data);

      // Переход только после успешного ответа
      history.push(
        `/organizations/${organization}/payment-methods?transaction=${transactionId}`
      );
    } catch (err) {
      console.error("❌ Ошибка при создании company invoice:", err);

      const message =
        (err?.response?.data && JSON.stringify(err.response.data)) ||
        err.message ||
        "Ошибка при создании счёта. Попробуйте ещё раз.";

      Notify.error({ text: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== UI ====================

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={translate("Данные компании", "register.companyForm")}
        className="payment-form__payment-system-selection-header"
        onNext={handleSubmit}
        submitLabel={translate("Далее", "app.next")}
        isSubmitting={isSubmitting}
        disabled={!isFormValid() || isSubmitting}
      />
      <div className="register-company-form-page container">
        {/* 
      
        Китайский

      */}

        <CategoryOption
          label={translate("Выбрать из списка", "register.choice")}
          icon={{ file: registerOwnerIcon }}
          onClick={() =>
            history.push(
              `/organization/${organization}/register/company/choicelist/${"company"}`
            )
          }
          className="register-payment-select__option"
        />

        <div className="register-company-form-page__container container">
          {Object.keys(formData).map((key) => (
            <InputTextField
              key={key}
              name={key}
              label={translate(key, `register.${key}Label`)}
              value={formData[key]}
              onChange={(event) => handleFieldChange(key, event)}
              error={errors[key]}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default RegisterCompanyFormPage;
