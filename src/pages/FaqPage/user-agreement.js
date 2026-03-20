import React, { useEffect, useRef, useState } from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { CONTACT_EMAIL } from "../../common/constants";
import TooltipPlayer from "../../components/TooltipPlayer";
import { LOCALES, translate } from "../../locales/locales";

import AUserAgreement01 from "../../assets/audio/ru/user_agreement_01.mp3";
import AUserAgreement02 from "../../assets/audio/ru/user_agreement_02.mp3";
import AUserAgreement11 from "../../assets/audio/ru/user_agreement_11.mp3";
import AUserAgreement14 from "../../assets/audio/ru/user_agreement_14.mp3";
import AUserAgreement21 from "../../assets/audio/ru/user_agreement_21.mp3";
import AUserAgreement22 from "../../assets/audio/ru/user_agreement_22.mp3";
import AUserAgreement23 from "../../assets/audio/ru/user_agreement_23.mp3";
import AUserAgreement24 from "../../assets/audio/ru/user_agreement_24.mp3";
import AUserAgreement25 from "../../assets/audio/ru/user_agreement_25.mp3";
import AUserAgreement26 from "../../assets/audio/ru/user_agreement_26.mp3";
import AUserAgreement27 from "../../assets/audio/ru/user_agreement_27.mp3";
import AUserAgreement28 from "../../assets/audio/ru/user_agreement_28.mp3";
import AUserAgreement31 from "../../assets/audio/ru/user_agreement_31.mp3";
import AUserAgreement32 from "../../assets/audio/ru/user_agreement_32.mp3";
import AUserAgreement41 from "../../assets/audio/ru/user_agreement_41.mp3";
import AUserAgreementImportant from "../../assets/audio/ru/user_agreement_important.mp3";

import AUserAgreement01_en from "../../assets/audio/en/user_agreement_01.mp3";
import AUserAgreement02_en from "../../assets/audio/en/user_agreement_02.mp3";
import AUserAgreement11_en from "../../assets/audio/en/user_agreement_11.mp3";
import AUserAgreement14_en from "../../assets/audio/en/user_agreement_14.mp3";
import AUserAgreement21_en from "../../assets/audio/en/user_agreement_21.mp3";
import AUserAgreement22_en from "../../assets/audio/en/user_agreement_22.mp3";
import AUserAgreement23_en from "../../assets/audio/en/user_agreement_23.mp3";
import AUserAgreement24_en from "../../assets/audio/en/user_agreement_24.mp3";
import AUserAgreement25_en from "../../assets/audio/en/user_agreement_25.mp3";
import AUserAgreement26_en from "../../assets/audio/en/user_agreement_26.mp3";
import AUserAgreement27_en from "../../assets/audio/en/user_agreement_27.mp3";
import AUserAgreement28_en from "../../assets/audio/en/user_agreement_28.mp3";
import AUserAgreement31_en from "../../assets/audio/en/user_agreement_31.mp3";
import AUserAgreement32_en from "../../assets/audio/en/user_agreement_32.mp3";
import AUserAgreement41_en from "../../assets/audio/en/user_agreement_41.mp3";
import AUserAgreementImportant_en from "../../assets/audio/en/user_agreement_important.mp3";
import { USER_AGREEMENT_LOCALES } from "../../assets/locales/locales";
import LoginView from "../../containers/LoginView";
import { useDispatch } from "react-redux";
import { setViews } from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { deleteAccount } from "../../store/services/userServices";
import Notify from "../../components/Notification";
import { push } from "react-router-redux";
import { PlayIcon } from "./components";
import TextLinkifier from "../../components/TextLinkifier";
import { setPrevPath } from "../../store/actions/userActions";

const FaqUserAgreement = ({
  language,
  goBack,
  isWebviewMode,
  isIosWebviewMode,
  isFirstTimeVisit,
}) => {
  const dispatch = useDispatch();

  const isEn = language !== LOCALES.ru;
  const LINKS = Object.freeze({
    tg: "https://t.me/apofizglobal",
    email: "info@apofiz.com",
    insta: "https://www.instagram.com/apofiz_app",
  });

  const [showLoginView, setShowLoginView] = useState(false);
  const [token, setToken] = useState(null);
  const [deleteBtnNode, setDeleteBtnNode] = useState(null);

  const isFromLoginView = useRef(false);

  const DATA = USER_AGREEMENT_LOCALES[language];

  const toggleShowLoginView = () => {
    setShowLoginView((prevState) => {
      if (prevState) isFromLoginView.current = true;
      return !prevState;
    });
  };

  const confirmDelete = (token) => {
    dispatch(
      setViews({
        type: VIEW_TYPES.account_deletion_confirmation,
        onAgree: async () => {
          try {
            const res = await deleteAccount(token);
            if (res.success) {
              dispatch(setViews([]));
              dispatch(
                setPrevPath(window.location.pathname + window.location.search)
              );
              dispatch(push("/auth"));
            }
          } catch (e) {
            Notify.error({ text: e.message });
          }
        },
      })
    );
  };

  const handleAccountDeletion = () => {
    if (token) {
      return confirmDelete(token);
    }
    toggleShowLoginView();
  };

  const getLinkProps = (match) => {
    const linkKey = Object.keys(LINKS).find((key) => LINKS[key] === match.raw);

    // for iOS webview
    if (linkKey && isIosWebviewMode) {
      return {
        onClick: (e) => {
          e.preventDefault();
          console.log(linkKey);
        },
      };
    }
  };

  useEffect(() => {
    if (isFromLoginView.current && deleteBtnNode) {
      deleteBtnNode.scrollIntoView();
      isFromLoginView.current = false;
    }
  }, [deleteBtnNode]);

  if (showLoginView) {
    return (
      <LoginView
        locale={language}
        onLoginSuccess={(res) => {
          toggleShowLoginView();
          setToken(res.data.token);
          confirmDelete(res.data.token);
          Notify.success({
            text: translate(
              "Вы успешно вошли в аккаунт",
              "notify.loginSuccess"
            ),
          });
        }}
        onLoginFailure={() => null}
        onBack={toggleShowLoginView}
      />
    );
  }

  return (
    <div className="faq-user-agreement">
      {!isWebviewMode && !isIosWebviewMode && (
        <MobileTopHeader
          title={translate("Пользовательское соглашение", "faq.termsOfUse")}
          onBack={() => goBack("/faq")}
        />
      )}

      <div className="faq__content">
        <div className="container">
          <h3 className="row">
            <span className="f-16 f-700">{DATA["usragr.section1.title"]}</span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement01_en : AUserAgreement01]}
            />
          </h3>
          <div className="faq-user-agreement__paragraph">
            <p>{DATA["usragr.section1.p1"]}</p>
            <p>{DATA["usragr.section1.p2"]}</p>
            <p>{DATA["usragr.section1.p3"]}</p>
          </div>

          <h3 className="row">
            <span className="f-16 f-700">{DATA["usragr.section2.title"]}</span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement02_en : AUserAgreement02]}
            />
          </h3>
          <div className="faq-user-agreement__paragraph">
            <ul className="faq-user-agreement__terminology-list">
              <li>
                <b>{DATA["usragr.section2.li1.title"]}</b> -{" "}
                {DATA["usragr.section2.li1.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li2.title"]}</b> -{" "}
                {DATA["usragr.section2.li2.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li3.title"]}</b> -{" "}
                {DATA["usragr.section2.li3.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li4.title"]}</b> -{" "}
                {DATA["usragr.section2.li4.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li5.title"]}</b> -{" "}
                {DATA["usragr.section2.li5.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li6.title"]}</b> -{" "}
                {DATA["usragr.section2.li6.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li7.title"]}</b> -{" "}
                {DATA["usragr.section2.li7.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li8.title"]}</b> -{" "}
                {DATA["usragr.section2.li8.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li9.title"]}</b> -{" "}
                {DATA["usragr.section2.li9.desc"]}
              </li>
              <li>
                <b>{DATA["usragr.section2.li10.title"]}</b> -{" "}
                {DATA["usragr.section2.li10.desc"]}
              </li>
            </ul>
          </div>

          <h3 className="row">
            <span className="f-16 f-700">
              1. {DATA["usragr.section3.title"]}
            </span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement11_en : AUserAgreement11]}
            />
          </h3>
          <ul className="faq-user-agreement__list">
            <li>
              <b>1.1.</b> {DATA["usragr.section3.li1"]}
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section3.li1.li1"]}</li>
                <li>{DATA["usragr.section3.li1.li2"]}</li>
                <li>{DATA["usragr.section3.li1.li3"]}</li>
                <li>{DATA["usragr.section3.li1.li4"]}</li>
                <li>{DATA["usragr.section3.li1.li5"]}</li>
                <li>{DATA["usragr.section3.li1.li6"]}</li>
                <li>{DATA["usragr.section3.li1.li7"]}</li>
                <li>{DATA["usragr.section3.li1.li8"]}</li>
              </ul>
            </li>
            <li>
              <b>1.2.</b> {DATA["usragr.section3.li2"]}
            </li>
            <li>
              <b>1.3.</b> {DATA["usragr.section3.li3"]}
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>1.4.</b> {DATA["usragr.section3.li4"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement14_en : AUserAgreement14]}
                />
              </div>
              <ul>
                <li>
                  <b>1.4.1</b> {DATA["usragr.section3.li4.li1"]}
                </li>
                <li>
                  <b>1.4.2</b> {DATA["usragr.section3.li4.li2"]}
                </li>
                <li>
                  <b>1.4.3</b> {DATA["usragr.section3.li4.li3"]}
                </li>
                <li>
                  <b>1.4.4</b> {DATA["usragr.section3.li4.li4"]}
                </li>
                <li>
                  <b>1.4.5</b> {DATA["usragr.section3.li4.li5"]}
                </li>
                <li>
                  <b>1.4.6</b> {DATA["usragr.section3.li4.li6"]}
                </li>
              </ul>
            </li>
          </ul>

          <h3 className="row">
            <span className="f-16 f-700">
              2. {DATA["usragr.section4.title"]}
            </span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement21_en : AUserAgreement21]}
            />
          </h3>
          <ul className="faq-user-agreement__list">
            <li>
              <b>2.1.</b> {DATA["usragr.section4.li1"]}
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section4.li1.li1"]}</li>
                <li>{DATA["usragr.section4.li1.li2"]}</li>
                <li>{DATA["usragr.section4.li1.li3"]}</li>
                <li>{DATA["usragr.section4.li1.li4"]}</li>
                <li>{DATA["usragr.section4.li1.li5"]}</li>
                <li>{DATA["usragr.section4.li1.li6"]}</li>
                <li>{DATA["usragr.section4.li1.li7"]}</li>
                <li>{DATA["usragr.section4.li1.li8"]}</li>
                <li>{DATA["usragr.section4.li1.li9"]}</li>
                <li>{DATA["usragr.section4.li1.li10"]}</li>
                <li>{DATA["usragr.section4.li1.li11"]}</li>
                <li>{DATA["usragr.section4.li1.li12"]}</li>
                <li>{DATA["usragr.section4.li1.li13"]}</li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.2.</b> {DATA["usragr.section4.li2"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement22_en : AUserAgreement22]}
                />
              </div>
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section4.li2.li1"]}</li>
                <li>{DATA["usragr.section4.li2.li2"]}</li>
                <li>{DATA["usragr.section4.li2.li3"]}</li>
                <li>{DATA["usragr.section4.li2.li4"]}</li>
                <li>{DATA["usragr.section4.li2.li5"]}</li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.3.</b> {DATA["usragr.section4.li3"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement23_en : AUserAgreement23]}
                />
              </div>
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section4.li3.li1"]}</li>
                <li>{DATA["usragr.section4.li3.li2"]}</li>
                <li>{DATA["usragr.section4.li3.li3"]}</li>
                <li>{DATA["usragr.section4.li3.li4"]}</li>
                <li>{DATA["usragr.section4.li3.li5"]}</li>
                <li>{DATA["usragr.section4.li3.li6"]}</li>
                <li>{DATA["usragr.section4.li3.li7"]}</li>
                <li>{DATA["usragr.section4.li3.li8"]}</li>
                <li>{DATA["usragr.section4.li3.li9"]}</li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.4.</b> {DATA["usragr.section4.li4"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement24_en : AUserAgreement24]}
                />
              </div>
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section4.li4.li1"]}</li>
                <li>{DATA["usragr.section4.li4.li2"]}</li>
                <li>{DATA["usragr.section4.li4.li3"]}</li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.5.</b> {DATA["usragr.section4.li5"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement25_en : AUserAgreement25]}
                />
              </div>
              <ul>
                <li>
                  <b>2.5.1</b> {DATA["usragr.section4.li5.li1"]}
                </li>
                <li>
                  <b>2.5.2</b> {DATA["usragr.section4.li5.li2"]}
                </li>
                <li>
                  <b>2.5.3</b> {DATA["usragr.section4.li5.li3"]}
                </li>
                <li>
                  <b>2.5.4</b> {DATA["usragr.section4.li5.li4"]}
                </li>
                <li>
                  <b>2.5.5</b> {DATA["usragr.section4.li5.li5"]}
                </li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.6.</b> {DATA["usragr.section4.li6"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement26_en : AUserAgreement26]}
                />
              </div>
              <ul>
                <li>
                  <b>2.6.1</b> {DATA["usragr.section4.li6.li1"]}
                </li>
                <li>
                  <b>2.6.2</b> {DATA["usragr.section4.li6.li2"]}
                </li>
                <li>
                  <b>2.6.3</b> {DATA["usragr.section4.li6.li3"]}
                </li>
                <li>
                  <b>2.6.4</b> {DATA["usragr.section4.li6.li4"]}
                </li>
                <li>
                  <b>2.6.5</b> {DATA["usragr.section4.li6.li5"]}
                </li>
                <li>
                  <b>2.6.6</b> {DATA["usragr.section4.li6.li6"]}
                </li>
                <li>
                  <b>2.6.7</b> {DATA["usragr.section4.li6.li7"]}
                </li>
                <li>
                  <b>2.6.8</b> {DATA["usragr.section4.li6.li8"]}
                </li>
                <li>
                  <b>2.6.9</b> {DATA["usragr.section4.li6.li9"]}
                </li>
                <li>
                  <b>2.6.10</b> {DATA["usragr.section4.li6.li10"]}
                </li>
                <li>
                  <b>2.6.11</b> {DATA["usragr.section4.li6.li11"]}
                </li>
                <li>
                  <b>2.6.12</b> {DATA["usragr.section4.li6.li12"]}
                </li>
                <li>
                  <b>2.6.13</b> {DATA["usragr.section4.li6.li13"]}
                </li>
                <li>
                  <b>2.6.14</b> {DATA["usragr.section4.li6.li14"]}
                </li>
                <li>
                  <b>2.6.15</b> {DATA["usragr.section4.li6.li15"]}
                </li>
                <li>
                  <b>2.6.16</b> {DATA["usragr.section4.li6.li16"]}
                </li>
                <li>
                  <b>2.6.17</b> {DATA["usragr.section4.li6.li17"]}
                </li>
                <li>
                  <b>2.6.18</b> {DATA["usragr.section4.li6.li18"]}
                </li>
                <li>
                  <b>2.6.19</b> {DATA["usragr.section4.li6.li19"]}
                </li>
                <li>
                  <b>2.6.20</b> {DATA["usragr.section4.li6.li20"]}
                </li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.7.</b> {DATA["usragr.section4.li7"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement27_en : AUserAgreement27]}
                />
              </div>
              <ul>
                <li>
                  <b>2.6.1</b> {DATA["usragr.section4.li7.li1"]}
                </li>
                <li>
                  <b>2.6.2</b> {DATA["usragr.section4.li7.li2"]}
                </li>
                <li>
                  <b>2.6.3</b> {DATA["usragr.section4.li7.li3"]}
                </li>
                <li>
                  <b>2.6.4</b> {DATA["usragr.section4.li7.li4"]}
                </li>
                <li>
                  <b>2.6.5</b> {DATA["usragr.section4.li7.li5"]}
                </li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>2.8.</b> {DATA["usragr.section4.li8"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement28_en : AUserAgreement28]}
                />
              </div>
              <ul>
                <li>
                  <b>2.8.1</b> {DATA["usragr.section4.li8.li1"]}
                </li>
                <li>
                  <b>2.8.2</b> {DATA["usragr.section4.li8.li2"]}
                </li>
                <li>
                  <b>2.8.3</b> {DATA["usragr.section4.li8.li3"]}
                </li>
                <li>
                  <b>2.8.4</b> {DATA["usragr.section4.li8.li4"]}
                </li>
                <li>
                  <b>2.8.5</b> {DATA["usragr.section4.li8.li5"]}
                </li>
                <li>
                  <b>2.8.6</b> {DATA["usragr.section4.li8.li6"]}
                </li>
                <li>
                  <b>2.8.7</b> {DATA["usragr.section4.li8.li7"]}
                </li>
                <li>
                  <b>2.8.8</b> {DATA["usragr.section4.li8.li8"]}
                </li>
                <li>
                  <b>2.8.9</b> {DATA["usragr.section4.li8.li9"]}
                </li>
              </ul>
            </li>
          </ul>

          <h3 className="row">
            <span className="f-16 f-700">
              3. {DATA["usragr.section5.title"]}
            </span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement31_en : AUserAgreement31]}
            />
          </h3>
          <ul className="faq-user-agreement__list">
            <li>
              <b>3.1.</b> {DATA["usragr.section5.li1"]}
              <ul className="faq-user-agreement__list">
                <li>
                  <b>3.1.1.</b> {DATA["usragr.section5.li1.li1"]}
                </li>
                <li>
                  <b>3.1.2.</b> {DATA["usragr.section5.li1.li2"]}
                </li>
                <li>
                  <b>3.1.3.</b> {DATA["usragr.section5.li1.li3"]}
                </li>
                <li>
                  <b>3.1.4.</b> {DATA["usragr.section5.li1.li4"]}
                </li>
                <li>
                  <b>3.1.5.</b> {DATA["usragr.section5.li1.li5"]}
                </li>
                <li>
                  <b>3.1.6.</b> {DATA["usragr.section5.li1.li6"]}
                </li>
                <li>
                  <b>3.1.7.</b> {DATA["usragr.section5.li1.li7"]}
                </li>
              </ul>
            </li>
            <li>
              <div className="row" style={{ margin: "15px 0" }}>
                <div>
                  <b>3.2.</b> {DATA["usragr.section5.li2"]}
                </div>
                <TooltipPlayer
                  sources={[isEn ? AUserAgreement32_en : AUserAgreement32]}
                />
              </div>
              <ul className="faq-user-agreement__list">
                <li>
                  <b>3.2.1.</b> {DATA["usragr.section5.li2.li1"]}
                </li>
                <li>
                  <b>3.2.2.</b> {DATA["usragr.section5.li2.li2"]}
                </li>
                <li>
                  <b>3.2.3.</b> {DATA["usragr.section5.li2.li3"]}
                </li>
                <li>
                  <b>3.2.4.</b> {DATA["usragr.section5.li2.li4"]}
                </li>
                <li>
                  <b>3.2.5.</b> {DATA["usragr.section5.li2.li5"]}
                </li>
              </ul>
            </li>
          </ul>

          <h3 className="row">
            <span className="f-16 f-700">
              4. {DATA["usragr.section6.title"]}
            </span>
            <TooltipPlayer
              sources={[isEn ? AUserAgreement41_en : AUserAgreement41]}
            />
          </h3>
          <ul className="faq-user-agreement__list">
            <li>
              <b>4.1.</b> {DATA["usragr.section6.li1"]}
            </li>
            <li>
              <b>4.2.</b> {DATA["usragr.section6.li2"]}
            </li>
            <li>
              <b>4.3.</b> {DATA["usragr.section6.li3"]}
            </li>
            <li>
              <b>4.4.</b> {DATA["usragr.section6.li4"]}
            </li>
            <li>
              <b>4.5.</b> {DATA["usragr.section6.li5"]}
            </li>
            <li>
              <b>4.6.</b> {DATA["usragr.section6.li6"]}
            </li>
            <li>
              <b>4.7.</b> {DATA["usragr.section6.li7"]}
            </li>
          </ul>

          <h3 className="row">
            <span className="f-16 f-700">
              5. {DATA["usragr.section7.title"]}
            </span>
            <PlayIcon />
          </h3>
          <ul className="faq-user-agreement__list">
            <li>
              <b>5.1.</b> {DATA["usragr.section7.li1"]}
            </li>
            <li>
              <b>5.2.</b> {DATA["usragr.section7.li2"]}
            </li>
            <li>
              <b>5.2.1.</b> {DATA["usragr.section7.li2.1"]}
            </li>

            <li>
              <div className="row">
                <div>
                  <b>5.2.2.</b> {DATA["usragr.section7.li2.2"]}
                </div>
                <PlayIcon />
              </div>
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section7.li2.2.li1"]}</li>
                <li>{DATA["usragr.section7.li2.2.li2"]}</li>
                <li>{DATA["usragr.section7.li2.2.li3"]}</li>
                <li>{DATA["usragr.section7.li2.2.li4"]}</li>
              </ul>
            </li>

            <li>
              <div className="row">
                <div>
                  <b>5.2.3.</b> {DATA["usragr.section7.li2.3"]}
                </div>
                <PlayIcon />
              </div>
              <ul className="faq-user-agreement__simple-list">
                <li>{DATA["usragr.section7.li2.3.li1"]}</li>
                <li>{DATA["usragr.section7.li2.3.li2"]}</li>
                <li>{DATA["usragr.section7.li2.3.li3"]}</li>
                <li>{DATA["usragr.section7.li2.3.li4"]}</li>
              </ul>
            </li>

            <li>
              <b>5.3.</b> {DATA["usragr.section7.li3"]}
            </li>
            <li>
              <b>5.3.1.</b> {DATA["usragr.section7.li3.1"]}
            </li>
            <li>
              <b>5.3.2.</b> {DATA["usragr.section7.li3.2"]}
            </li>
            <li>
              <b>5.4.</b> {DATA["usragr.section7.li4"]}
            </li>
            <li>
              <b>5.4.1.</b> {DATA["usragr.section7.li4.1"]}
            </li>
            <li>
              <b>5.4.2.</b> {DATA["usragr.section7.li4.2"]}
            </li>
            <li>
              <b>5.5.</b> {DATA["usragr.section7.li5"]}
            </li>
            <li>
              <b>5.5.1.</b> {DATA["usragr.section7.li5.1"]}
            </li>
            <li>
              <b>5.5.2.</b> {DATA["usragr.section7.li5.2"]}
            </li>
            <li>
              <b>5.6.</b> {DATA["usragr.section7.li6"]}
            </li>
            <li>
              <b>5.6.1.</b> {DATA["usragr.section7.li6.1"]}
            </li>
            <li>
              <b>5.7.</b> {DATA["usragr.section7.li7"]}
            </li>
            <li>
              <b>5.7.1.</b> {DATA["usragr.section7.li7.1"]}
            </li>
            <li>
              <b>5.8.</b> {DATA["usragr.section7.li8"]}
            </li>
            <li>
              <b>5.8.1.</b>
              <TextLinkifier
                text={DATA["usragr.section7.li8.1"]}
                getLinkProps={getLinkProps}
              />
            </li>
          </ul>

          <h3 className="row">
            <span className="f-16 f-700">{DATA["usragr.section8.title"]}</span>
            <TooltipPlayer
              sources={[
                isEn ? AUserAgreementImportant_en : AUserAgreementImportant,
              ]}
            />
          </h3>
          <div style={{ marginTop: "15px" }}>
            {DATA["usragr.section8.desc"]}
          </div>

          <h3 className="row">
            <span className="f-16 f-700">{DATA["usragr.section9.title"]}</span>
          </h3>

          <div className="f-16 f-700" style={{ marginTop: "15px" }}>
            <i>{DATA["usragr.section9.desc"]}</i>
          </div>
          {((!isWebviewMode && !isIosWebviewMode) || isFirstTimeVisit) && (
            <a
              className="faq-user-agreement__contact f-15 f-600"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {DATA["usragr.contact"]}
            </a>
          )}
          {(isWebviewMode || isIosWebviewMode) && !isFirstTimeVisit && (
            <button
              ref={(node) => setDeleteBtnNode(node)}
              onClick={handleAccountDeletion}
              className="faq-user-agreement__delete-account f-15 f-600"
            >
              {DATA["usragr.delete"]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqUserAgreement;
