import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import {
  blockCommentsUser,
  clearCreateCommentSuccess,
  clearReplyComment,
  createPostComment,
  createPostCommentSuccess,
  getComments,
  getPost,
  hideComment,
  setPostDetail,
  unblockCommentsUser,
  updateComment as updateCommentAction,
} from "../../store/actions/postActions";
import { translate } from "@locales/locales";
import { notifyQueryResult } from "@common/helpers";
import { DEFAULT_LIMIT } from "@common/constants";
import MobileTopHeader from "../../components/MobileTopHeader";
import Preloader from "../../components/Preloader";
import Comment from "../../components/Comment";
import ReplyComment from "../../components/ReplyComment";
import CommentForm from "../../components/Forms/CommentForm";
import { setGlobalMenu } from "@store/actions/commonActions";
import { MENU_TYPES } from "@components/GlobalMenu";
import {
  reportComment,
  toggleComments,
  updateComment as updateCommentService,
} from "../../store/services/postServices";
import Notify from "../../components/Notification";
import { blockUser, unblockUser } from "@store/services/organizationServices";
import useDialog from "../../components/UI/Dialog/useDialog";
import classNames from "classnames";
import { EditIcon, ReplyIcon } from "@components/Comment/icons";
import MobileMenu from "@components/MobileMenu";
import RowButton, { ROW_BUTTON_TYPES } from "@ui/RowButton";
import ThemeMenu from "@pages/CommentsPage/ThemeMenu";
import COMMENT_THEMES from "@pages/CommentsPage/themes";
import useIsScrolling from "@hooks/useIsScrolling";
import BlockedUsersIcon from "@ui/Icons/BlockedUsersIcon";
import SelectThemeIcon from "@ui/Icons/SelectThemeIcon";
import useSearchParam from "@hooks/useSearchParam";
import {
  changeAssistantChatStatus,
  getChat,
  readChatMessages,
} from "@store/services/aiServices";
import WideButton, { WIDE_BUTTON_VARIANTS } from "@ui/WideButton";
import AIIcon from "@ui/Icons/AIIcon";
import AIAssistantToast from "@components/AiAssistantToast";
import AssistantTypingAnimation from "@pages/CommentsPage/AssistantTypingAnimation";
import useChatSocket from "@pages/CommentsPage/useChatSocket";
import { ERROR_MESSAGES } from "@common/messages";
import "./index.scss";
import Avatar from "@components/UI/Avatar";
import OrgAvatar from "@components/UI/OrgAvatar";
import { setCommentsChatId } from "@store/actions/commentsAction";

import axios from "axios-api";
import { setSearchState } from "@store/actions/userActions";

const MENUS = {
  main: "main",
  themes: "themes",
};

const CommentsWhatsApp = ({ match, isChat = false, history }) => {
  const postID = match.params.id;

  const [chat, setChat] = useState(match.params.id);

  const [assistantID] = useSearchParam("assistant");
  const [userID] = useSearchParam("user");
  const [chatIdReq] = useSearchParam("chatIdReq");
  const [num] = useSearchParam("num");

  const [chatScrollableTarget, setChatScrollTarget] = useState(null);

  const user = useSelector((state) => state.userStore.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (chatIdReq !== null) {
      axios.post(`/organizations/assistant/chat/${chatIdReq}/read_messages/`);
    }
  }, []);

  const { data: comments, loading } = useSelector(
    (state) => state.postStore.postComments,
  );

  const userData = comments?.list.find((comment) => comment.user !== null);

  const {
    wallpapers,
    organization: commentsOrg,
    chat: storeChat,
  } = comments ?? {};

  // const chatByOrgUser =
  //   ai === "active" ? false : (chat?.chat_by_org_user ?? true);

  // const isMyChat = ai === "active" ? false : (chat?.is_my_chat ?? false);

  const chatID = chat?.id;

  useEffect(() => {
    dispatch(setCommentsChatId(chatID));
  }, []);

  const { data: postDetail } = useSelector(
    (state) => state.postStore.postDetail,
  );

  const { id: currentUserID } = useSelector((state) => state.userStore.user);

  const { success: isCreateCommentSuccess, loading: loadingCreateComment } =
    useSelector((state) => state.postStore.createComment);

  const canComment = postDetail?.can_comment ?? storeChat?.can_comment;

  const isCommentsDisabled = isChat
    ? false
    : !!postDetail?.is_comments_disabled;
  const organization = isChat ? commentsOrg : postDetail?.organization;

  const chatOrItemID = isChat ? chatID : postID;

  const isScrolling = useIsScrolling(chatScrollableTarget);

  const commentInput = useRef(null);

  const [params, setParams] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
  });

  const [isScroll, setIsScroll] = useState(false);

  const [openedMenu, setOpenedMenu] = useState(null);

  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const [isChatLoading, setIsChatLoading] = useState(isChat);

  const messagesPaddingBottom = isChat ? 300 : 200;

  const canEdit =
    organization?.permissions.is_owner ||
    organization?.permissions.can_edit_organization;

  const chatSocket = useChatSocket(chatOrItemID, {
    connect: isChat || (!isChat && canComment), // Connect for both chat and comments
    isChat,
  });

  const fetchInitialData = useCallback(async () => {
    const limit = params.limit;
    if (!isChat) {
      dispatch(getPost(postID));
      return dispatch(getComments(postID, { limit }));
    }

    const chatRes = await notifyQueryResult(
      getChat({
        assistant: assistantID,
        user: userID ?? user?.id,
      }),
    );

    if (!chatRes?.success || !chatRes?.data) {
      setIsChatLoading(false);
      return;
    }

    const chatID = chatIdReq ?? chatRes.data.id;

    setChat(chatRes.data);

    if (chatID) {
      dispatch(getComments(chatID, { limit }, false, isChat));
    }

    setIsChatLoading(false);
  }, [params.limit, isChat, assistantID, userID, user?.id, dispatch, postID]);

  const readChat = useCallback(() => {
    if (chatIdReq) {
      readChatMessages(chatIdReq).catch((e) => console.error(e));
    }
  }, [chatIdReq]);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowX = "unset";
      document.body.style.overflowY = "unset";
    };
  }, []);

  // Скролл вниз только при первом появлении комментариев
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (comments && comments.list.length > 0 && isFirstRender.current) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
      isFirstRender.current = false;
    }
  }, [comments]);

  // Скролл вниз после успешного создания комментария
  useEffect(() => {
    if (isCreateCommentSuccess) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
    }
  }, [isCreateCommentSuccess]);

  useEffect(() => {
    dispatch(setSearchState(true));
  }, []);

  useEffect(() => {
    void fetchInitialData();

    return () => {
      dispatch(clearReplyComment());
    };
  }, [dispatch, fetchInitialData]);

  useEffect(() => {
    chatSocket.onMessage((e) => {
      try {
        const newMessage = JSON.parse(e.data);
        const isAssistant = !!newMessage.assistant;
        const isOrg = !!newMessage.organization;

        if (isAssistant || isOrg) {
          setIsAssistantTyping(false);
        }

        dispatch(createPostCommentSuccess(newMessage));

        const scrollContainer = document.getElementById("page-wrap");

        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: "auto" });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }, [chatSocket, dispatch]);

  useEffect(() => {
    if (isCreateCommentSuccess && comments) {
      const newComment = document.querySelector(
        ".post-comments-page__infinite-scroll",
      ).children[0];
      newComment.classList.add("post-comments-page__create-comment-success");

      setTimeout(() => {
        newComment.classList.remove(
          "post-comments-page__create-comment-success",
        );
        dispatch(clearCreateCommentSuccess());
      }, 800);
    }
  }, [isCreateCommentSuccess, comments, dispatch]);

  useEffect(() => {
    if (isChat) void readChat();

    return () => {
      if (isChat) void readChat();
    };
  }, [isChat, readChat]);

  const feedUpdater = () => {
    if (document.activeElement === commentInput.current) {
      commentInput.current.blur();
    }
  };

  const getNext = async (totalPages) => {
    if (params.page < totalPages) {
      const nextPage = params.page + 1;
      setIsScroll(true);
      const oldHeight = document.documentElement.scrollHeight;
      const oldScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      await dispatch(
        getComments(
          chatIdReq || chatOrItemID,
          { ...params, page: nextPage },
          true,
          isChat,
        ),
      );
      requestAnimationFrame(() => {
        const newHeight = document.documentElement.scrollHeight;
        const heightDiff = newHeight - oldHeight;
        window.scrollTo(0, oldScrollTop + heightDiff);
      });
      setIsScroll(false);
      return setParams((prev) => ({ ...prev, hasMore: true, page: nextPage }));
    }

    setParams((prev) => ({ ...prev, hasMore: false }));
  };

  const themeObject =
    COMMENT_THEMES.find((t) => t.id === wallpapers?.theme_id) ?? null;

  const wrapperStyle = {
    "--background-image": themeObject
      ? `url(${themeObject.url}), url(${themeObject.bgUrl})`
      : wallpapers
        ? `url(${wallpapers.svg_pattern}), url(${wallpapers.svg_background})`
        : "unset",
    "--background-size": "375px 812px, cover",
    "--background-repeat": "repeat, no-repeat",
  };

  if (wallpapers?.theme_type === "custom" && wallpapers?.theme_id === null) {
    wrapperStyle["--background-image"] = `url(${wallpapers.image?.file})`;
    wrapperStyle["--background-size"] = "cover";
    wrapperStyle["--background-repeat"] = "no-repeat";
    wrapperStyle["--background-position"] = "center";
  }

  if (isChatLoading) {
    return <Preloader style={{ marginTop: 16 }} />;
  }

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
    <div className="post-comments-page commentsPage">
      <MobileTopHeader
        onBack={() => {
          if (history.location.isPrevPathNotify) {
            history.push({
              pathname: `/p/${postID}`,
              isPrevPathNotify: history.location.isPrevPathNotify,
            });
            return;
          }

          // changes for userName

          dispatch(setSearchState(false));
          // Настройки вацап AI, Настройки телеграмм AI

          history.goBack();
        }}
        whatsTitle={formatPhone(num)}
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(4px)",
        }}
        className="post-comments-page__top-header"
        onMenu={() => setOpenedMenu(MENUS.main)}
      />

      {isChat && !chat?.assistant?.is_enabled && (
        <AIAssistantToast disabled className="post-comments-page__toast" />
      )}

      {params.page === 1 && loading && !isScroll ? (
        <Preloader style={{ marginTop: 16 }} />
      ) : (
        comments &&
        (!isChat || chatID !== setChat?.id) && (
          <div
            className={classNames(
              "container post-comments-page__wrap",
              "post-comments-page__wrap--inverse",
            )}
            id="page-wrap"
            ref={setChatScrollTarget}
            style={wrapperStyle}
          >
            <div
              className="post-comments-page__content-wrap"
              style={{ paddingBottom: messagesPaddingBottom }}
            >
              <div
                className="post-comments-page__content"
                onTouchMove={feedUpdater}
              >
                <InfiniteScroll
                  dataLength={Number(comments.list.length) || 0}
                  next={() => getNext(comments.total_pages)}
                  hasMore={params.hasMore}
                  className="post-comments-page__infinite-scroll post-comments-page__infinite-scroll--inverse"
                  loader={null}
                  inverse={true}
                  scrollableTarget={"page-wrap"}
                >
                  {comments.list.map((comment) => {
                    const { id, user } = comment;
                    const userID = comment.user?.id;
                    const isMyMessage = userID === currentUserID;
                    return (
                      <Comment
                        key={comment.id}
                        userData={userData}
                        comment={comment}
                        whatsApp={true}
                        source={comments?.source}
                        // disabled={
                        //   !canComment ||
                        //   isCommentsDisabled ||
                        //   isScrolling ||
                        //   (!chatByOrgUser && canEdit)
                        // }
                        noDots={assistantID}
                        className={`post-comments-page__comment ${
                          isMyMessage ? "comment--right" : "comment--left"
                        }`}
                      />
                    );
                  })}

                  {isScroll && loading && <Preloader />}
                </InfiniteScroll>
              </div>
            </div>

            <div className={classNames("post-comments-page__controls")}>
              {isAssistantTyping && (
                <AssistantTypingAnimation
                  className="container"
                  style={{ marginBottom: 10 }}
                />
              )}

              <div
                className={classNames(
                  "post-comments-page__form-wrap",
                  (!canComment || isCommentsDisabled) &&
                    "post-comments-page__form-wrap--disabled",
                )}
              >
                <div className="post-comments-page__ai-note">
                  <div className="post-comments-page__ai-note-icon-container">
                    <AIIcon className="post-comments-page__ai-note-icon" />
                  </div>
                  <p>
                    {translate(
                      "AI Ассистент ведет переписку автоматически",
                      "org.aiAssistant.returnChatNote",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      <MobileMenu
        isOpen={openedMenu === MENUS.main}
        contentLabel={translate("Настройки", "app.settings")}
        onRequestClose={() => setOpenedMenu(null)}
      >
        <RowButton
          label={translate("Выбрать тему", "comment.selectTheme")}
          type={ROW_BUTTON_TYPES.button}
          onClick={() => setOpenedMenu(MENUS.themes)}
          className="post-comments-page__menu-btn"
          showArrow={false}
        >
          <SelectThemeIcon />
        </RowButton>
      </MobileMenu>

      <ThemeMenu
        isOpen={openedMenu === MENUS.themes}
        chatID={chatIdReq}
        chatIdReq={chatIdReq}
        onRequestClose={() => setOpenedMenu(null)}
      />
    </div>
  );
};

export default CommentsWhatsApp;
