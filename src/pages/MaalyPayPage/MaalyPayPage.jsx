import React, { useState } from "react";

import MobileTopHeader from "@components/MobileTopHeader";

import { QuestionIcon } from "@components/UI/Icons";
import { translate } from "@locales/locales";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";

import maalyPay from "../../assets/images/maalyPay.svg";
import ziinaPayIcon from "../../assets/images/zina-pay.png";

import "./index.scss";
import { CategoryOption } from "@components/CategoryOption";
import RowButton from "@components/UI/RowButton";
import WideButton, { WIDE_BUTTON_VARIANTS } from "@components/UI/WideButton";
import { EyeShow } from "./icons";

import axios from "axios-api";
import Notify from "@components/Notification";
import { setPreOrganization } from "@store/actions/discountActions";
import { useDispatch, useSelector } from "react-redux";

const MaalyPayPage = () => {
  const history = useHistory();

  const { id, paymentId } = useParams();

  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");

  const dispatch = useDispatch();

  const [showApiKey, setShowApiKey] = useState(false);
  const orgDetail = useSelector((state) => state.orgDetail.detail.data);

  // 🔥 Кнопка неактивна, если хотя бы одно поле пустое
  const isDisabled = merchantId.trim() === "" || apiKey.trim() === "";
  const user = useSelector((state) => state.userStore.user);

  const handleClick = () => {
    window.open(
      "https://maalyportal.com/merchant/register?ref=foxPxLa4YKd3Ja1K",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `/organizations/${id}/payment_systems/confirmation/`,
        {
          api_key: apiKey,
          merchant_id: merchantId,
          payment_system_id: paymentId,
        }
      );

      const responseSuc = await axios.post(`/transactions/preprocess/`, {
        organization: id,
        client: user.id,
      });

      console.log("RESPONSE", response);

      // ✅ УСПЕХ
      Notify.success({
        text: translate(
          "Maaly Pay успешно подключён",
          "message.maalySuccessConnect"
        ),
      });

      // 🔁 РЕДИРЕКТ (лучше с небольшой задержкой)
      setTimeout(() => {
        dispatch(
          setPreOrganization({
            id: id,
            image: orgDetail.image,
            title: orgDetail.title,
            types: orgDetail.types,
            currency: orgDetail.currency,
            online_payment_activated: orgDetail.online_payment_activated,
          })
        );

        history.push(`/proceed-discount/${id}`, "maalyPay");
      }, 500);
    } catch (error) {
      console.log("ERROR", error);

      // ❌ ОШИБКА
      Notify.error({
        text:
          error?.response?.data?.message ||
          translate(
            "Ошибка подключения Maaly Pay. Проверьте данные.",
            "message.maalyErrorConnect"
          ),
      });
    }
  };

  const location = useHistory();

  console.log("ORG DETAIL", orgDetail);

  const ziinaPay = location.location.state === "ziinaPay";

  return (
    <>
      <MobileTopHeader
        onBack={() => history.push(`/organizations/${id}/payment/settings`)}
        onNext={() =>
          ziinaPay
            ? history.push(`/organizations/${id}/payment/reference`, "ziinaPay")
            : history.push(`/organizations/${id}/payment/reference`)
        }
        nextLabel={<QuestionIcon />}
        title={ziinaPay ? "Ziina Pay" : "Maaly Pay"}
      />
      <div className="container containerMax">
        {ziinaPay ? (
          <div className="maaly-pay__wrapper">
            <h2 className="maaly-pay__title">
              {translate("Идентификация бизнеса", "app.maalyIdBusn")}
            </h2>
            <ul className="maaly-pay__descriptions">
              <li className="maaly-pay__item">
                {translate(
                  "Подключение Ziina Pay (ОАЭ)",
                  "message.ziinaConnect"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Пройдите регистрацию и идентификацию бизнеса в ОАЭ для получения  Ziina Pay API Key.",
                  "message.zinnaRegister"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Требуется подтверждение юридического лица, владельца, банковского счёта в ОАЭ и владения страницей вашей организации в Apofiz.",
                  "message.maalySuccess"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Если ваш профиль в Apofiz уже верифицирован (“синяя галочка”), проверка проходит быстрее, но при необходимости может быть запрошена дополнительная информация.",
                  "message.maalyProfile"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "После активации вы сможете принимать криптоплатежи со всего мира с автоматическим зачислением в AED на ваш банковский счёт в ОАЭ.",
                  "message.maalyAfterActive"
                )}
              </li>

              <p className="maaly-pay__item maaly-pay__item-important">
                <span>{translate("Важно", "usragr.section7.title")}:</span>{" "}
                {translate(
                  "Для подробной информации и официальной документации нажмите на вопрос, вы сможете изучить документацию, и шаги регистрации и авторизации для получения оплаты в цифровых активах.",
                  "message.maalyImportant"
                )}
              </p>
            </ul>

            <CategoryOption
              label={
                ziinaPay
                  ? translate(
                      "Авторизоваться Ziina Pay",
                      "app.ziinaPayRegister"
                    )
                  : translate(
                      "Авторизоваться Maaly Pay",
                      "app.maalyPayRegister"
                    )
              }
              icon={{ file: ziinaPay ? ziinaPayIcon : maalyPay }}
              onClick={handleClick}
              className="maaly-pay__register-btn"
            />

            <form className="maaly-pay__from">
              {/* Merchant ID */}
              {ziinaPay ? (
                ""
              ) : (
                <div className="maaly-pay__input">
                  <p
                    className="maaly-pay__input-title"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Merchant ID Maaly Pay</span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        ziinaPay
                          ? history.push(
                              `/organizations/${id}/payment/reference`,
                              "ziinaPay"
                            )
                          : history.push(
                              `/organizations/${id}/payment/reference`
                            )
                      }
                    >
                      <QuestionIcon />
                    </span>
                  </p>

                  <input
                    type="text"
                    placeholder={translate(
                      "Укажите Merchant ID Maaly Pay",
                      "register.maalyMerchant"
                    )}
                    value={merchantId}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, "");
                      setMerchantId(onlyNums);
                      // setApiKey(onlyNums);
                    }}
                    inputMode="numeric" // открывает на телефоне цифровую клавиатуру
                  />
                </div>
              )}

              {/* API Key */}
              <div className="maaly-pay__input">
                <p
                  className="maaly-pay__input-title"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {ziinaPay ? "Ziina Pay API Key" : "Maaly Pay API Key"}{" "}
                  </span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      ziinaPay
                        ? history.push(
                            `/organizations/${id}/payment/reference`,
                            "ziinaPay"
                          )
                        : history.push(`/organizations/${id}/payment/reference`)
                    }
                  >
                    <QuestionIcon />
                  </span>
                </p>

                <div className="maaly-pay__password-wrapper">
                  <input
                    type={showApiKey ? "text" : "password"} // ← звёздочки
                    placeholder={
                      ziinaPay
                        ? translate(
                            "Укажите Ziina Pay API Key",
                            "register.ziinaApi"
                          )
                        : translate(
                            "Укажите Maaly Pay API Key",
                            "register.maalyApi"
                          )
                    }
                    value={apiKey}
                    onChange={(e) => {
                      // разрешаем только цифры
                      setApiKey(e.target.value);
                    }}
                  />

                  {/* Глаз (показать/скрыть) */}
                  <span
                    className="maaly-pay__password-eye"
                    onClick={() => setShowApiKey((prev) => !prev)}
                  >
                    <EyeShow />
                  </span>
                </div>
              </div>

              {/* Кнопка */}
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                disabled={isDisabled}
                className="maaly-pay__btn"
                style={{
                  margin: "15px 0 31px",
                  background: isDisabled ? "#c4c4c4" : "#007AFF", // 🔥 визуальное затемнение
                  pointerEvents: isDisabled ? "none" : "auto", // 🔥 блокируем клики
                }}
                onClick={handleSubmit}
              >
                {translate("Провести тестовый платеж", "app.maalyTestPay")}
              </WideButton>
            </form>
          </div>
        ) : (
          <div className="maaly-pay__wrapper">
            <h2 className="maaly-pay__title">
              {translate("Идентификация бизнеса", "app.maalyIdBusn")}
            </h2>
            <ul className="maaly-pay__descriptions">
              <li className="maaly-pay__item">
                {translate(
                  "Подключение Maaly Pay (ОАЭ)",
                  "message.maalyConnect"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Пройдите регистрацию и идентификацию бизнеса в ОАЭ для получения Merchant ID и Maaly Pay API Key.",
                  "message.maalyRegister"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Требуется подтверждение юридического лица, владельца, банковского счёта в ОАЭ и владения страницей вашей организации в Apofiz.",
                  "message.maalySuccess"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "Если ваш профиль в Apofiz уже верифицирован (“синяя галочка”), проверка проходит быстрее, но при необходимости может быть запрошена дополнительная информация.",
                  "message.maalyProfile"
                )}
              </li>
              <li className="maaly-pay__item">
                {translate(
                  "После активации вы сможете принимать криптоплатежи со всего мира с автоматическим зачислением в AED на ваш банковский счёт в ОАЭ.",
                  "message.maalyAfterActive"
                )}
              </li>

              <p className="maaly-pay__item maaly-pay__item-important">
                <span>{translate("Важно", "usragr.section7.title")}:</span>{" "}
                {translate(
                  "Для подробной информации и официальной документации нажмите на вопрос, вы сможете изучить документацию, и шаги регистрации и авторизации для получения оплаты в цифровых активах.",
                  "message.maalyImportant"
                )}
              </p>
            </ul>

            <CategoryOption
              label={translate(
                "Авторизоваться Maaly Pay",
                "app.maalyPayRegister"
              )}
              icon={{ file: maalyPay }}
              onClick={handleClick}
              className="maaly-pay__register-btn"
            />

            <form className="maaly-pay__from">
              {/* Merchant ID */}
              <div className="maaly-pay__input">
                <p
                  className="maaly-pay__input-title"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Merchant ID Maaly Pay</span>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      ziinaPay
                        ? history.push(
                            `/organizations/${id}/payment/reference`,
                            "ziinaPay"
                          )
                        : history.push(`/organizations/${id}/payment/reference`)
                    }
                  >
                    <QuestionIcon />
                  </span>
                </p>

                <input
                  type="text"
                  placeholder={translate(
                    "Укажите Merchant ID Maaly Pay",
                    "register.maalyMerchant"
                  )}
                  value={merchantId}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setMerchantId(onlyNums);
                  }}
                  inputMode="numeric" // открывает на телефоне цифровую клавиатуру
                />
              </div>

              {/* API Key */}
              <div className="maaly-pay__input">
                <p
                  className="maaly-pay__input-title"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Maaly Pay API Key</span>
                </p>

                <div className="maaly-pay__password-wrapper">
                  <input
                    type={showApiKey ? "text" : "password"} // ← звёздочки
                    placeholder={translate(
                      "Укажите Maaly Pay API Key",
                      "register.maalyApi"
                    )}
                    value={apiKey}
                    onChange={(e) => {
                      // разрешаем только цифры

                      setApiKey(e.target.value);
                    }}
                  />

                  {/* Глаз (показать/скрыть) */}
                  <span
                    className="maaly-pay__password-eye"
                    onClick={() => setShowApiKey((prev) => !prev)}
                  >
                    <EyeShow />
                  </span>
                </div>
              </div>

              {/* Кнопка */}
              <WideButton
                variant={WIDE_BUTTON_VARIANTS.ACCEPT}
                disabled={isDisabled}
                className="maaly-pay__btn"
                style={{
                  margin: "15px 0 31px",
                  background: isDisabled ? "#c4c4c4" : "#007AFF", // 🔥 визуальное затемнение
                  pointerEvents: isDisabled ? "none" : "auto", // 🔥 блокируем клики
                }}
                onClick={handleSubmit}
              >
                {translate("Провести тестовый платеж", "app.maalyTestPay")}
              </WideButton>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default MaalyPayPage;
