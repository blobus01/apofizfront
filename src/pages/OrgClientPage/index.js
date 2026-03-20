import React, { useEffect } from "react";
import * as qs from "qs";
import { useDispatch, useSelector } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import RowButton, { ROW_BUTTON_TYPES } from "../../components/UI/RowButton";
import useDialog from "../../components/UI/Dialog/useDialog";
import {
  InsightIcon,
  SaleIcon,
  UnsubscribeIcon,
} from "../../components/UI/Icons";
import LoadingWithTopHeader from "../../components/LoadingWithTopHeader/LoadingWithTopHeader";
import { canGoBack } from "../../common/helpers";
import {
  clearOrgClientDetails,
  getOrganizationClientDetails,
  getOrganizationFollowerDetails,
  sendCancelRequestFollower,
  setOrgClientDetails,
} from "../../store/actions/organizationActions";
import { translate } from "../../locales/locales";
import { blockUser, unblockUser } from "@store/services/organizationServices";
import Notify from "@components/Notification";
import {
  GiveAccessIcon,
  RestrictedAccessIcon,
} from "@components/Comment/icons";
import "./index.scss";
import { setDarkThemeRT } from "@store/actions/themeDark";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import classNames from "classnames";

const CLIENT_TYPES = {
  client: "client",
  follower: "follower",
};

const OrgClientPage = ({ match, history, location }) => {
  const dispatch = useDispatch();
  const { confirm, alert } = useDialog();

  const { data: client, loading } = useSelector(
    (state) => state.organizationStore.orgClientDetails,
  );

  const orgID = match.params.orgID;
  const userID = match.params.userID;

  useEffect(() => {
    const source = qs.parse(location.search.replace("?", "")).src;

    if ([CLIENT_TYPES.client, CLIENT_TYPES.follower].includes(source)) {
      if (source === CLIENT_TYPES.client) {
        dispatch(getOrganizationClientDetails(orgID, userID));
      } else {
        dispatch(getOrganizationFollowerDetails(orgID, userID));
      }
    }

    return () => {
      dispatch(clearOrgClientDetails());
    };
  }, [dispatch, location.search, orgID, userID]);

  const handleBlock = async () => {
    try {
      await blockUser(client.id, orgID);
      alert({
        title: translate("Ограничить доступ", "app.restrictAccess"),
        description: translate(
          "Новые комментарии {userFullName} к вашей организации будут ограничен,  Вы сможете разблокировать доступ к комментариям в меню сообщений данного пользователя.",
          "dialog.restrictAccessDescription",
          { userFullName: client.full_name },
        ),
      });
      dispatch(
        setOrgClientDetails({
          is_blocked: true,
        }),
      );
    } catch (e) {
      Notify.error({
        text: e.message,
      });
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(client.id, orgID);
      Notify.success({
        text: translate(
          "Пользователь успешно разблокирован",
          "notify.unblockUserSuccess",
        ),
      });
      dispatch(
        setOrgClientDetails({
          is_blocked: false,
        }),
      );
    } catch (e) {
      Notify.error({
        text: e.message,
      });
    }
  };

  const showDialog = async () => {
    try {
      await confirm({
        title: translate("Отменить подписку", "org.cancelSubscription"),
        description: translate(
          "Вы действительно хотите отменить подписку данному пользователю, Ваши товарами и посты перестанут быть доступными на ленте подписок.",
          "org.cancelSubscriptionDesc",
        ),
        confirmTitle: translate("Продолжить", "app.continue"),
        cancelTitle: translate("Отмена", "app.cancellation"),
      });

      dispatch(sendCancelRequestFollower(orgID, userID));
      canGoBack(history)
        ? history.goBack()
        : history.push(`/organizations/${orgID}`);
    } catch (e) {
      // do nothing
    }
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("org-client-page", {
        dark: darkTheme,
      })}
    >
      {loading ? (
        <LoadingWithTopHeader />
      ) : (
        client && (
          <>
            <MobileTopHeader
              darkTheme={darkTheme}
              style={{ background: darkTheme ? "#090027" : "", borderRadius: "0 0 12px 12px" }}
              renderRight={() => (
                <span
                  style={{ marginLeft: "20px" }}
                  className="theme-toggle"
                  onClick={() => dispatch(setDarkThemeRT(!darkTheme))}
                >
                  <div
                    key={darkTheme ? "dark" : "light"}
                    className="theme-toggle__icon"
                  >
                    {darkTheme ? <DarkTheme /> : <LightTheme />}
                  </div>
                </span>
              )}
              onBack={() =>
                canGoBack(history)
                  ? history.goBack()
                  : history.push(`/organizations/${orgID}`)
              }
              title={client.full_name ? client.full_name : "Клиент"}
            />

            <div className="org-client-page__content">
              <div className="container">
                <div className="org-client-page__avatar">
                  <img
                    src={client.avatar && client.avatar.large}
                    alt={client.full_name}
                    className="org-client-page__avatar-img"
                  />
                </div>

                <div className="org-client-page__info">
                  <div className="org-client-page__info-id f-14 f-600">
                    ID {client.id}
                  </div>
                  <div className="org-client-page__info-name f-17 f-600">
                    {client.full_name}
                  </div>
                  <div className="org-client-page__info-role f-16 f-600">
                    {client.role ? client.role : "Клиент"}
                  </div>
                  {client.phone_number && !client.is_blocked && (
                    <a
                      href={`tel:${client.phone_number}`}
                      className="org-client-page__info-phone f-14 f-600"
                    >
                      {client.phone_number}
                    </a>
                  )}
                </div>

                <div className="org-client-page__links">
                  <RowButton
                    type={ROW_BUTTON_TYPES.link}
                    label={translate(
                      "Статистика посещений",
                      "employee.attendanceStatistics",
                    )}
                    to={`/organizations/${orgID}/client/${userID}/attendance`}
                  >
                    <InsightIcon />
                  </RowButton>
                  <RowButton
                    to={`/organizations/${orgID}/receipts-of/${userID}`}
                    label={translate("Все чеки", "receipts.all")}
                    type={ROW_BUTTON_TYPES.link}
                  >
                    <SaleIcon />
                  </RowButton>
                  {client.is_blocked ? (
                    <RowButton
                      onClick={handleUnblock}
                      label={translate("Вернуть доступ", "app.returnAccess")}
                      className="org-client-page__unblock-user"
                    >
                      <GiveAccessIcon fill="#D72C20" />
                    </RowButton>
                  ) : (
                    <RowButton
                      onClick={handleBlock}
                      label={translate(
                        "Ограничить доступ",
                        "app.restrictAccess",
                      )}
                      className="org-client-page__block-user"
                    >
                      <RestrictedAccessIcon fill="#D72C20" />
                    </RowButton>
                  )}
                </div>
              </div>
            </div>
            {(client.is_subscribed === "subscribed" ||
              client.is_subscribed === "pending") && (
              <div className="org-client-page__footer">
                <div className="container">
                  <RowButton
                    label={translate(
                      "Отменить подписку",
                      "org.cancelSubscription",
                    )}
                    className="org-client-page__unsubscribe-btn f-17"
                    onClick={() => showDialog()}
                    showArrow={false}
                  >
                    <UnsubscribeIcon fill="#D72C20" />
                  </RowButton>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default OrgClientPage;
