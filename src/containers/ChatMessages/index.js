import React, {useCallback} from 'react';
import useInfiniteScrollQuery from "@hooks/useInfiniteScrollQuery";
import {notifyQueryResult} from "@common/helpers";
import {getChatMessages} from "@store/services/aiServices";
import Comment from "@components/Comment";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "@components/Preloader";

const ChatMessages = ({chat, className}) => {
  
  const fetchMessages = useCallback((params, chatID) => {
    if (!chatID) return null
    return notifyQueryResult(getChatMessages(chatID, params))
  }, []);

  const {
    data: messages,
    next,
    hasMore
  } = useInfiniteScrollQuery(({params}) => fetchMessages(params, chat.id), [chat.id])

  return (
    <InfiniteScroll
      dataLength={messages.length}
      hasMore={hasMore}
      next={next}
      loader={<Preloader/>}
      scrollableTarget="chat-container"
      className={className}
      style={{flexGrow: 1}}
    >

      {messages.map(message => (
        <Comment
          comment={{
            user: chat.user,
            ...message,
          }}
          disabled
        />
      ))}
    </InfiniteScroll>
  );
};

export default ChatMessages;