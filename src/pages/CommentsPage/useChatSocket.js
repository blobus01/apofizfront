import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pathes from "@common/pathes";
import config from "../../config";
import { useSelector } from "react-redux";

const PROTOCOL = "wss:";

const useChatSocket = (
  chatID,
  {
    connect = false,
    isChat = false,
    isMessenger = false,
    isChatList = false,
    isUnreadCount = false,
  }
) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = useSelector((state) => state.userStore.token);

  const isMounted = useRef(true);

  const connectSocket = useCallback(() => {
    if (!connect || !chatID) return;

    const url = new URL(config.apiURL);
    url.protocol = PROTOCOL;
    url.pathname = isChat
      ? Pathes.Chat.ws(chatID)
      : isMessenger
      ? Pathes.Messenger.ws(chatID)
      : isUnreadCount
      ? Pathes.ChatList.wsUnread()
      : isChatList
      ? Pathes.ChatList.ws()
      : Pathes.Comments.ws(chatID);

    const socket = new WebSocket(url.toString(), [token]);

    setSocket(socket);
  }, [chatID, connect, token, isChat, isMessenger, isChatList, isUnreadCount]);

  const addDefaultEventListeners = useCallback(() => {
    if (!socket) return;

    const handleOpen = (e) => {
      if (isMounted.current) {
        setIsConnected(true);
      }
      console.log("Chat socket was connected.", e);
    };

    const handleClose = (e) => {
      if (isMounted.current) {
        setIsConnected(false);
      }
      console.log("Chat socket was closed.", e);
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);

    // Cleanup function to remove listeners
    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
    };
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);

  const onMessage = useCallback(
    (cb) => {
      if (!socket) return () => {};

      socket.addEventListener("message", cb);
      return () => {
        socket.removeEventListener("message", cb);
      };
    },
    [socket]
  );

  const sendMessage = useCallback(
    (payload) => {
      if (!isConnected) {
        console.error("Chat socket was not connected.", payload);
        return false;
      }

      try {
        socket.send(JSON.stringify(payload));
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    [isConnected, socket]
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  useEffect(() => {
    let removeListeners;
    if (socket) {
      removeListeners = addDefaultEventListeners();
    }
    return () => {
      if (removeListeners) removeListeners();
    };
  }, [addDefaultEventListeners, socket]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return useMemo(
    () => ({
      isConnected,
      onMessage,
      sendMessage,
      socket,
    }),
    [isConnected, onMessage, sendMessage]
  );
};

export default useChatSocket;
