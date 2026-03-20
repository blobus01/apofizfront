// import React, { useCallback, useEffect, useRef, useState } from "react";
// import InfiniteScroll from "react-infinite-scroll-component";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   blockCommentsUser,
//   clearCreateCommentSuccess,
//   clearReplyComment,
//   createPostComment,
//   createPostCommentSuccess,
//   getComments,
//   getPost,
//   hideComment,
//   setPostDetail,
//   unblockCommentsUser,
//   updateComment as updateCommentAction,
// } from "../../store/actions/postActions";
// import { translate } from "@locales/locales";
// import { notifyQueryResult } from "@common/helpers";
// import { DEFAULT_LIMIT } from "@common/constants";
// import MobileTopHeader from "../../components/MobileTopHeader";
// import Preloader from "../../components/Preloader";
// import Comment from "../../components/Comment";
// import ReplyComment from "../../components/ReplyComment";
// import CommentForm from "../../components/Forms/CommentForm";
// import { setGlobalMenu } from "@store/actions/commonActions";
// import { MENU_TYPES } from "@components/GlobalMenu";
// import {
//   reportComment,
//   toggleComments,
//   updateComment as updateCommentService,
// } from "../../store/services/postServices";
// import Notify from "../../components/Notification";
// import { blockUser, unblockUser } from "@store/services/organizationServices";
// import useDialog from "../../components/UI/Dialog/useDialog";
// import classNames from "classnames";
// import { EditIcon, ReplyIcon } from "@components/Comment/icons";
// import MobileMenu from "@components/MobileMenu";
// import RowButton, { ROW_BUTTON_TYPES } from "@ui/RowButton";
// import ThemeMenu from "@pages/CommentsPage/ThemeMenu";
// import COMMENT_THEMES from "@pages/CommentsPage/themes";
// import useIsScrolling from "@hooks/useIsScrolling";
// import BlockedUsersIcon from "@ui/Icons/BlockedUsersIcon";
// import SelectThemeIcon from "@ui/Icons/SelectThemeIcon";
// import useSearchParam from "@hooks/useSearchParam";
// import {
//   changeAssistantChatStatus,
//   getChat,
//   readChatMessages,
// } from "@store/services/aiServices";
// import WideButton, { WIDE_BUTTON_VARIANTS } from "@ui/WideButton";
// import AIIcon from "@ui/Icons/AIIcon";
// import AIAssistantToast from "@components/AiAssistantToast";
// import AssistantTypingAnimation from "@pages/CommentsPage/AssistantTypingAnimation";
// import useChatSocket from "@pages/CommentsPage/useChatSocket";
// import { ERROR_MESSAGES } from "@common/messages";
// import "./index.scss";
// import Avatar from "@components/UI/Avatar";
// import OrgAvatar from "@components/UI/OrgAvatar";
// import { setCommentsChatId } from "@store/actions/commentsAction";

// import axios from "axios-api";
// import { MenuDots, PhoneCallIcon } from "@components/UI/Icons";
// import { PhoneCall } from "./icons";
// import CallAnimation from "./CallAnimation";

// const MENUS = {
//   main: "main",
//   themes: "themes",
// };

// const CommentsPage = ({ match, isChat = false, history }) => {
//   const postID = match.params.id;

//   const [chat, setChat] = useState(match.params.id);

//   const [assistantID] = useSearchParam("assistant");
//   const [userID] = useSearchParam("user");
//   const [chatIdReq] = useSearchParam("chatIdReq");
//   const [ai] = useSearchParam("ai");

//   const [chatScrollableTarget, setChatScrollTarget] = useState(null);

//   const user = useSelector((state) => state.userStore.user);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (chatIdReq !== null) {
//       axios.post(`/organizations/assistant/chat/${chatIdReq}/read_messages/`);
//     }
//   }, []);

//   const { data: comments, loading } = useSelector(
//     (state) => state.postStore.postComments,
//   );

//   const userData = comments?.list.find((comment) => comment?.user !== null);
//   const {
//     wallpapers,
//     organization: commentsOrg,
//     chat: storeChat,
//   } = comments ?? {};

//   const chatByOrgUser =
//     ai === "active" ? false : (chat?.chat_by_org_user ?? true);

//   const isMyChat = ai === "active" ? false : (chat?.is_my_chat ?? false);

//   const chatID = chat?.id;

//   useEffect(() => {
//     dispatch(setCommentsChatId(chatID));
//   }, []);

//   const { data: postDetail } = useSelector(
//     (state) => state.postStore.postDetail,
//   );

//   const { id: currentUserID } = useSelector((state) => state.userStore.user);
//   const { replyCurrentComment } = useSelector((state) => state.postStore);
//   const { success: isCreateCommentSuccess, loading: loadingCreateComment } =
//     useSelector((state) => state.postStore.createComment);

//   const canComment = postDetail?.can_comment ?? storeChat?.can_comment;

//   const isCommentsDisabled = isChat
//     ? false
//     : !!postDetail?.is_comments_disabled;
//   const organization = isChat ? commentsOrg : postDetail?.organization;

//   const chatOrItemID = isChat ? chatID : postID;

//   const isScrolling = useIsScrolling(chatScrollableTarget);

//   const commentInput = useRef(null);

//   const { alert } = useDialog();

//   const [params, setParams] = useState({
//     page: 1,
//     limit: DEFAULT_LIMIT,
//     hasMore: true,
//   });

//   const [editingComment, setEditingComment] = useState(null);

//   const [isScroll, setIsScroll] = useState(false);

//   const [openedMenu, setOpenedMenu] = useState(null);

//   const [isTogglingComments, setIsTogglingComments] = useState(false);

//   const [isAssistantTyping, setIsAssistantTyping] = useState(false);

//   const [isChatLoading, setIsChatLoading] = useState(isChat);

//   const [isCall, setIsCall] = useState(false);

//   const lastAudioTsRef = useRef(Date.now());
//   const commitTimeoutRef = useRef(null);

//   const audioCtxRef = useRef(null);
//   const micStreamRef = useRef(null);
//   const processorRef = useRef(null);

//   const [isRinging, setIsRinging] = useState(false);
//   const [callTime, setCallTime] = useState(0);

//   const wsRef = useRef(null);

//   let timerInterval;

//   const startTimer = () => {
//     timerInterval = setInterval(() => {
//       setCallTime((t) => t + 1);
//     }, 1000);
//   };

//   const stopTimer = () => {
//     clearInterval(timerInterval);
//     setCallTime(0);
//   };

//   const base64ToInt16Array = (base64) => {
//     const binaryString = atob(base64);
//     const len = binaryString.length;
//     const bytes = new Uint8Array(len);

//     for (let i = 0; i < len; i++) {
//       bytes[i] = binaryString.charCodeAt(i);
//     }

//     return new Int16Array(bytes.buffer);
//   };

//   const downsampleTo16k = (buffer, inputSampleRate) => {
//     const outputSampleRate = 16000;
//     if (inputSampleRate === outputSampleRate) {
//       return buffer;
//     }

//     const ratio = inputSampleRate / outputSampleRate;
//     const newLength = Math.round(buffer.length / ratio);
//     const result = new Int16Array(newLength);

//     let offsetResult = 0;
//     let offsetBuffer = 0;

//     while (offsetResult < result.length) {
//       const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
//       let sum = 0;
//       let count = 0;

//       for (
//         let i = offsetBuffer;
//         i < nextOffsetBuffer && i < buffer.length;
//         i++
//       ) {
//         sum += buffer[i];
//         count++;
//       }

//       const sample = sum / count;
//       result[offsetResult] = Math.max(-1, Math.min(1, sample)) * 0x7fff;

//       offsetResult++;
//       offsetBuffer = nextOffsetBuffer;
//     }

//     return result;
//   };

//   const startMic = async () => {
//     micStreamRef.current = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//     });

//     const source = audioCtxRef.current.createMediaStreamSource(
//       micStreamRef.current,
//     );

//     processorRef.current = audioCtxRef.current.createScriptProcessor(
//       4096,
//       1,
//       1,
//     );

//     source.connect(processorRef.current);

//     // 🔴 ВАЖНО — без этого onaudioprocess НЕ ВЫЗЫВАЕТСЯ
//     const silentGain = audioCtxRef.current.createGain();
//     silentGain.gain.value = 0;
//     processorRef.current.connect(silentGain);
//     silentGain.connect(audioCtxRef.current.destination);

//     processorRef.current.onaudioprocess = (e) => {
//       if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

//       const input = e.inputBuffer.getChannelData(0);
//       const pcm16 = downsampleTo16k(input, audioCtxRef.current.sampleRate);

//       wsRef.current.send(
//         JSON.stringify({
//           type: "input_audio_buffer.append",
//           audio: Array.from(pcm16),
//         }),
//       );

//       lastAudioTsRef.current = Date.now();

//       if (commitTimeoutRef.current) {
//         clearTimeout(commitTimeoutRef.current);
//       }

//       commitTimeoutRef.current = setTimeout(() => {
//         wsRef.current?.send(
//           JSON.stringify({ type: "input_audio_buffer.commit" }),
//         );
//         console.log("🎤 input committed");
//       }, 700); // 700мс тишины
//     };
//   };

//   const playAIAudio = (pcm16) => {
//     if (!audioCtxRef.current) return;

//     const audioBuffer = audioCtxRef.current.createBuffer(
//       1,
//       pcm16.length,
//       16000,
//     );

//     const channelData = audioBuffer.getChannelData(0);

//     for (let i = 0; i < pcm16.length; i++) {
//       channelData[i] = pcm16[i] / 32768;
//     }

//     const source = audioCtxRef.current.createBufferSource();
//     source.buffer = audioBuffer;
//     source.connect(audioCtxRef.current.destination);
//     source.start();
//   };

//   const handleAIMessage = (e) => {
//     if (typeof e.data !== "string") return;

//     const msg = JSON.parse(e.data);

//     // INIT
//     if (msg.type === "conversation_initiation_metadata") {
//       wsRef.current.send(JSON.stringify({ type: "conversation.start" }));
//       startMic();
//       return;
//     }

//     // 🔊 AUDIO FROM AI (BASE64)
//     if (msg.audio_event?.audio_base_64) {
//       const pcm16 = base64ToInt16Array(msg.audio_event.audio_base_64);
//       playAIAudio(pcm16);
//       return;
//     }

//     // TEXT (optional)
//     if (msg.type === "agent_response") {
//       console.log("🧠 AI text:", msg.agent_response_event.agent_response);
//     }
//   };

//   const handleCall = async () => {
//     // ИСПРАВЛЕНИЕ: Создаем новый контекст, если старого нет ИЛИ он закрыт
//     if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
//       audioCtxRef.current = new (
//         window.AudioContext || window.webkitAudioContext
//       )();
//     }

//     // Если контекст "спит" (браузер остановил его), будим его
//     if (audioCtxRef.current.state === "suspended") {
//       await audioCtxRef.current.resume();
//     }

//     try {
//       setIsCall(true);
//       setIsRinging(true);

//       const { data } = await axios.get(`chat/${chatID}/call-ai/`);
//       wsRef.current = new WebSocket(data.signed_url);
//       wsRef.current.binaryType = "arraybuffer";

//       wsRef.current.onopen = () => {
//         console.log("✅ WS connected");
//         startTimer();
//       };

//       wsRef.current.onmessage = handleAIMessage;

//       wsRef.current.onerror = (e) => {
//         console.error("WS error", e);
//         stopCall();
//       };

//       // ❗ НИКАКОГО stopCall В onclose
//       wsRef.current.onclose = (e) => {
//         console.log("WS closed", e.code, e.reason);
//       };
//     } catch (e) {
//       console.error(e);
//       stopCall();
//     }
//   };

//   const stopCall = () => {
//     console.log("🛑 stopCall");

//     if (wsRef.current) {
//       wsRef.current.onclose = null;
//       wsRef.current.onerror = null;
//       wsRef.current.close();
//       wsRef.current = null;
//     }

//     if (processorRef.current) {
//       processorRef.current.disconnect();
//       processorRef.current.onaudioprocess = null;
//       processorRef.current = null;
//     }

//     if (micStreamRef.current) {
//       micStreamRef.current.getTracks().forEach((t) => t.stop());
//       micStreamRef.current = null;
//     }

//     if (audioCtxRef.current) {
//       audioCtxRef.current.close().catch(() => {});
//       audioCtxRef.current = null;
//     }

//     stopTimer();
//     setIsCall(false);
//     setIsRinging(false);
//   };

//   const formatTime = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   // const ringAudio = useRef(new Audio("./"));
//   // const endAudio = useRef(new Audio("/sounds/end.mp3"));

//   const messagesPaddingBottom = isChat ? 300 : 200;

//   const canEdit =
//     organization?.permissions.is_owner ||
//     organization?.permissions.can_edit_organization;

//   const isAssistantWorking = isChat && !canEdit && !chatByOrgUser;

//   const chatSocket = useChatSocket(chatOrItemID, {
//     connect: isChat || (!isChat && canComment), // Connect for both chat and comments
//     isChat,
//   });

//   const fetchInitialData = useCallback(async () => {
//     const limit = params.limit;
//     if (!isChat) {
//       dispatch(getPost(postID));
//       return dispatch(getComments(postID, { limit }));
//     }

//     const chatRes = await notifyQueryResult(
//       getChat({
//         assistant: assistantID,
//         user: userID ?? user?.id,
//       }),
//     );

//     if (!chatRes?.success || !chatRes?.data) {
//       setIsChatLoading(false);
//       return;
//     }

//     const chatID = chatIdReq ?? chatRes.data.id;

//     setChat(chatRes.data);

//     if (chatID) {
//       dispatch(getComments(chatID, { limit }, false, isChat));
//     }

//     setIsChatLoading(false);
//   }, [params.limit, isChat, assistantID, userID, user?.id, dispatch, postID]);

//   const readChat = useCallback(() => {
//     if (chatIdReq) {
//       readChatMessages(chatIdReq).catch((e) => console.error(e));
//     }
//   }, [chatIdReq]);

//   useEffect(() => {
//     document.body.style.overflowX = "hidden";
//     document.body.style.overflowY = "hidden";
//     return () => {
//       document.body.style.overflowX = "unset";
//       document.body.style.overflowY = "unset";
//     };
//   }, []);

//   // Скролл вниз только при первом появлении комментариев
//   const isFirstRender = useRef(true);
//   useEffect(() => {
//     if (comments && comments.list.length > 0 && isFirstRender.current) {
//       window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
//       isFirstRender.current = false;
//     }
//   }, [comments]);

//   // Скролл вниз после успешного создания комментария
//   useEffect(() => {
//     if (isCreateCommentSuccess) {
//       window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
//     }
//   }, [isCreateCommentSuccess]);

//   useEffect(() => {
//     void fetchInitialData();

//     return () => {
//       dispatch(clearReplyComment());
//     };
//   }, [dispatch, fetchInitialData]);

//   useEffect(() => {
//     chatSocket.onMessage((e) => {
//       try {
//         const newMessage = JSON.parse(e.data);
//         const isAssistant = !!newMessage.assistant;
//         const isOrg = !!newMessage.organization;

//         if (isAssistant || isOrg) {
//           setIsAssistantTyping(false);
//         }

//         dispatch(createPostCommentSuccess(newMessage));

//         const scrollContainer = document.getElementById("page-wrap");

//         if (scrollContainer) {
//           scrollContainer.scrollTo({ top: 0, behavior: "auto" });
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     });
//   }, [chatSocket, dispatch]);

//   useEffect(() => {
//     if (isCreateCommentSuccess && comments) {
//       const newComment = document.querySelector(
//         ".post-comments-page__infinite-scroll",
//       ).children[0];
//       newComment.classList.add("post-comments-page__create-comment-success");

//       setTimeout(() => {
//         newComment.classList.remove(
//           "post-comments-page__create-comment-success",
//         );
//         dispatch(clearCreateCommentSuccess());
//       }, 800);
//     }
//   }, [isCreateCommentSuccess, comments, dispatch]);

//   useEffect(() => {
//     if (isChat) void readChat();

//     return () => {
//       if (isChat) void readChat();
//     };
//   }, [isChat, readChat]);

//   const feedUpdater = () => {
//     if (document.activeElement === commentInput.current) {
//       commentInput.current.blur();
//     }
//   };

//   const getNext = async (totalPages) => {
//     if (params.page < totalPages) {
//       const nextPage = params.page + 1;
//       setIsScroll(true);
//       const oldHeight = document.documentElement.scrollHeight;
//       const oldScrollTop =
//         window.pageYOffset || document.documentElement.scrollTop;
//       await dispatch(
//         getComments(
//           chatIdReq || chatOrItemID,
//           { ...params, page: nextPage },
//           true,
//           isChat,
//         ),
//       );
//       requestAnimationFrame(() => {
//         const newHeight = document.documentElement.scrollHeight;
//         const heightDiff = newHeight - oldHeight;
//         window.scrollTo(0, oldScrollTop + heightDiff);
//       });
//       setIsScroll(false);
//       return setParams((prev) => ({ ...prev, hasMore: true, page: nextPage }));
//     }

//     setParams((prev) => ({ ...prev, hasMore: false }));
//   };

//   const cancelReplyComment = () => {
//     dispatch(clearReplyComment());
//   };

//   const updateComment = async (commentID, text) => {
//     const res = await notifyQueryResult(
//       updateCommentService(commentID, { text }),
//     );
//     if (res?.success) {
//       setEditingComment(null);
//       dispatch(
//         updateCommentAction(commentID, {
//           text,
//           is_updated: true,
//           updated_at: new Date().toJSON(),
//         }),
//       );
//     }
//   };

//   const toggleIsAiEnabled = async () => {
//     if (chat) {
//       setChat((prevChat) => ({
//         ...prevChat,
//         chat_by_org_user: !prevChat.chat_by_org_user,
//       }));
//     }

//     const res = await notifyQueryResult(
//       changeAssistantChatStatus({
//         chat: chatIdReq,
//         chat_by_org_user: !chatByOrgUser,
//       }),
//     );

//     if (!res?.success) {
//       if (chat) {
//         setChat((prevChat) => ({
//           ...prevChat,
//           chat_by_org_user: !prevChat.chat_by_org_user,
//         }));
//       }
//     }
//   };

//   const onSubmit = async (values) => {
//     if (editingComment) {
//       return await updateComment(editingComment.id, values.text);
//     } else {
//       // if (isChat) {
//       //   const isSent = chatSocket.sendMessage({
//       //     message: values.text,
//       //     parent: replyCurrentComment && replyCurrentComment.id,
//       //   });

//       //   !isSent &&
//       //     Notify.error({
//       //       text: ERROR_MESSAGES.smtw,
//       //     });

//       //   if (isSent && isAssistantWorking) {
//       //     setIsAssistantTyping(true);
//       //   }

//       //   chatScrollableTarget?.scrollTo(0, chatScrollableTarget.scrollHeight);
//       // } else {
//       //   dispatch(
//       //     createPostComment(
//       //       chatOrItemID,
//       //       {
//       //         text: values.text,
//       //         item: postID,
//       //         parent: replyCurrentComment && replyCurrentComment.id,
//       //       },
//       //       isChat
//       //     )
//       //   );
//       // }
//       const payload = {
//         message: values.text,
//         parent: replyCurrentComment && replyCurrentComment.id,
//       };

//       if (!isChat && organization) {
//         payload.organization_id = organization.id;
//       }

//       const isSent = chatSocket.sendMessage(payload);

//       if (!isSent) {
//         Notify.error({
//           text: ERROR_MESSAGES.smtw,
//         });
//       }

//       if (isSent && isAssistantWorking) {
//         setIsAssistantTyping(true);
//       }

//       setTimeout(() => {
//         if (chatScrollableTarget) {
//           const firstMessage = chatScrollableTarget.querySelector(
//             ".message:first-child",
//           );
//           if (firstMessage) {
//             firstMessage.scrollIntoView({
//               behavior: "instant",
//               block: "start",
//             });
//           } else {
//             chatScrollableTarget.scrollTo({ top: 0, behavior: "instant" });
//           }
//         }
//       }, 50);
//     }
//   };

//   const onCommentComplain = (commentID) => {
//     dispatch(
//       setGlobalMenu({
//         type: MENU_TYPES.comment_complaints_menu,
//         menuLabel: translate("Пожаловаться", "shop.complain"),
//         async onComplain(reason) {
//           const res = await reportComment(commentID, reason);
//           if (res && res.success) {
//             dispatch(hideComment(commentID));
//           } else {
//             Notify.error({
//               text: translate(
//                 "Не удалось пожаловаться на комментарий",
//                 "comment.failedToReport",
//               ),
//             });
//           }
//         },
//       }),
//     );
//   };

//   const onToggleComments = async () => {
//     setIsTogglingComments(MENUS.main);
//     const res = await notifyQueryResult(
//       toggleComments(postID, !isCommentsDisabled),
//     );
//     if (res && res.success) {
//       dispatch(
//         setPostDetail({
//           is_comments_disabled: !isCommentsDisabled,
//         }),
//       );
//       setOpenedMenu(false);
//     }
//     setIsTogglingComments(null);
//   };

//   const blockUserInComments = async (user) => {
//     try {
//       await blockUser(user.id, organization.id);
//       dispatch(setGlobalMenu(null));
//       dispatch(blockCommentsUser(user.id));
//       alert({
//         title: translate("Ограничить доступ", "app.restrictAccess"),
//         description: translate(
//           "Новые комментарии {userFullName} к вашей организации будут ограничен,  Вы сможете разблокировать доступ к комментариям в меню сообщений данного пользователя.",
//           "dialog.restrictAccessDescription",
//           { userFullName: user.full_name },
//         ),
//       });
//     } catch (e) {
//       Notify.error({
//         text: e.message,
//       });
//     }
//   };

//   const unblockUserInComments = async (user) => {
//     try {
//       await unblockUser(user.id, organization.id);
//       dispatch(setGlobalMenu(null));
//       dispatch(unblockCommentsUser(user.id));
//       Notify.success({
//         text: translate(
//           "Пользователь успешно разблокирован",
//           "notify.unblockUserSuccess",
//         ),
//       });
//     } catch (e) {
//       Notify.error({
//         text: e.message,
//       });
//       console.error(e);
//     }
//   };

//   const handleEditComment = (comment) => {
//     const commentFormInput = document.querySelector(
//       ".comment-form__field-message",
//     );
//     if (commentFormInput) {
//       commentFormInput?.focus();
//     }
//     setEditingComment(comment);
//   };

//   const handleFormChange = (e) => {
//     const contentEl = document.querySelector(
//       ".post-comments-page__content-wrap",
//     );

//     if (e.target.value.length > 25) {
//       contentEl.style.paddingBottom =
//         messagesPaddingBottom + parseInt(e.target.style.height) + "px";
//     } else {
//       contentEl.style.paddingBottom = `${messagesPaddingBottom}px`;
//     }
//   };

//   const themeObject =
//     COMMENT_THEMES.find((t) => t.id === wallpapers?.theme_id) ?? null;

//   const wrapperStyle = {
//     "--background-image": themeObject
//       ? `url(${themeObject.url}), url(${themeObject.bgUrl})`
//       : wallpapers
//         ? `url(${wallpapers.svg_pattern}), url(${wallpapers.svg_background})`
//         : "unset",
//     "--background-size": "375px 812px, cover",
//     "--background-repeat": "repeat, no-repeat",
//   };

//   if (wallpapers?.theme_type === "custom" && wallpapers?.theme_id === null) {
//     wrapperStyle["--background-image"] = `url(${wallpapers.image?.file})`;
//     wrapperStyle["--background-size"] = "cover";
//     wrapperStyle["--background-repeat"] = "no-repeat";
//     wrapperStyle["--background-position"] = "center";
//   }

//   if (isChatLoading) {
//     return <Preloader style={{ marginTop: 16 }} />;
//   }

//   const fullName = userData?.user?.full_name; // "Lil (@marka_ya)"

//   const username = fullName?.match(/\(([^)]+)\)/)?.[1];

//   return (
//     <div className="post-comments-page commentsPage">
//       {ai === "active" ? (
//         <MobileTopHeader
//           onBack={() => {
//             if (history.location.isPrevPathNotify) {
//               history.push({
//                 pathname: `/p/${postID}`,
//                 isPrevPathNotify: history.location.isPrevPathNotify,
//               });
//               return;
//             }

//             // Настройки вацап AI, Настройки телеграмм AI

//             history.goBack();
//           }}
//           aiTitle={username}
//           style={{
//             background: "rgba(255, 255, 255, 0.8)",
//             backdropFilter: "blur(4px)",
//           }}
//           className="post-comments-page__top-header"
//           onMenu={() => setOpenedMenu(MENUS.main)}
//         />
//       ) : (
//         <MobileTopHeader
//           onBack={() => {
//             if (history.location.isPrevPathNotify) {
//               history.push({
//                 pathname: `/p/${postID}`,
//                 isPrevPathNotify: history.location.isPrevPathNotify,
//               });
//               return;
//             }

//             history.goBack();
//           }}
//           title={
//             !isChat ? (
//               <>
//                 {postDetail && postDetail.images[0]?.file && (
//                   <OrgAvatar
//                     src={postDetail.images[0]?.file}
//                     alt={postDetail && postDetail.name}
//                     className="comment__avatar"
//                     size={40}
//                   />
//                 )}
//                 <span className="tl">{postDetail && postDetail.name}</span>
//               </>
//             ) : canEdit ? (
//               chat?.user?.full_name
//             ) : (
//               translate("Ассистент 24/7", "org.aiAssistant.allDays")
//             )
//           }
//           style={{
//             background: "rgba(255, 255, 255, 0.8)",
//             backdropFilter: "blur(4px)",
//           }}
//           className="post-comments-page__top-header"
//           renderRight={() => (
//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               <div>
//                 {/* <button
//                   onClick={() => handleCall()}
//                   className={`callBtn ${isCall ? "callBtn--active" : ""}`}
//                 >
//                   <span
//                     className="callBtn__icon callBtn__icon--static"
//                     style={{
//                       padding: "5px",
//                       background: "#007AFF",
//                       borderRadius: "50%",
//                     }}
//                   >
//                     <PhoneCall />
//                   </span>

//                   <span className="callBtn__icon callBtn__icon--lottie">
//                     <CallAnimation />
//                   </span>
//                 </button> */}
//                 <button
//                   onClick={isCall ? stopCall : handleCall}
//                   className={`callBtn ${isCall ? "callBtn--active" : ""}`}
//                 >
//                   <PhoneCall />
//                 </button>

//                 {isCall && <span>{formatTime(callTime)}</span>}
//               </div>
//               <button onClick={() => setOpenedMenu(MENUS.main)}>
//                 <MenuDots />
//               </button>
//             </div>
//           )}
//         />
//       )}

//       {isChat && !chat?.assistant?.is_enabled && (
//         <AIAssistantToast disabled className="post-comments-page__toast" />
//       )}

//       {params.page === 1 && loading && !isScroll ? (
//         <Preloader style={{ marginTop: 16 }} />
//       ) : (
//         comments &&
//         (!isChat || chatID !== setChat?.id) && (
//           <div
//             className={classNames(
//               "container post-comments-page__wrap",
//               "post-comments-page__wrap--inverse",
//             )}
//             id="page-wrap"
//             ref={setChatScrollTarget}
//             style={wrapperStyle}
//           >
//             <div
//               className="post-comments-page__content-wrap"
//               style={{ paddingBottom: messagesPaddingBottom }}
//             >
//               <div
//                 className="post-comments-page__content"
//                 onTouchMove={feedUpdater}
//               >
//                 <InfiniteScroll
//                   dataLength={Number(comments.list.length) || 0}
//                   next={() => getNext(comments.total_pages)}
//                   hasMore={params.hasMore}
//                   className="post-comments-page__infinite-scroll post-comments-page__infinite-scroll--inverse"
//                   loader={null}
//                   inverse={true}
//                   scrollableTarget={"page-wrap"}
//                 >
//                   {comments.list.map((comment) => {
//                     const { id, user } = comment;
//                     const userID = comment.user?.id;
//                     const isMyMessage = userID === currentUserID;
//                     return (
//                       <Comment
//                         key={comment.id}
//                         userData={userData}
//                         comment={comment}
//                         source={comments?.source}
//                         disabled={
//                           !canComment ||
//                           isCommentsDisabled ||
//                           isScrolling ||
//                           (!chatByOrgUser && canEdit)
//                         }
//                         noDots={assistantID}
//                         onBlock={
//                           canEdit &&
//                           userID !== currentUserID &&
//                           !comment.is_blocked &&
//                           (() => blockUserInComments(user))
//                         }
//                         onUnblock={
//                           canEdit &&
//                           userID !== currentUserID &&
//                           comment.is_blocked &&
//                           (() => unblockUserInComments(user))
//                         }
//                         onEdit={
//                           userID === currentUserID &&
//                           comment.can_delete &&
//                           (() => handleEditComment(comment))
//                         }
//                         onComplain={
//                           userID !== currentUserID &&
//                           (() => onCommentComplain(id))
//                         }
//                         className={`post-comments-page__comment ${
//                           isMyMessage ? "comment--right" : "comment--left"
//                         }`}
//                       />
//                     );
//                   })}

//                   {isScroll && loading && <Preloader />}
//                 </InfiniteScroll>
//               </div>
//             </div>

//             <div className={classNames("post-comments-page__controls")}>
//               {isAssistantTyping && (
//                 <AssistantTypingAnimation
//                   className="container"
//                   style={{ marginBottom: 10 }}
//                 />
//               )}

//               {canEdit &&
//                 isChat &&
//                 comments?.list[0].source === "web" &&
//                 chat.user.full_name !== userData?.user.full_name && (
//                   <div className="container" style={{ marginBottom: 18 }}>
//                     {chat?.chat_by_org_user ? (
//                       <WideButton
//                         variant={WIDE_BUTTON_VARIANTS.ACCEPT}
//                         onClick={toggleIsAiEnabled}
//                       >
//                         {translate(
//                           "Вернуть переписку AI Ассистенту",
//                           "org.aiAssistant.returnChat",
//                         )}
//                       </WideButton>
//                     ) : (
//                       <WideButton
//                         variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED}
//                         onClick={toggleIsAiEnabled}
//                       >
//                         {translate(
//                           "Начать переписку без AI Ассистента",
//                           "org.aiAssistant.chatWithoutAi",
//                         )}
//                       </WideButton>
//                     )}
//                   </div>
//                 )}

//               <div
//                 className={classNames(
//                   "post-comments-page__form-wrap",
//                   (!canComment || isCommentsDisabled) &&
//                     "post-comments-page__form-wrap--disabled",
//                 )}
//               >
//                 {canComment && !isCommentsDisabled ? (
//                   <>
//                     {replyCurrentComment && (
//                       <ReplyComment
//                         icon={
//                           <ReplyIcon fill="#007AFF" style={{ marginLeft: 3 }} />
//                         }
//                         comment={replyCurrentComment}
//                         onCancel={() => cancelReplyComment()}
//                         style={{ marginLeft: 8 }}
//                       />
//                     )}

//                     {editingComment && (
//                       <ReplyComment
//                         icon={
//                           <EditIcon fill="#007AFF" style={{ marginLeft: 3 }} />
//                         }
//                         comment={{
//                           text: editingComment.user
//                             ? editingComment.user.full_name
//                             : editingComment.organization.title,
//                         }}
//                         title={translate("Редактирование", "app.edit")}
//                         onCancel={() => setEditingComment(null)}
//                         style={{ marginLeft: 8 }}
//                       />
//                     )}

//                     {/*TODO: onMenu*/}
//                     {(chatByOrgUser || !canEdit || isMyChat) && (
//                       <CommentForm
//                         onSubmit={onSubmit}
//                         editText={editingComment?.text ?? ""}
//                         loading={!isChat && loadingCreateComment}
//                         replyComment={replyCurrentComment}
//                         commentInput={commentInput}
//                         onChange={handleFormChange}
//                         onMenu={() => {}}
//                         className={`post-comments-page__form`}
//                         disabled={isAssistantTyping}
//                       />
//                     )}

//                     {!chatByOrgUser && !isMyChat && canEdit && (
//                       <div className="post-comments-page__ai-note">
//                         <div className="post-comments-page__ai-note-icon-container">
//                           <AIIcon className="post-comments-page__ai-note-icon" />
//                         </div>
//                         <p>
//                           {translate(
//                             "AI Ассистент ведет переписку автоматически",
//                             "org.aiAssistant.returnChatNote",
//                           )}
//                         </p>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <div className="post-comments-page__access-restricted">
//                     {isCommentsDisabled ? (
//                       <DisableCommentsIcon
//                         fill="#007AFF"
//                         className="post-comments-page__access-restricted-icon post-comments-page__access-restricted-icon--blue"
//                       />
//                     ) : (
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="24"
//                         height="24"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         className="post-comments-page__access-restricted-icon"
//                       >
//                         <path
//                           fill="#D72C20"
//                           d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
//                         ></path>
//                       </svg>
//                     )}

//                     {isCommentsDisabled
//                       ? translate(
//                           "Комментарии к данному сообщению выключены",
//                           "comment.disabledDesc",
//                         )
//                       : translate(
//                           "Доступ ограничен, Вы не можете оставлять комментарии",
//                           "comment.accessRestricted",
//                         )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )
//       )}

//       <MobileMenu
//         isOpen={openedMenu === MENUS.main}
//         contentLabel={translate("Настройки", "app.settings")}
//         onRequestClose={() => setOpenedMenu(null)}
//       >
//         {canEdit && (
//           <>
//             {/* <RowButton
//               label={translate(
//                 "Заблокированные пользователи",
//                 "comment.blockedUsers"
//               )}
//               type={ROW_BUTTON_TYPES.link}
//               className="post-comments-page__menu-btn"
//               showArrow={false}
//               to={`/organizations/${organization?.id}/followers?tab=blocked_users`}
//             >
//               <BlockedUsersIcon />
//             </RowButton> */}

//             {!isChat && (
//               <>
//                 {isCommentsDisabled ? (
//                   <RowButton
//                     label={translate("Включить комментарии", "comment.enable")}
//                     type={ROW_BUTTON_TYPES.button}
//                     onClick={onToggleComments}
//                     className="post-comments-page__menu-btn"
//                     showArrow={false}
//                     endIcon={isTogglingComments && <Preloader />}
//                   >
//                     <EnabledCommentsIcon />
//                   </RowButton>
//                 ) : (
//                   <RowButton
//                     label={translate(
//                       "Выключить комментарии",
//                       "comment.disable",
//                     )}
//                     type={ROW_BUTTON_TYPES.button}
//                     onClick={onToggleComments}
//                     className="post-comments-page__menu-btn"
//                     showArrow={false}
//                     endIcon={isTogglingComments && <Preloader />}
//                   >
//                     <DisableCommentsIcon />
//                   </RowButton>
//                 )}
//               </>
//             )}
//           </>
//         )}

//         <RowButton
//           label={translate("Выбрать тему", "comment.selectTheme")}
//           type={ROW_BUTTON_TYPES.button}
//           onClick={() => setOpenedMenu(MENUS.themes)}
//           className="post-comments-page__menu-btn"
//           showArrow={false}
//           style={{ marginBottom: "15px" }}
//         >
//           <SelectThemeIcon />
//         </RowButton>
//       </MobileMenu>

//       <ThemeMenu
//         isOpen={openedMenu === MENUS.themes}
//         chatID={chatIdReq}
//         chatIdReq={chatIdReq}
//         onRequestClose={() => setOpenedMenu(null)}
//       />
//     </div>
//   );
// };

// const DisableCommentsIcon = ({ fill, ...rest }) => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       fill="none"
//       viewBox="0 0 24 24"
//       {...rest}
//     >
//       <path
//         fill={fill ?? "#000"}
//         d="M19 14a1 1 0 00-1.22.72A7 7 0 0111 20H5.41l.64-.63a1 1 0 000-1.41 7 7 0 013.2-11.74 1.002 1.002 0 00-.5-1.94A9 9 0 004 18.62l-1.71 1.67a1 1 0 00-.21 1.09A1 1 0 003 22h8a9 9 0 008.72-6.75A.999.999 0 0019 14zm1.54-10.54a5 5 0 10-7.08 7.06 5 5 0 007.08-7.06zM14 7a3 3 0 013-3 3 3 0 011.29.3l-4 4A3.002 3.002 0 0114 7zm5.12 2.12a3.08 3.08 0 01-3.4.57l4-4A3 3 0 0120 7a3 3 0 01-.88 2.12z"
//       ></path>
//     </svg>
//   );
// };

// const EnabledCommentsIcon = ({ fill, ...props }) => (
//   <svg
//     width={24}
//     height={24}
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path
//       d="M13.29 7.1305C13.1963 7.22347 13.1219 7.33407 13.0711 7.45593C13.0203 7.57779 12.9942 7.70849 12.9942 7.8405C12.9942 7.97252 13.0203 8.10322 13.0711 8.22508C13.1219 8.34694 13.1963 8.45754 13.29 8.5505L15.21 10.4705C15.303 10.5642 15.4136 10.6386 15.5354 10.6894C15.6573 10.7402 15.788 10.7663 15.92 10.7663C16.052 10.7663 16.1827 10.7402 16.3046 10.6894C16.4264 10.6386 16.537 10.5642 16.63 10.4705L20.71 6.3905C20.8194 6.30165 20.9087 6.19069 20.9722 6.0649C21.0356 5.93911 21.0718 5.80133 21.0783 5.66058C21.0848 5.51984 21.0615 5.3793 21.0099 5.24819C20.9583 5.11709 20.8796 4.99836 20.7789 4.8998C20.6782 4.80124 20.5578 4.72507 20.4256 4.67628C20.2935 4.6275 20.1525 4.60719 20.0119 4.6167C19.8713 4.6262 19.7343 4.66531 19.6099 4.73146C19.4855 4.7976 19.3765 4.88928 19.29 5.0005L15.92 8.3505L14.71 7.1305C14.617 7.03678 14.5064 6.96238 14.3846 6.91161C14.2627 6.86084 14.132 6.83471 14 6.83471C13.868 6.83471 13.7373 6.86084 13.6154 6.91161C13.4936 6.96238 13.383 7.03678 13.29 7.1305ZM19.91 10.6405C19.6463 10.6634 19.4023 10.7899 19.2318 10.9924C19.0612 11.1949 18.9778 11.4567 19 11.7205C19.005 11.8138 19.005 11.9072 19 12.0005C19 13.857 18.2625 15.6375 16.9498 16.9503C15.637 18.263 13.8565 19.0005 12 19.0005H6.41L7.05 18.3705C7.23626 18.1831 7.3408 17.9297 7.3408 17.6655C7.3408 17.4013 7.23626 17.1479 7.05 16.9605C6.15566 16.071 5.51828 14.9564 5.20526 13.7344C4.89224 12.5125 4.91521 11.2287 5.27174 10.0188C5.62827 8.80885 6.3051 7.71773 7.23069 6.86079C8.15628 6.00384 9.29623 5.41292 10.53 5.1505C11.4542 4.9657 12.4058 4.9657 13.33 5.1505C13.4613 5.17677 13.5965 5.17691 13.7279 5.15092C13.8593 5.12493 13.9843 5.07332 14.0957 4.99903C14.2071 4.92474 14.3028 4.82924 14.3773 4.71796C14.4519 4.60669 14.5037 4.48183 14.53 4.3505C14.5563 4.21918 14.5564 4.08397 14.5304 3.9526C14.5044 3.82122 14.4528 3.69625 14.3785 3.58482C14.3042 3.47339 14.2087 3.37768 14.0975 3.30316C13.9862 3.22864 13.8613 3.17677 13.73 3.1505C12.5386 2.91077 11.3114 2.91077 10.12 3.1505C8.10119 3.59117 6.29398 4.70942 4.99871 6.31941C3.70344 7.9294 2.99813 9.93416 3 12.0005C3.0084 14.0467 3.71384 16.029 5 17.6205L3.29 19.2905C3.15125 19.4311 3.05725 19.6097 3.01988 19.8037C2.9825 19.9977 3.00342 20.1984 3.08 20.3805C3.15502 20.5631 3.28242 20.7194 3.44614 20.8298C3.60986 20.9401 3.80258 20.9995 4 21.0005H12C14.387 21.0005 16.6761 20.0523 18.364 18.3645C20.0518 16.6766 21 14.3875 21 12.0005V11.5605C20.99 11.4281 20.9536 11.299 20.8932 11.1808C20.8327 11.0626 20.7493 10.9576 20.6479 10.872C20.5464 10.7864 20.4289 10.7218 20.3022 10.682C20.1755 10.6423 20.0422 10.6282 19.91 10.6405Z"
//       fill={fill ?? "black"}
//     />
//   </svg>
// );

// export default CommentsPage;
