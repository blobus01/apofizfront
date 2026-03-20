// import React, { useEffect, useRef, useState } from "react";
// import { Conversation } from "@11labs/client";
// import axios from "axios-api";
// import CallAnimation from "./CallAnimation";
// import { PhoneCall } from "./icons";
// import callSound from "./callPhone.mp3";
// import endCall from "./endCall.mp3";

// const VoiceAssistant = ({
//   chatId,
//   chatSocket,
//   isVoiceSessionRef,
//   assistantID,
//   noTimer,
//   right,
// }) => {
//   const conversationRef = useRef(null);
//   const timerRef = useRef(null);

//   const ringAudioRef = useRef(new Audio(callSound));
//   const endAudioRef = useRef(new Audio(endCall));

//   const lastUserTranscriptRef = useRef("");
//   const lastAssistantTranscriptRef = useRef("");

//   const [isConnected, setIsConnected] = useState(false);
//   const [mode, setMode] = useState("idle");
//   const [isLoading, setIsLoading] = useState(false);
//   const [callTime, setCallTime] = useState(0);

//   useEffect(() => {
//     return () => stopCall(true);
//   }, []);

//   const startTimer = () => {
//     timerRef.current = setInterval(() => {
//       setCallTime((t) => t + 1);
//     }, 1000);
//   };

//   const stopTimer = () => {
//     clearInterval(timerRef.current);
//     timerRef.current = null;
//     setCallTime(0);
//   };

//   const formatTime = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0",
//     )}`;

//   const sendUserTranscriptToChat = (text) => {
//     const cleaned = String(text || "").trim();
//     if (!cleaned) return;

//     if (cleaned === lastUserTranscriptRef.current) return;
//     lastUserTranscriptRef.current = cleaned;

//     chatSocket.send(
//       JSON.stringify({
//         message: cleaned,

//         skip_assistant_reply: true,
//       }),
//     );
//   };

//   const sendAssistantMessageToChat = (text) => {
//     const cleaned = String(text || "").trim();
//     if (!cleaned) return;

//     if (cleaned === lastAssistantTranscriptRef.current) return;
//     lastAssistantTranscriptRef.current = cleaned;

//     chatSocket.send(
//       JSON.stringify({
//         message: cleaned,
//         assistant_id: assistantID,
//       }),
//     );
//   };

//   const handleConversationMessage = (payload) => {
//     console.log("ELEVENLABS MESSAGE FULL:", payload);

//     const source = String(payload?.source || "").toLowerCase();
//     const text = String(payload?.message || "").trim();

//     if (!text) return;

//     if (source === "user") {
//       sendUserTranscriptToChat(text);
//       return;
//     }

//     if (source === "ai" || source === "assistant" || source === "agent") {
//       sendAssistantMessageToChat(text);
//     }
//   };

//   const startCall = async () => {
//     setIsLoading(true);
//     setMode("idle");
//     lastUserTranscriptRef.current = "";
//     lastAssistantTranscriptRef.current = "";

//     ringAudioRef.current.loop = true;
//     ringAudioRef.current.play().catch(() => {});

//     try {
//       const res = await axios.get(`/chat/${chatId}/call-ai/`);
//       const { signed_url } = res.data;

//       conversationRef.current = await Conversation.startSession({
//         signedUrl: signed_url,

//         clientTools: {
//           send_link_to_chat: async ({ url }) => {
//             console.log("send_link_to_chat called", { url });

//             if (!url) {
//               return { success: false, error: "url is required" };
//             }

//             chatSocket.send(
//               JSON.stringify({
//                 message: url,
//                 assistant_id: assistantID,
//                 is_voice_transcript: true,
//               }),
//             );

//             return { success: true };
//           },

//           get_shop_search_params: async (params) => {
//             console.log("get_shop_search_params CALLED", params);
//           },
//           search_products: async ({ query }) => {
//          console.log("QUERY", query)
//           },
//         },

//         onConnect: () => {
//           console.log("CONNECTED");
//           isVoiceSessionRef.current = true;
//           ringAudioRef.current.pause();
//           ringAudioRef.current.currentTime = 0;

//           setIsConnected(true);
//           setIsLoading(false);
//           startTimer();
//         },

//         onDisconnect: () => {
//           isVoiceSessionRef.current = false;
//           stopCall();
//         },

//         onError: (err) => {
//           console.error("❌ ElevenLabs error", err);
//           stopCall();
//         },

//         onDebug: (debug) => {
//           console.log("ELEVENLABS DEBUG:", debug);
//         },

//         onUnhandledClientToolCall: (toolCall) => {
//           console.error("UNHANDLED CLIENT TOOL CALL:", toolCall);
//         },

//         onModeChange: ({ mode }) => {
//           setMode(mode);
//         },

//         onMessage: (payload) => {
//           console.log("ELEVENLABS MESSAGE FULL:", payload);
//           handleConversationMessage(payload);
//         },
//       });
//     } catch (e) {
//       console.error(e);
//       stopCall(true);
//       alert("Не удалось начать звонок");
//     }
//   };

//   const stopCall = async (silent = false) => {
//     ringAudioRef.current.pause();
//     ringAudioRef.current.currentTime = 0;

//     if (!silent) {
//       endAudioRef.current.play().catch(() => {});
//     }

//     stopTimer();

//     await conversationRef.current?.endSession();
//     conversationRef.current = null;

//     setIsConnected(false);
//     setMode("idle");
//     setIsLoading(false);
//   };

//   const indicatorColor =
//     mode === "speaking"
//       ? "rgb(34,197,94)"
//       : mode === "listening"
//         ? "rgb(234,179,8)"
//         : "transparent";

//   return (
//     <div
//       className="voice-assistant"
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 5,
//         justifyContent: "space-between",
//       }}
//     >
//       {!isConnected ? (
//         <button onClick={startCall} disabled={isLoading}>
//           {isLoading ? (
//             <CallAnimation />
//           ) : (
//             <span
//               style={{
//                 background: "#007AFF",
//                 borderRadius: "50%",
//                 padding: "12px 5px 0px 5px",
//                 marginRight: right ? right : 0,
//               }}
//             >
//               <PhoneCall />
//             </span>
//           )}
//         </button>
//       ) : (
//         <>
//           {noTimer ? (
//             ""
//           ) : (
//             <div className="callStatus">
//               <span
//                 className="callStatus__dot"
//                 style={{ background: indicatorColor }}
//               />
//               <span className="callStatus__time">{formatTime(callTime)}</span>
//             </div>
//           )}

//           <button onClick={stopCall} type="button">
//             <span
//               style={{
//                 background: "#FF3B30",
//                 borderRadius: "50%",
//                 padding: "12px 5px 0px 5px",
//                 marginRight: right ? right : 0,
//               }}
//             >
//               <PhoneCall />
//             </span>
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default VoiceAssistant;
