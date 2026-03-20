import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React from "react";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";

import firstExample from "./images/Merchant ID.png";
import secondExample from "./images/API HAND MAALY.png";

import ziinnaFirst from "./images/ziina1.png";
import ziinnaSecond from "./images/ziina2.png";
import ziinnaThird from "./images/ziina3.png";
import ziinnaFour from "./images/zinna4.png";

import WideButton, { WIDE_BUTTON_VARIANTS } from "@components/UI/WideButton";

import "./index.scss";

const MaalyPayReference = () => {
  const history = useHistory();

  const location = useLocation();

  console.log("LOCATION", location);

  const ziinaPay = location.state === "ziinaPay";

  return (
    <>
      <MobileTopHeader
        onBack={() => history.goBack()}
        title={
          ziinaPay
            ? "Ziina Pay"
            : translate("Справка Maaly Pay", "payment.maalyRefernce")
        }
      />
      {ziinaPay ? (
        <div className="container containerMax">
          <div className="maaly-pay-reference">
            <p
              className="maaly-pay-reference__title"
              style={{ fontStyle: "normal", fontWeight: "600" }}
            >
              {translate(
                "Как подключить Ziina Pay и заполнить для интеграции VISA и Master card в вашу организацию :",
                "app.howToConnectZiina"
              )}
            </p>
            <ul
              className="maaly-pay-reference__descr"
              style={{ marginTop: 20 }}
            >
              <p
                className="maaly-pay-reference__descr-title"
                style={{ fontWeight: 600 }}
              >
                {translate(
                  "Для получения Api Key Ziina Pay надо:",
                  "app.forGetApiKeyZiina"
                )}
              </p>
              <p
                className="maaly-pay-reference__descr-title"
                style={{ fontWeight: 400 }}
              >
                {translate(
                  "Перейдите в раздел для разработчиков Ziina Pay",
                  "app.goToDeveloperSectionZiina"
                )}
              </p>
              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                1.{" "}
                {translate(
                  "Перейдите в раздел для разработчиков Ziina Pay по ссылке",
                  "message.ziinnaAfterRegsiter"
                )}
                <a
                  target="_blank"
                  style={{ color: "#007AFF", textDecoration: "none" }}
                  href="https://docs.ziina.com/api-reference/introduction"
                >
                  {" "}
                  https://docs.ziina.com/api-reference/introduction
                </a>
              </p>
              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                2.{" "}
                {translate(
                  "В верхнем меню откройте вкладку API Reference → Get token at Ziina website (как на первом скрине).",
                  "messsage.zinnaYourId"
                )}
              </p>
            </ul>
            <img
              style={{ margin: "18px auto", display: "block" }}
              src={ziinnaFirst}
              alt=""
            />
            <p className="maaly-pay-reference__title">
              {translate(
                "Все что надо для получения Api Key пройти по шагам перейдя нажав на “Get token at Ziina website”.",
                "app.ziinaAllWhatNeed"
              )}
            </p>
          </div>
          <div className="maaly-pay-reference">
            <ul className="maaly-pay-reference__descr">
              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                3.{" "}
                {translate(
                  "В списке интеграций прокрутите до пункта Other builder or custom и нажмите на него (второй скрин).",
                  "app.inIntegrationListZiina"
                )}
              </p>
            </ul>
            <img
              style={{ margin: "14px auto", display: "block" }}
              src={ziinnaSecond}
              alt=""
            />
            <p className="maaly-pay-reference__title forZiinaPayTitle">
              {translate(
                "Важно находиться на вкладке для Бизнеса для API key",
                "app.ziinaImportantBusiness"
              )}
            </p>
          </div>
          <div className="maaly-pay-reference" style={{ margin: "10px 0" }}>
            <ul className="maaly-pay-reference__descr">
              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                4.{" "}
                {translate(
                  "На экране Enter your phone number введите свой номер телефона в формате ОАЭ +971 номер телефона который использовали при регистрации",
                  "app.ziinaOnScreenEnter"
                )}
              </p>
              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                5.{" "}
                {translate(
                  "Нажмите кнопку со стрелкой → и пройдите вход/регистрацию (вам может прийти SMS-код) или сканирование QR - code",
                  "app.ziinaPressArrow"
                )}
              </p>
              <img
                style={{ margin: "14px auto", display: "block" }}
                src={ziinnaThird}
                alt=""
              />
              <p className="maaly-pay-reference__title forZiinaPayTitle">
                {translate(
                  "После ввода номера может прийти OTP или запросить сканировать QR-code для авторизации",
                  "app.ziinaAfterEnterNumber"
                )}
              </p>

              <p className="maaly-pay-reference__descr-title forZiinaPayTitle">
                {translate(
                  "Сгенерируйте API Key в Ziina",
                  "app.generateApiKeyZiina"
                )}
              </p>

              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                6.{" "}
                {translate(
                  "После входа откроется экран с блоком You already have an API key.",
                  "app.afterLoginOpenScreenZiina"
                )}
              </p>

              <li
                className="maaly-pay-reference__descr-item-ziina forZiinaPayTitle"
                style={{ margin: "0 0 15px" }}
              >
                {translate(
                  "Если ключ уже был создан, вы увидите кнопку Generate new key.",
                  "message.maalyAfterAddDataZiina"
                )}
              </li>

              <p className="maaly-pay-reference__descr-title forZiinaPayTitle">
                7.{" "}
                {translate(
                  "Нажмите Generate new key.",
                  "app.pressGenerateNewKeyZiina"
                )}
              </p>

              <p className="maaly-pay-reference__descr-title forZiinaPayTitle ziina-ol">
                8.{" "}
                {translate(
                  "Скопируйте новый API Key (он показывается только один раз).",
                  "app.copyNewApiKeyZiina"
                )}
              </p>

              <li className="maaly-pay-reference__descr-item-ziina forZiinaPayTitle">
                {translate(
                  "Сохраните его в безопасное место: при генерации нового ключа старый станет недействительным.",
                  "message.maalyAfterAddDataZiina"
                )}
              </li>

              <img
                style={{ margin: "14px auto", display: "block" }}
                src={ziinnaFour}
                alt=""
              />

              <p className="maaly-pay-reference__title forZiinaPayTitle">
                {translate(
                  "Если вы решите сменить старый API key на новый просто замените его в приложение Apofiz.com",
                  "app.ziinaIfYouDecide"
                )}
              </p>
            </ul>
          </div>
          <p className="maaly-pay-reference__title forZiinaPayTitle">
            <span style={{ color: "#D72C20" }}>
              {translate("Важно", "usragr.section7.title")}:
            </span>{" "}
            {translate(
              "Для перевода на банковский счет Вам необходимо перейти на страницу через приложение Ziina Pay и вывести на указанный счет необходимые средства",
              "org.forZiinaTransactionBank"
            )}
          </p>
          <WideButton
            variant={WIDE_BUTTON_VARIANTS.ACCEPT}
            style={{
              margin: "15px 0 31px",
            }}
          >
            {translate(
              "Лицензии и документация Ziina Pay",
              "app.ziinaDocumentPay"
            )}
          </WideButton>
        </div>
      ) : (
        <div className="container containerMax">
          <div className="maaly-pay-reference">
            <p
              className="maaly-pay-reference__title"
              style={{ fontStyle: "normal", fontWeight: "600" }}
            >
              {translate(
                "Как подключить Maaly Pay и заполнить два поля для интеграции:",
                "app.howToConnectMaaly"
              )}
            </p>
            <ul className="maaly-pay-reference__descr">
              <p className="maaly-pay-reference__descr-title">
                1 - Merchant ID
              </p>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "После регистрации в Maaly Pay перейдите в раздел Profile.",
                  "message.maalyAfterRegsiter"
                )}
              </li>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "Ваш Merchant ID присваивается автоматически при регистрации в Maaley Pay, просто скопируйте его и вставьте в поле в приложении Apofiz.",
                  "messsage.maalyYourId"
                )}
              </li>
            </ul>
            <img
              style={{ margin: "18px auto", display: "block" }}
              src={firstExample}
              alt=""
            />
            <p className="maaly-pay-reference__title">
              {translate(
                "Это ваш уникальный идентификатор бизнеса в ОАЭ, который используется для приёма криптоплатежей.",
                "app.maalyYourId"
              )}
            </p>
          </div>
          <div className="maaly-pay-reference">
            <ul className="maaly-pay-reference__descr">
              <p className="maaly-pay-reference__descr-title">
                2 - Maaly Pay API Key
              </p>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "Откройте раздел Maaly Pay API.",
                  "message.maalyOpenApi"
                )}
              </li>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "Скопируйте ваш API Key и вставьте в соответствующее поле в Apofiz.",
                  "messsage.maalyCopyYourApi"
                )}
              </li>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "Этот ключ позволяет проводить платежи, создавать счета и выполнять тестовые операции.",
                  "messsage.maalyKeyPay"
                )}
              </li>
            </ul>
            <img
              style={{ margin: "14px auto", display: "block" }}
              src={secondExample}
              alt=""
            />
            <p className="maaly-pay-reference__title">
              {translate(
                "Скопируйте ключ Maaly Pay API Key и вставьте в поле в приложении Apofiz. ",
                "app.maalyCopyApiKey"
              )}
            </p>
          </div>
          <div className="maaly-pay-reference" style={{ margin: "10px 0" }}>
            <ul className="maaly-pay-reference__descr">
              <p className="maaly-pay-reference__descr-title">
                {translate(
                  "3 - Что дальше?  Тестовый платёж",
                  "app.maalyWhatNext"
                )}
              </p>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "После добавления данных выполните тестовый платеж через Apofiz, чтобы убедиться, что интеграция активна и платежи успешно обрабатываются Maaly Pay.",
                  "message.maalyAfterAddData"
                )}
              </li>
              <li className="maaly-pay-reference__descr-item">
                {translate(
                  "Если все данные введены корректно — платеж будет подтвержден, и вы сможете начать принимать реальные криптоплатежи с выводом в AED на ваш банковский счет в ОАЭ.",
                  "messsage.maalyIfAllData"
                )}
              </li>
            </ul>
          </div>
          <p className="maaly-pay-reference__title">
            <span style={{ color: "#D72C20" }}>
              {translate("Важно", "usragr.section7.title")}:
            </span>{" "}
            {translate(
              "Для перевода на банковский счет Вам необходимо получить минимальную сумму в размере 1,000 AED, это минимальный платеж для перевода на     Ваш Бизнес IBAN компании. Лимит можно регулировать и увеличивать для Вашего удобства. Все проведенные платежи и подробную статистику вы сможете посмотреть в разделе касса выбрав история платежей Maaly Pay.",
              "app.maalyForTransfer"
            )}
          </p>
          <WideButton
            variant={WIDE_BUTTON_VARIANTS.ACCEPT}
            style={{
              margin: "15px 0 31px",
            }}
          >
            {translate(
              "Лицензии и документация Maaly Pay",
              "app.maalyDocumentPay"
            )}
          </WideButton>
        </div>
      )}
    </>
  );
};

export default MaalyPayReference;
