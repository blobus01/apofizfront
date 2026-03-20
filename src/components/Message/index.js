import React from 'react';
import {Link} from "react-router-dom";
import * as classnames from 'classnames';
import TruncatedText from '../UI/TruncatedText';
import {parseDateTime} from '../../common/utils';
import RecipientsCount from '../RecipientsCount';
import {MESSAGE_TYPES} from '../../pages/MessageCreatePage';
import PartnersCount from '../PartnersCount';
import Avatar from "../UI/Avatar";
import TokenParser from "../UI/TokenParser/TokenParser";
import {BubbleComment} from "../UI/Icons";
import {translate} from '../../locales/locales';
import './index.scss';

const Message = ({ organizationID, message, className }) => {
  const { sender, content, created_at, organization, organization_address, sender_role } = message;

  return (
    <div className={classnames("message__wrap", className)}>
      <Link to={`/organizations/${organizationID}`} className="message__avatar-wrap">
        <Avatar
          src={(sender && sender.avatar && sender.avatar.medium) || (organization && organization.image.medium)}
          alt={(sender && sender.full_name) || (organization && organization.title)}
          className="message__avatar"
          size={40}
        />
      </Link>
      <div className="message__body">
        <span className="message__bubble-icon"><BubbleComment/></span>
        {organization && (
          <div className="f-500 message__info">
            <Link to={`/organizations/${organizationID}`} className="f-15 tl message__info-title">{organization.title}</Link>
            <p className="f-12 message__info-subtitle">{organization_address}</p>
          </div>
        )}

        {sender && (
          <div className="f-500 message__info">
            <Link to={`/organizations/${organizationID}`} className="f-15 tl message__info-title">{sender.full_name}</Link>
            <p className="f-12 message__info-subtitle">{sender_role || translate("Собственник", "app.owner")}</p>
          </div>
        )}

        <TruncatedText lines={2} className="message__text f-15">
          <TokenParser
            text={content}
          />
        </TruncatedText>

        <div className="message__footer">
          {getMessageReceivers(message, organizationID)}
          <div className="message__time">{parseDateTime(created_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;

const getMessageReceivers = ({ message_to, receivers, receivers_count, receiver_partners, receiver_partner_count }, organizationID) => {
  if (message_to === MESSAGE_TYPES.partners_members) {
    return (
      <PartnersCount
        partners={receiver_partners}
        count={receiver_partner_count}
        organizationID={organizationID}
        className="message__group-partners"
      />
    )
  }

  if (message_to === MESSAGE_TYPES.organization_followers) {
    return (
      <RecipientsCount
        followers={receivers}
        count={receivers_count}
        organizationID={organizationID}
        className="message__group-followers"
      />
    )
  }

  if (message_to === MESSAGE_TYPES.partners_followers) {
    return (
      <div className="message__group">
        <PartnersCount
          partners={receiver_partners}
          count={receiver_partner_count}
          organizationID={organizationID}
          className="message__group-partners"
        />

        <RecipientsCount
          followers={receivers}
          count={receivers_count}
          organizationID={organizationID}
          className="message__group-followers"
        />
      </div>
    )
  }

  return null;
}