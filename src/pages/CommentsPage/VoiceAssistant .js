import React, { useEffect, useRef, useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import axios from "axios-api";
import CallAnimation from "./CallAnimation";
import { PhoneCall } from "./icons";
import callSound from "./callPhone.mp3";
import endCall from "./endCall.mp3";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const VoiceAssistant = ({
  chatId,
  chatSocket,
  isVoiceSessionRef,
  assistantID,
  noTimer,
  right,
  userID,
}) => {
  const timerRef = useRef(null);

  const logTool = (name, stage, payload) => {
    console.log(`[ELEVEN TOOL] ${name} :: ${stage}`, payload);
  };

  const params = useParams();

  const ringAudioRef = useRef(new Audio(callSound));
  const endAudioRef = useRef(new Audio(endCall));

  const lastUserTranscriptRef = useRef("");
  const lastAssistantTranscriptRef = useRef("");

  const [callTime, setCallTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setCallTime((t) => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setCallTime(0);
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const sendUserTranscriptToChat = useCallback(
    (text) => {
      const cleaned = String(text || "").trim();
      if (!cleaned) return;

      if (cleaned === lastUserTranscriptRef.current) return;
      lastUserTranscriptRef.current = cleaned;

      chatSocket.send(
        JSON.stringify({
          message: cleaned,
          source: "voice",
          is_voice_transcript: true,
          skip_assistant_reply: true,
        }),
      );

      const userTextForFallback = cleaned;
      const scheduledAt = Date.now();

      if (PRODUCT_INTENT_REGEX.test(userTextForFallback)) {
        setTimeout(async () => {
          try {
            if (lastToolSearchAtRef.current > scheduledAt) {
              console.log("[FALLBACK] search_products already called by tool");
              return;
            }

            const items = await findProductsForVoiceQuery(
              userTextForFallback,
              6,
            );

            if (items.length > 0) {
              const products = mapItemsToToolProducts(items);
              sendProductsToChat(products);
            }
          } catch (error) {
            console.error("[FALLBACK] product search error", error);
          }
        }, 700);
      }
    },
    [chatSocket],
  );

  const sendAssistantMessageToChat = useCallback(
    (text) => {
      const cleaned = String(text || "").trim();
      if (!cleaned) return;

      if (cleaned === lastAssistantTranscriptRef.current) return;
      lastAssistantTranscriptRef.current = cleaned;

      chatSocket.send(
        JSON.stringify({
          message: cleaned,
          assistant_id: assistantID,
          source: "voice",
          is_voice_transcript: true,
        }),
      );
    },
    [chatSocket, assistantID],
  );

  const handleConversationMessage = useCallback(
    ({ message, source }) => {
      const text = String(message || "").trim();
      const normalizedSource = String(source || "").toLowerCase();

      if (!text) return;

      if (normalizedSource === "user") {
        sendUserTranscriptToChat(text);
        return;
      }

      if (
        normalizedSource === "ai" ||
        normalizedSource === "assistant" ||
        normalizedSource === "agent"
      ) {
        sendAssistantMessageToChat(text);
      }
    },
    [sendUserTranscriptToChat, sendAssistantMessageToChat],
  );

  const PRODUCT_INTENT_REGEX =
    /(кед|кроссов|обув|ботин|туфл|сандал|сланц|шлеп|купаль|товар|модель|размер|цвет|покаж|скинь|подбер|вариант|найд|дай|хочу|есть|ищ|отправ|пришл|выбер|глян|посмотр|наличи)/i;

  const PRODUCT_DUPLICATE_WINDOW_MS = 8000;

  const lastToolSearchAtRef = useRef(0);
  const lastSentProductsRef = useRef({
    key: "",
    at: 0,
  });

  const isCyrillic = (text = "") => /[а-яё]/i.test(text);

  const stemRussian = (word = "") => {
    if (word.length <= 4) return word;

    const suffixes = [
      "никами",
      "никах",
      "ников",
      "никам",
      "ники",
      "ками",
      "ках",
      "ков",
      "кам",
      "ами",
      "ями",
      "ов",
      "ев",
      "ей",
      "ки",
      "ке",
      "ку",
      "ок",
      "ы",
      "и",
      "а",
      "я",
      "у",
      "е",
      "о",
    ];

    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
        return word.slice(0, -suffix.length);
      }
    }

    return word;
  };

  const buildProductSearchQueries = (query = "") => {
    const cleaned = String(query || "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, " ");

    if (!cleaned) return [];

    const words = cleaned.split(" ").filter(Boolean);
    const stemmedWords = words.map(stemRussian);

    const variants = new Set([
      cleaned,
      words.join(" "),
      stemmedWords.join(" "),
      ...words,
      ...stemmedWords,
    ]);

    return [...variants].filter(Boolean);
  };

  const normalizeApofizUrl = (url = "") => {
    const value = String(url || "").trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  };

  const isValidHttpUrl = (value = "") =>
    /^https?:\/\/\S+$/i.test(String(value).trim());

  const compactProduct = (item = {}) => {
    const rawUrl = item.url || item.link || item.href || "";
    const fallbackUrl = item.id ? `https://apofiz.com/p/${item.id}` : null;

    const validUrl = isValidHttpUrl(rawUrl) ? rawUrl.trim() : fallbackUrl;

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      old_price: item.old_price || item.discount_price,
      image:
        item.image ||
        item.preview_image ||
        item.photo ||
        item.images?.[0] ||
        null,
      url: validUrl,
      description: item.description || "",
      subcategory: item.subcategory?.name || item.subcategory || "",
      brand: item.brand?.name || item.brand || "",
    };
  };

  const mapItemsToToolProducts = (items = []) => items.map(compactProduct);

  const isItemRelevantToQuery = (item, query = "") => {
    const text = [
      item?.name,
      item?.description,
      item?.subcategory?.name,
      item?.subcategory,
      item?.brand?.name,
      item?.brand,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const queryWords = String(query || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (!queryWords.length) return true;

    return queryWords.some((word) => {
      const stem = stemRussian(word);
      return text.includes(word) || text.includes(stem);
    });
  };

  const emitAssistantMessage = (message) => {
    const payload = {
      message,
      assistant_id: assistantID,
      source: "voice",
      is_voice_transcript: true,
    };

    console.log("[CHAT SOCKET] emitAssistantMessage payload", payload);
    chatSocket.send(JSON.stringify(payload));
  };

  const shouldSkipDuplicateProducts = (products = []) => {
    const ids = products
      .map((p) => p?.id)
      .filter(Boolean)
      .sort((a, b) => a - b);

    const key = ids.join(",");
    const now = Date.now();

    if (
      key &&
      lastSentProductsRef.current.key === key &&
      now - lastSentProductsRef.current.at < PRODUCT_DUPLICATE_WINDOW_MS
    ) {
      return true;
    }

    lastSentProductsRef.current = { key, at: now };
    return false;
  };

  const sendProductsToChat = (products = []) => {
    if (!products.length) return false;
    if (shouldSkipDuplicateProducts(products)) return false;

    const validProducts = products.filter((p) => p?.url);

    validProducts.slice(0, 3).forEach((product, index) => {
      setTimeout(() => {
        emitAssistantMessage(product.url);
      }, index * 250);
    });

    return true;
  };

  const translateToRussian = async (text = "") => {
    try {
      const { data } = await axios.post("/translate/", {
        text,
        target_language: "ru",
      });

      return data?.text || data?.translated_text || text;
    } catch (error) {
      console.error("[TRANSLATE] translateToRussian error", error);
      return text;
    }
  };

  const findProductsForVoiceQuery = async (query = "", limit = 6) => {
    let normalizedQuery = String(query || "").trim();

    if (!normalizedQuery) return [];

    if (!isCyrillic(normalizedQuery)) {
      normalizedQuery = await translateToRussian(normalizedQuery);
      console.log("[TRANSLATE] translated query:", normalizedQuery);
    }

    const queries = buildProductSearchQueries(normalizedQuery);
    console.log("[PRODUCTS] built queries:", queries);

    for (const q of queries) {
      try {
        const requestUrl = `/shop/organization_items/?search=${encodeURIComponent(q)}&limit=${limit}&organization=${params.orgID}`;
        console.log("[API] findProductsForVoiceQuery request", requestUrl);

        const { data } = await axios.get(requestUrl);

        const items = data?.list || data?.results || data?.items || [];
        const relevant = items.filter((item) =>
          isItemRelevantToQuery(item, normalizedQuery),
        );

        if (relevant.length > 0) {
          console.log("[PRODUCTS] relevant found:", relevant);
          return relevant;
        }

        if (items.length > 0) {
          console.log("[PRODUCTS] fallback items found:", items);
          return items;
        }
      } catch (error) {
        console.error("[PRODUCTS] findProductsForVoiceQuery error", error);
      }
    }

    return [];
  };

  const conversation = useConversation({
    clientTools: {
      send_link_to_chat: async (args) => {
        logTool("send_link_to_chat", "called", args);

        try {
          const finalUrl = normalizeApofizUrl(
            args?.url || args?.link || args?.href || args?.product_url || "",
          );

          if (args?.product) {
            const product = compactProduct(args.product);
            sendProductsToChat([product]);

            const result = "Product sent to chat";
            logTool("send_link_to_chat", "return", result);
            return result;
          }

          if (Array.isArray(args?.products) && args.products.length > 0) {
            const products = args.products.map(compactProduct);
            sendProductsToChat(products);

            const result = "Products sent to chat";
            logTool("send_link_to_chat", "return", result);
            return result;
          }

          if (finalUrl) {
            emitAssistantMessage(finalUrl);

            const result = "Link sent to chat";
            logTool("send_link_to_chat", "return", result);
            return result;
          }

          if (args?.message) {
            emitAssistantMessage(String(args.message));

            const result = "Message sent to chat";
            logTool("send_link_to_chat", "return", result);
            return result;
          }

          const errorResult = {
            success: false,
            error: "product/products/url/link/message is required",
          };
          logTool("send_link_to_chat", "return", errorResult);
          return errorResult;
        } catch (error) {
          console.error("[ELEVEN TOOL] send_link_to_chat :: error", error);
          return { success: false, error: error?.message || "Unknown error" };
        }
      },

      search_products: async (args) => {
        logTool("search_products", "called", args);

        try {
          lastToolSearchAtRef.current = Date.now();

          const query = String(args?.query || "").trim();
          const limit = Number(args?.limit || 6);

          if (!query) {
            const emptyResult = [];
            logTool("search_products", "return", emptyResult);
            return JSON.stringify(emptyResult);
          }

          const items = await findProductsForVoiceQuery(query, limit);
          const products = mapItemsToToolProducts(items);

          if (products.length > 0) {
            sendProductsToChat(products);
          }

          logTool("search_products", "return", products);
          return JSON.stringify(products);
        } catch (error) {
          console.error("[ELEVEN TOOL] search_products :: error", error);

          const errorResult = {
            error: true,
            message: "Failed to load products",
            details: error?.message || null,
          };

          logTool("search_products", "return", errorResult);
          return JSON.stringify(errorResult);
        }
      },

      showProducts: async (args) => {
        logTool("showProducts", "called", args);

        try {
          const products = Array.isArray(args?.products)
            ? args.products.map(compactProduct)
            : [];

          if (products.length > 0) {
            sendProductsToChat(products);
          }

          const result = "Products displayed";
          logTool("showProducts", "return", result);
          return result;
        } catch (error) {
          console.error("[ELEVEN TOOL] showProducts :: error", error);
          return "Failed to display products";
        }
      },
    },

    onConnect: () => {
      isVoiceSessionRef.current = true;

      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;

      setIsLoading(false);
      startTimer();
    },

    onDisconnect: () => {
      isVoiceSessionRef.current = false;
      stopTimer();
      setIsLoading(false);
    },

    onMessage: handleConversationMessage,

    onModeChange: ({ mode }) => {
      console.log("mode:", mode);
    },

    onError: (err) => {
      console.error("ElevenLabs error", err);
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      stopTimer();
      setIsLoading(false);
      isVoiceSessionRef.current = false;
    },

    onUnhandledClientToolCall: (toolCall) => {
      console.error("UNHANDLED CLIENT TOOL CALL:", toolCall);
    },

    onDebug: (debug) => {
      console.log("ELEVENLABS DEBUG:", debug);
    },
  });

  const isStartingRef = useRef(false);

  const startCall = async () => {
    if (isStartingRef.current) return;
    if (
      conversation.status === "connecting" ||
      conversation.status === "connected"
    ) {
      return;
    }

    try {
      isStartingRef.current = true;
      setIsLoading(true);

      lastUserTranscriptRef.current = "";
      lastAssistantTranscriptRef.current = "";

      ringAudioRef.current.loop = true;
      ringAudioRef.current.play().catch(() => {});

      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data } = await axios.get(
        `/chat/${chatId}/call-ai/?assistant=${assistantID}`,
      );

      await conversation.startSession({
        signedUrl: data.signed_url,
        userId: String(userID),
      });
    } catch (error) {
      console.error("startCall error:", error);
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      setIsLoading(false);
      isVoiceSessionRef.current = false;
      alert("Не удалось начать звонок");
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopCall = async (silent = false) => {
    ringAudioRef.current.pause();
    ringAudioRef.current.currentTime = 0;

    if (!silent) {
      endAudioRef.current.play().catch(() => {});
    }

    stopTimer();
    isVoiceSessionRef.current = false;

    try {
      if (
        conversation.status === "connecting" ||
        conversation.status === "connected"
      ) {
        await conversation.endSession();
      }
    } catch (error) {
      console.error("endSession error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      ringAudioRef.current.pause();
      ringAudioRef.current.currentTime = 0;
      stopTimer();
    };
  }, []);

  const isConnected = conversation.status === "connected";
  const mode = conversation.isSpeaking
    ? "speaking"
    : isConnected
      ? "listening"
      : "idle";

  const indicatorColor =
    mode === "speaking"
      ? "rgb(34,197,94)"
      : mode === "listening"
        ? "rgb(234,179,8)"
        : "transparent";

  return (
    <div
      className="voice-assistant"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        justifyContent: "space-between",
      }}
    >
      {!isConnected ? (
        <button onClick={startCall} disabled={isLoading}>
          {isLoading ? (
            <CallAnimation />
          ) : (
            <span
              style={{
                background: "#007AFF",
                borderRadius: "50%",
                padding: "12px 5px 0px 5px",
                marginRight: right || 0,
              }}
            >
              <PhoneCall />
            </span>
          )}
        </button>
      ) : (
        <>
          {!noTimer && (
            <div className="callStatus">
              <span
                className="callStatus__dot"
                style={{ background: indicatorColor }}
              />
              <span className="callStatus__time">{formatTime(callTime)}</span>
            </div>
          )}

          <button onClick={() => stopCall(false)} type="button">
            <span
              style={{
                background: "#FF3B30",
                borderRadius: "50%",
                padding: "12px 5px 0px 5px",
                marginRight: right || 0,
              }}
            >
              <PhoneCall />
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceAssistant;
