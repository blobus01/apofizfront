import React, { useEffect, useState } from "react";
import MobileSearchHeader from "@components/MobileSearchHeader";
import { translate } from "@locales/locales";
import AIIcon from "@ui/Icons/AIIcon";
import { Link } from "react-router-dom";
import Avatar from "@ui/Avatar";
import classNames from "classnames";
import { parseDateTime } from "@common/utils";
import MobileMenu from "@components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "@ui/RowButton";
import BlockedUsersIcon from "@ui/Icons/BlockedUsersIcon";
import SelectThemeIcon from "@ui/Icons/SelectThemeIcon";
import AIWithBadgeIcon from "@ui/Icons/AIWithBadgeIcon";
import useInfiniteScrollQuery from "@hooks/useInfiniteScrollQuery";
import { notifyQueryResult } from "@common/helpers";
import { getAssistantChats } from "@store/services/aiServices";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "@components/Preloader";
import useDebounce from "@hooks/useDebounce";
import { useOrganizationDetail } from "@hooks/queries/useOrganizationDetail";
import { toggleAssistant as toggleAssistantService } from "@store/services/aiServices";
import moment from "moment";
import AIAssistantToast from "@components/AiAssistantToast";
import classes from "./index.module.scss";
import ThemeMenu from "@pages/CommentsPage/ThemeMenu";
import {
  AiIconGrey,
  ApofizAi,
  HistoryPaymentsGrey,
  TelegramAi,
  TelegramIcon,
  ViberAi,
  WhatsappAi,
  WhatsAppIcon,
  WhatsAppProfile,
} from "./Icons";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";
import ScrollContainer from "react-indiana-drag-scroll";
import { useDispatch, useSelector } from "react-redux";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";

const OrganizationChatsPage = ({ history, match }) => {
  const { id: orgID, assistant: assistantID } = match.params;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeopen, setIsThemeOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 300);
  const dispatch = useDispatch();

  const {
    data: orgDetail,
    loading,
    set: setOrg,
  } = useOrganizationDetail(orgID);
  const isAssistantEnabled = orgDetail?.assistant?.is_enabled ?? false;
  const assistantActiveUntil = orgDetail?.assistant?.active_until;

  const {
    data: chats,
    next,
    hasMore,
  } = useInfiniteScrollQuery(
    ({ params }) =>
      notifyQueryResult(
        getAssistantChats(assistantID, { ...params, search: debounceSearch }),
      ),
    [assistantID, debounceSearch],
  );

  const toggleAssistant = async (is_enabled) => {
    setIsMenuOpen(false);
    setOrg((prevState) => ({
      ...prevState,
      assistant: {
        ...prevState.assistant,
        is_enabled: is_enabled,
      },
    }));
    return await notifyQueryResult(
      toggleAssistantService({
        assistant: assistantID,
        is_enabled,
      }),
    );
  };

  let daysLeft = null;

  if (assistantActiveUntil) {
    const futureDate = moment(assistantActiveUntil);
    const currentDate = moment();
    daysLeft = futureDate.diff(currentDate, "days");
  }

  // check with ssr localStorage

  const [mode, setMode] = useState(
    () => localStorage.getItem("mode") || "ApofizAi",
  );

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames(classes.chatsPage, {
        [classes.dark]: darkTheme,
      })}
    >
      <MobileSearchHeader
        title={translate("AI Ассистент", "org.aiAssistant")}
        onSearchChange={(e) => {
          setSearch(e.target.value);
        }}
        searchValue={search}
        onSearchCancel={() => setSearch("")}
        onBack={() => history.push(`/organizations/${orgID}`)}
        onMenu={toggleMenu}
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
      />

      <div className={classes.navContainer}>
        <ScrollContainer horizontal className={classes.nav}>
          <NavLink
            to="?mode=ApofizAi"
            onClick={() => setMode("ApofizAi")}
            className={classes.navLink}
            activeClassName={mode === "ApofizAi" ? classes.navLinkActive : ""}
          >
            <ApofizAi />
            Apofiz Ai
          </NavLink>

          <NavLink
            to="?mode=TelegramAi"
            onClick={() => setMode("TelegramAi")}
            className={classes.navLink}
            activeClassName={mode === "TelegramAi" ? classes.navLinkActive : ""}
          >
            <TelegramAi />
            Telegram Ai
          </NavLink>

          <NavLink
            to="?mode=WhatsappAi"
            onClick={() => setMode("WhatsappAi")}
            className={classes.navLink}
            activeClassName={mode === "WhatsappAi" ? classes.navLinkActive : ""}
          >
            <WhatsappAi />
            WhatsApp Ai
          </NavLink>

          {/* остальные пункты */}
        </ScrollContainer>
      </div>

      {!loading && mode === "ApofizAi" && (
        <Link
          to={`/organizations/${orgID}/assistant?mode=edit`}
          className={classes.createFolder}
        >
          <p className={classes.createFolderText}>
            {isAssistantEnabled !== null ? (
              daysLeft ? (
                <>
                  {translate(
                    "Осталось {days} дней работы AI Ассистента",
                    "org.aiAssistant.daysLeft",
                    { days: daysLeft },
                  )}
                </>
              ) : (
                translate(
                  "AI Ассистент завершил работу",
                  "org.aiAssistant.completed",
                )
              )
            ) : (
              translate("AI Ассистент отключен", "org.aiAssistant.disabled")
            )}
          </p>

          <div className={classes.createFolderRight}>
            <ViberAi />
          </div>
        </Link>
      )}

      {mode === "TelegramAi" && (
        <a
          href={orgDetail?.telegram_bot_url}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.createFolder}
        >
          <p className={classes.createFolderText}>
            {translate("Перейти в Telegram Ai", "aiAssistant.telegramAi")}
          </p>

          <div className={classes.createFolderRight}>
            <TelegramIcon />
          </div>
        </a>
      )}

      {mode === "WhatsappAi" && (
        <a href={orgDetail?.whatsApp_bot_url} className={classes.createFolder}>
          <p className={classes.createFolderText}>
            {translate("Перейти в WahatsApp Ai", "aiAssistant.whatsappAi")}
          </p>

          <div className={classes.createFolderRight}>
            <WhatsAppIcon />
          </div>
        </a>
      )}

      {mode === "ApofizAi" && (
        <>
          <InfiniteScroll
            dataLength={chats.length}
            next={next}
            hasMore={hasMore}
            className={classNames(classes.chats, "container containerMax")}
            loader={<Preloader />}
          >
            {chats
              .filter((chat) => chat.source === "web")
              .map((chat) => (
                <Chat
                  data={chat}
                  key={chat.id}
                  to={`/organizations/${orgID}/chat?user=${chat.user.id}&assistant=${assistantID}&chatIdReq=${chat.id}&ai=dis`}
                />
              ))}
          </InfiniteScroll>
        </>
      )}

      {mode === "TelegramAi" && (
        <>
          <InfiniteScroll
            dataLength={chats.length}
            next={next}
            hasMore={hasMore}
            className={classNames(classes.chats, "container containerMax")}
            loader={<Preloader />}
          >
            {chats
              .filter((chat) => chat.source === "telegram")
              .map((chat) => (
                <Chat
                  noAvatar={true}
                  data={chat}
                  key={chat.id}
                  to={`/organizations/${orgID}/chat?user=${chat.user.id}&assistant=${assistantID}&chatIdReq=${chat.id}&ai=active`}
                />
              ))}
          </InfiniteScroll>
        </>
      )}

      {mode === "WhatsappAi" && (
        <>
          <InfiniteScroll
            dataLength={chats.length}
            next={next}
            hasMore={hasMore}
            className={classNames(classes.chats, "container containerMax")}
            loader={<Preloader />}
          >
            {chats
              .filter((chat) => chat.source === "whatsapp")
              .map((chat) => (
                <Chat
                  whatsApp={true}
                  data={chat}
                  key={chat.id}
                  to={`/organizations/${orgID}/whatsApp?user=${chat.id}&assistant=${assistantID}&chatIdReq=${chat.id}&num=${chat.user.phone}`}
                />
              ))}
          </InfiniteScroll>
        </>
      )}

      <MobileMenu
        isOpen={isMenuOpen}
        onRequestClose={toggleMenu}
        contentLabel={translate("Настройки", "app.settings")}
      >
        {/* <RowButton
          label={translate(
            "Заблокированные пользователи",
            "comment.blockedUsers"
          )}
          type={ROW_BUTTON_TYPES.link}
          showArrow={false}
          to={`/organizations/${orgID}/followers?tab=blocked_users`}
        >
          <BlockedUsersIcon />
        </RowButton> */}
        <RowButton
          type={ROW_BUTTON_TYPES.link}
          label={translate("AI Ассистент настройки", "org.aiAssistantSettings")}
          showArrow={false}
          to={`/organizations/${orgID}/assistant?mode=edit`}
        >
          <AiIconGrey />
        </RowButton>

        {/* <RowButton
          label={translate("Выбрать тему", "comment.selectTheme")}
          type={ROW_BUTTON_TYPES.button}
          onClick={() => {
            setIsMenuOpen(false);
            setIsThemeOpen(true);
          }}
          className="post-comments-page__menu-btn"
          showArrow={false}
        >
          <SelectThemeIcon />
        </RowButton> */}

        <RowButton
          label={translate("История платежей", "app.history")}
          type={ROW_BUTTON_TYPES.button}
          onClick={() => {
            setIsMenuOpen(false);
            setIsThemeOpen(true);
          }}
          className="post-comments-page__menu-btn"
          showArrow={false}
        >
          <HistoryPaymentsGrey />
        </RowButton>

        {isAssistantEnabled ? (
          <RowButton
            label={translate(
              "Выключить AI Ассистента ",
              "org.aiAssistant.turnOff",
            )}
            showArrow={false}
            onClick={() => toggleAssistant(false)}
            className={"f-17"}
          >
            <AIWithBadgeIcon fill="#000" />
          </RowButton>
        ) : (
          <RowButton
            label={translate(
              "Включить AI Ассистента",
              "org.aiAssistant.turnOn",
            )}
            showArrow={false}
            onClick={() => toggleAssistant(true)}
            className={"f-17"}
          >
            <AIWithBadgeIcon fill="#000" badgeColor="#34A853" />
          </RowButton>
        )}
      </MobileMenu>
      <ThemeMenu
        isOpen={isThemeopen}
        onRequestClose={() => setIsThemeOpen(false)}
      />
    </div>
  );
};

const Chat = ({ data, className, noAvatar, whatsApp, ...props }) => {
  const result = data.user.full_name?.slice(0, 2);

  const date = new Date(data.last_message_created_at);

  const formattedDate = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatPhone = (phone) => {
    if (!phone) return "";

    const cleaned = phone.toString().replace(/\D/g, "");

    // ожидаем 12 цифр: 996703730720
    if (cleaned.length !== 12) return phone;

    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      9,
    )} ${cleaned.slice(9, 12)}`;
  };

  return (
    <Link className={classNames(classes.chat, className)} {...props}>
      <div className={classes.chatAvatarContainer}>
        {noAvatar ? (
          <div
            className={classes.telegramAvatar}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#007AFF",
            }}
          >
            <p>{result}</p>
          </div>
        ) : whatsApp ? (
          <div
            className={classes.telegramAvatar}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#27AE60",
            }}
          >
            <WhatsAppProfile />
          </div>
        ) : (
          <Avatar
            src={data.user.avatar?.small}
            alt={data.user.username}
            size={48}
          />
        )}

        {!!data.unread_messages_count && (
          <div className={classes.chatAvatarBadge}>
            {data.unread_messages_count > 99 ? 99 : data.unread_messages_count}
          </div>
        )}
      </div>

      <div className={classes.chatMain}>
        {whatsApp ? (
          <h2 className={classes.chatTitle}>{formatPhone(data.user.phone)}</h2>
        ) : (
          <h2 className={classes.chatTitle}>{data.user.full_name}</h2>
        )}
        <p className={classes.chatDesc}>{data.last_message}</p>
        {data.last_message_created_at && (
          <div style={{ display: "flex", gap: "5px" }}>
            <p className={classes.chatUpdatedAt}>{formattedDate}</p>
            <p className={classes.chatUpdatedAt} style={{ fontWeight: "600" }}>
              {formattedTime}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrganizationChatsPage;
