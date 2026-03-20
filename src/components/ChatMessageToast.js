import React from "react";
import PropTypes from "prop-types";
import "./ChatMessageToast.scss";

const ChatMessageToast = ({ avatar, name, text, time }) => (
  <div className="chat-toast">
    <img className="chat-toast__avatar" src={avatar} alt={name} />
    <div className="chat-toast__content">
      <div className="chat-toast__header">
        <span className="chat-toast__name">{name}</span>
        <span className="chat-toast__time">{time}</span>
      </div>
      <div className="chat-toast__text">{text}</div>
    </div>
  </div>
);

ChatMessageToast.propTypes = {
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};

export default ChatMessageToast;
