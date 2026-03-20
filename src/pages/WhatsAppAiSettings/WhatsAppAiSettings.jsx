import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import React, { useEffect, useRef, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { DisconectWaha, ImportantIcon, QrIcon, WhatsAppIcon } from "./Icons";
import ToggleSwitch from "@components/UI/ToggleSwitch";
import classNames from "classnames";

import classes from "./index.module.scss";
import { ForFirstIcon } from "@pages/AIAssistantDetailInfoPage/icons";
import { ButtonWithContent } from "@components/UI/Buttons";
import { NoteIcon } from "@components/UI/Icons";
import axios from "axios-api";
import { QRCodeCanvas } from "qrcode.react";
import Notify from "@components/Notification";
import Loader from "@components/UI/Loader";
import useDialog from "@components/UI/Dialog/useDialog";

const WhatsAppAiSettings = () => {
  const history = useHistory();
  const { orgID } = useParams();
  const [qrCode, setQrCode] = useState(false);
  const [data, setData] = useState(null);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [qrData, setQrData] = useState([]);
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);

  const { confirm } = useDialog();

  const isCheckingRef = useRef(false);

  const checkSession = async () => {
    if (isCheckingRef.current) return null;
    isCheckingRef.current = true;

    try {
      const response = await axios.get(
        `/messenger-bots/whatsapp/waha/${orgID}/session/`,
        {
          timeout: 2500,
        },
      );

      const sessionData = response.data;

      const isAuthenticated = sessionData?.status === "authenticated";
      const hasConnectedPhone = !!sessionData?.connected_phone;
      const hasWahaPhone = !!sessionData?.waha_status?.me?.id;
      const hasWahaError = sessionData?.waha_status?.status === "error";

      const isRealConnected =
        isAuthenticated && !hasWahaError && (hasConnectedPhone || hasWahaPhone);

      if (isRealConnected) {
        setSession(sessionData);
        setIsConnected(true);
        setQrCode(false);
        setIsWaitingForConnection(false);
        return true;
      }

      setSession(sessionData);
      setIsConnected(false);
      return false;
    } catch (error) {
      setSession(null);
      setIsConnected(false);
      return false;
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!isWaitingForConnection) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      const connected = await checkSession();

      if (connected && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWaitingForConnection, orgID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/messenger-bots/whatsapp/waha/${orgID}/`,
        );

        console.log(response, "whatsApp data");

        setData(response.data);
      } catch (error) {
        console.log("ERRORS FROM FETCH WHATSAPP DATA", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      setIsAiEnabled(data.is_ai_enabled);
    }
  }, [data]);

  const handleGenerateQr = async () => {
    try {
      setLoading(true);

      const deleteConfig = await axios.post(
        `/messenger-bots/whatsapp/waha/${orgID}/session/delete/`,
      );

      console.log("DELETE CONFIG", deleteConfig);

      const activeBot = await axios.post(
        `/messenger-bots/whatsapp/waha/${orgID}/`,
      );

      console.log("ACTIVE BOT", activeBot);

      const responseSession = await axios.post(
        `/messenger-bots/whatsapp/waha/${orgID}/session/`,
      );

      const qrCode = await axios.get(
        `/messenger-bots/whatsapp/waha/${orgID}/qr/`,
      );

      setQrData(qrCode.data);
      setIsWaitingForConnection(true);
      console.log("RESPONSE SESSION", qrCode);

      setQrCode(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (isAi) => {
    try {
      const { data } = await axios.patch(
        `/messenger-bots/whatsapp/waha/${orgID}/`,
        {
          is_ai_enabled: isAi,
        },
      );

      setIsAiEnabled(data?.is_ai_enabled);
    } catch (error) {}
  };

  const handleDisconnect = async () => {
    try {
      await confirm({
        title: translate("Отвязать номер", "waha.disconnectTitle"),
        description: (
          <>
            {translate(
              "Вы собираетесь отвязать номер WhatsApp, который используется AI-ассистентом.",
              "waha.disconnectDescription1",
            )}
            <br />
            {translate(
              "Вы сможете подключить этот или другой номер позже, повторно пройдя авторизацию через QR-код.",
              "waha.disconnectDescription2",
            )}
          </>
        ),
        confirmTitle: translate("Отвязать", "app.disconect"),
        cancelTitle: translate("Отмена", "app.cancellation"),
      });

      setLoading(true);

      await axios.post(
        `/messenger-bots/whatsapp/waha/${orgID}/session/delete/`,
      );

      setIsConnected(false);
      setSession(null);
      setQrCode(false);

      Notify.success({
        text: translate("WhatsApp отключен", "waha.disconnected"),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "";

    const clean = phone.replace("@c.us", "");

    return (
      "+" +
      clean.replace(/(\d{2,3})(\d{3})(\d{3})(\d{0,4})/, (m, a, b, c, d) =>
        [a, b, c, d].filter(Boolean).join(" "),
      )
    );
  };

  const phone = formatPhone(
    session?.connected_phone || session?.waha_status?.me?.id,
  );

  return (
    <>
      <MobileTopHeader
        title={translate("WhatsApp Ai настройки", "shop.whatsAppAi")}
        onBack={() => history.goBack()}
        onSubmit={() =>
          history.push(`/organizations/${orgID}/assistant?mode=edit`)
        }
        submitLabel={translate("Сохранить", "app.save")}
        onClick={() =>
          history.push(`/organizations/${orgID}/assistant?mode=edit`)
        }
        style={{
          marginBottom: "15px",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.25)",
          borderRadius: " 0 0 16px 16px",
        }}
      />

      <div className="container containerMax">
        <div className={classes.wrapper}>
          <div className={classes.toggleWrapper}>
            <div className={classNames(classes.toggleSwitch)}>
              <h2 className={classNames(classes.toggleSwitchText)}>
                <WhatsAppIcon />
                {translate("Статус WhatsApp Ai ", "app.whatsAppStatus")}
              </h2>
              <ToggleSwitch
                checked={isAiEnabled}
                onChange={() => handleStatus(!isAiEnabled)}
              />
            </div>

            <p className={classes.toggleDesc}>
              {translate(
                " Вы можете отключить WhatsApp Ai  Ассистента и самостоятельно отвечать за него, в другом случае он будет отвечать на все ваши чаты.",
                "desc.whatsApp1",
              )}
            </p>
          </div>

          <div className={classes.qrWrapper}>
            <div className={classes.qrGeneration}>
              {isConnected && (
                <div className={classes.connectedBlock}>
                  <ButtonWithContent
                    label={phone}
                    onClick={handleDisconnect}
                    children={loading ? <Loader /> : <DisconectWaha />}
                    content
                    radiusOrg={true}
                    backgroundRight={"#D72C20"}
                  />

                  <div style={{ paddingLeft: "8px" }}>
                    <h3 className={classes.ConnectText}>
                      {translate(
                        "Номер WhatsApp успешно подключён.",
                        "waha.connected",
                      )}
                    </h3>

                    <div
                      className={classes.qrDesc}
                      style={{ marginTop: "15px" }}
                    >
                      {translate(
                        "Теперь AI-ассистент может отправлять и принимать сообщения через этот номер.",
                        "whatsApp.qrDescConnect1",
                      )}
                    </div>
                    <div
                      className={classes.qrDesc}
                      style={{ marginTop: "10px" }}
                    >
                      {translate(
                        "Если потребуется, вы можете в любой момент отключить текущий номер и подключить другой, повторив процедуру авторизации через QR-код.",
                        "whatsApp.qrDescConnect2",
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isConnected && (
                <ButtonWithContent
                  content
                  className={classes.qrIcon}
                  radiusOrg={true}
                  children={loading ? <Loader /> : <QrIcon />}
                  onClick={handleGenerateQr}
                  label={translate("Генерация Qr Code", "app.generateWhatsQr")}
                />
              )}

              <div
                className={classNames(
                  classes.qrContainer,
                  qrCode && classes.qrContainerActive,
                )}
              >
                <div className={classes.qrInner}>
                  {qrCode && (
                    <>
                      <div className={classes.qrPreview}>
                        <QRCodeCanvas
                          value={qrData?.qr_code}
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: "10px",
                          }}
                        />
                      </div>

                      <div className={classes.qrDesc}>
                        {translate(
                          "Для подключения номера, с которого будет отвечать WhatsApp AI-ассистент, отсканируйте QR-код и подтвердите авторизацию.",
                          "whatsApp.qrDesc",
                        )}
                      </div>

                      <div className={classes.qrConnectRules}>
                        <ol className={classes.qrConnectWrapper}>
                          <li className={classes.qrConnectItem}>
                            {translate("Откройте WhatsApp", "waha.desc1")}
                          </li>
                          <li className={classes.qrConnectItem}>
                            {translate(
                              "Внизу нажмите Settings (Настройки)",
                              "waha.desc2",
                            )}
                          </li>
                          <li className={classes.qrConnectItem}>
                            {translate(
                              "Нажмите Linked Devices (Связанные устройства)",
                              "waha.desc3",
                            )}
                          </li>
                          <li className={classes.qrConnectItem}>
                            {translate("Дождитесь подтверждения", "waha.desc4")}
                          </li>
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={classes.noteWrapper}>
                <span className={classes.noteIcon}>
                  <NoteIcon />
                  {translate("Примечание", "printer.note")}
                </span>

                <p className={classes.noteText}>
                  {translate(
                    "WhatsApp AI-ассистент автоматически обрабатывает входящие сообщения клиентов, консультирует по товарам и услугам, отправляет ссылки, каталоги и помогает закрывать продажи 24/7. В разделе настроек вы можете обучить ассистента под ваш бизнес: загрузить информацию о компании, товары и услуги, задать сценарии ответов, правила коммуникации и логику продаж. Чем точнее вы настроите ассистента, тем эффективнее он будет работать и конвертировать чаты в сделки.",
                    "whatsApp.noteText",
                  )}
                </p>
              </div>

              <p className={classes.qrImportant}>
                <span className={classes.qrImportantFirst}>
                  {" "}
                  <ImportantIcon />{" "}
                  {translate("Важно", "usragr.section7.title")}
                </span>
                <span className={classes.qrImportantSecond}>
                  {translate(
                    "При смене контактного номера через QR-код история чатов сохраняется и остаётся привязанной к старому номеру телефона. Новый номер будет использоваться для дальнейшего общения, но переписка с предыдущего номера не переносится.",
                    "desc.whatsApp3New",
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppAiSettings;
