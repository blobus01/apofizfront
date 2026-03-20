import React, { Suspense, useEffect } from "react";
import { renderRoutes } from "react-router-config";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import qs from "qs";
import {
  createFCMToken,
  getNotificationsCount,
} from "./store/actions/notificationActions";
import { getAllCartsTotalCount } from "./store/actions/shopActions";
import { initializeFirebasePush } from "./firebase_init";
import { translate } from "./locales/locales";
import Navbar from "./containers/Navbar";
import Notify from "./components/Notification";
import PageHelmet from "./components/PageHelmet";
import { NOTIFICATION_TYPES } from "./components/Cards/NotificationCard/types";
import { ROUTES } from "./routes";
import { GlobalMenu } from "./components/GlobalMenu";
import { GlobalLayer } from "./components/GlobalLayer";
import LoadingWithTopHeader from "./components/LoadingWithTopHeader/LoadingWithTopHeader";
import SideScroller from "./components/SideScroller";
import { allowedRoutes } from "./routers/utils";
import { setPrevPath } from "./store/actions/userActions";
import { useLocation } from "react-router-dom";
import ChatMessageToast from "./components/ChatMessageToast";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const App = ({ history }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userStore.user);
  const token = useSelector((state) => state.userStore.token);
  const location = useLocation();
  const historyPath = useHistory();
  const darkTheme = useSelector((state) => state.theme.darkTheme);

  useEffect(() => {
    const query = qs.parse(history.location.search.replace("?", ""));
    const isWebviewMode = !!(query && query.mode === "webview");
    const isIosWebviewMode = !!(query && query.mode === "webview_ios");
    !token &&
      !isWebviewMode &&
      !isIosWebviewMode &&
      Notify.success({
        text: translate(
          "Скачайте приложение и Вам станут доступны горячие уведомления о новых скидках и возможностях",
          "notify.download",
        ),
      });
  }, [token, history.location.search]);

  useEffect(() => {
    if (user) {
      dispatch(getNotificationsCount());
      dispatch(getAllCartsTotalCount());
    }

    const loaderEl = document.getElementById("loader");
    loaderEl && loaderEl.remove();
  }, [user, dispatch]);

  useEffect(() => {
    initializeFirebasePush(onPushMessage);

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    !!token && void createFCMToken();
  }, [token]);

  useEffect(() => {
    // Сохраняем prevPath при переходе на /auth, если пользователь не авторизован
    if (location.pathname === "/auth" && !token) {
      // Сохраняем только если не с самой /auth
      const prevPath = location.state?.from || window.prevPath || null;
      // Если нет state.from, используем предыдущий путь из window (SPA workaround)
      if (!prevPath && window._lastPath && window._lastPath !== "/auth") {
        dispatch(setPrevPath(window._lastPath));
      } else if (prevPath && prevPath !== "/auth") {
        dispatch(setPrevPath(prevPath));
      }
    }
    // Сохраняем текущий путь для следующего перехода
    window._lastPath = location.pathname + location.search;
  }, [location, dispatch, token]);

  const handleResize = () => {
    let vh = window.innerHeight * 0.01;
    document.querySelector(":root").style.setProperty("--vh", `${vh}px`);
  };

  const onPushMessage = (payload) => {
    console.log(payload);

    const data = payload.data || {};
    if (data.chat_id) {
      // Не показываем toast, если пользователь на странице messenger
      // comment for test
      if (!window.location.pathname.includes("/messenger")) {
        const handleToastClick = () => {
          // Если есть chat_id, переводим на конкретный чат

          historyPath.push(`/messenger/`);
        };
        Notify.custom(
          <div onClick={handleToastClick} style={{ cursor: "pointer" }}>
            <ChatMessageToast
              avatar={data.icon || data.notification?.image}
              name={data.notification?.title || "Сообщение"}
              text={data.notification?.body || data.text || ""}
              time={new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>,
        );
      }
    } else if (
      data.type === NOTIFICATION_TYPES.requested_partnership_recipient &&
      Notify.partnershipRequest
    ) {
      Notify.partnershipRequest(payload);
    }
  };

  return (
    <>
      <PageHelmet />
      <Suspense fallback={<LoadingWithTopHeader />}>
        {renderRoutes(allowedRoutes(ROUTES, token, user), { user })}
      </Suspense>
      <Navbar user={user} />
      <GlobalMenu />
      <GlobalLayer />
      <ToastContainer />
      <SideScroller />
    </>
  );
};

export default App;
