import React, {useCallback, useEffect, useRef, useState} from 'react';
import MobileTopHeader from "@components/MobileTopHeader";
import CommentForm from "@components/Forms/CommentForm";
import classNames from "classnames";
import FullHeightContainer from "@components/FullHeightContainer";
import WideButton, {WIDE_BUTTON_VARIANTS} from "@ui/WideButton";
import {translate} from "@locales/locales";
import AIIcon from "@ui/Icons/AIIcon";
import useSearchParam from "@hooks/useSearchParam";
import {notifyQueryResult} from "@common/helpers";
import {useSelector} from "react-redux";
import {changeAssistantChatStatus, getChat, postChatMessage, readChatMessages} from "@store/services/aiServices";
import ChatMessages from "@containers/ChatMessages";
import Preloader from "@components/Preloader";
import classes from './index.module.scss'

const OrganizationChatPage = ({history}) => {
  const [assistantID] = useSearchParam('assistant')
  const [userID] = useSearchParam('user')

  const isClientSide = userID === null

  const user = useSelector(state => state.userStore.user);

  const containerRef = useRef(null);

  const [chat, setChat] = useState({
    assistant: null,
    id: null,
    organization: null,
    user,
    user_role: null,
    assistant_enabled: true,
    chat_by_org_user: false
  });


  const toggleIsAiEnabled = async () => {
    setChat(prevState => ({
      ...prevState,
      chat_by_org_user: !prevState.chat_by_org_user
    }))

    const res = await notifyQueryResult(changeAssistantChatStatus({
      chat: chat.id,
      chat_by_org_user: !chat.chat_by_org_user
    }))

    if (!res?.success) {
      setChat(prevState => ({
        ...prevState,
        chat_by_org_user: !prevState.chat_by_org_user
      }))
    }
  }

  const fetchChat = useCallback(() => {
    return notifyQueryResult(getChat({
      assistant: assistantID,
      user: userID ?? user?.id,
    }))
  }, [assistantID, user?.id, userID]);

  const handleChatFormSubmit = async ({text}) => {
    if (chat.id) {
      notifyQueryResult(postChatMessage({
        chat: chat.id,
        text,
      }))
    }
  }

  const readChat = useCallback(() => {
    if (chat.id) {
      readChatMessages(chat.id)
        .catch(e => console.error(e));
    }
  }, [chat.id])

  useEffect(() => {
    fetchChat()
      .then(res => {
        if (res?.success) {
          setChat(res.data)
        }
      })
  }, [fetchChat]);

  useEffect(() => {
    void readChat()

    return () => {
      void readChat()
    }
  }, [readChat]);

  if (!chat.id) return <Preloader/>

  return (
    <div className={classes.root}>
      <MobileTopHeader
        title={'Греф Ольга Владимировна'}
        onBack={() => history.goBack()}
        onMenu={() => {
        }}
      />

      <FullHeightContainer includeHeader rootRef={containerRef} className={classes.content} id="chat-container">
        <div style={{flexGrow: 1}} className="container">
          <ChatMessages
            chat={chat}
            className={classes.messages}
          />
        </div>

        <div className={classNames(classes.controls)}>
          {!isClientSide && (
            <div className="container" style={{marginBottom: 18}}>
              {chat.chat_by_org_user ? (
                <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT} onClick={toggleIsAiEnabled}>
                  {translate('Вернуть переписку AI Ассистенту', 'org.aiAssistant.returnChat')}
                </WideButton>
              ) : (
                <WideButton variant={WIDE_BUTTON_VARIANTS.ACCEPT_CONTAINED} onClick={toggleIsAiEnabled}>
                  {translate('Начать переписку без AI Ассистента', 'org.aiAssistant.chatWithoutAi')}
                </WideButton>
              )}
            </div>
          )}

          <div className={classNames('container', classes.messageFieldWrapper)}>
            {!chat.chat_by_org_user  ? (
              <div className={classes.note}>
                <div className={classes.noteIconContainer}>
                  <AIIcon
                    className={classes.noteIcon}
                  />
                </div>
                <p>
                  {translate('AI Ассистент ведет переписку автоматически', 'org.aiAssistant.returnChatNote')}
                </p>
              </div>
            ) : (
              <CommentForm className={classes.messageField} onSubmit={handleChatFormSubmit}/>
            )}
          </div>
        </div>
      </FullHeightContainer>
    </div>
  );
};

export default OrganizationChatPage;