import React from "react";
import classnames from "classnames";
import { withRouter } from "react-router";
import {
  CollectionIcon,
  GearIcon,
  MailIcon,
  PhoneCallIcon,
  WebIcon,
} from "../../UI/Icons";
import OrgAvatar from "../../UI/OrgAvatar";
import { MyLink } from "../../MyLink";
import { HOTLINK_TYPES } from "../../../common/constants";
import {
  EMAIL_REGEX,
  PHONE_NUMBER,
  POST_LINK_REGEX,
} from "../../../common/helpers";
import { translate } from "../../../locales/locales";
import config from "../../../config";
import "./index.scss";

const HotlinkCard = ({ orgID, hotlink, canEdit, history, className }) => {
  let link = `#`;
  let isMail = false;
  let isPhone = false;
  let isPost = false;
  let icon = null;
  let title = null;

  if (hotlink.link_type === HOTLINK_TYPES.link) {
    link = hotlink.content;
    icon = <WebIcon color="#FFF" />;
    title = translate("Ссылка", "app.link");
    if (POST_LINK_REGEX.test(hotlink.content)) {
      isPost = true;
    }
  }

  if (hotlink.link_type === HOTLINK_TYPES.contact) {
    if (PHONE_NUMBER.test(hotlink.content)) {
      isPhone = true;
      icon = <PhoneCallIcon color="#FFF" />;
      title = translate("Контакт", "app.contact");
      link = `tel:${hotlink.content}`;
    }

    if (EMAIL_REGEX.test(hotlink.content)) {
      isMail = true;
      icon = <MailIcon color="#FFF" />;
      title = translate("Почта", "app.email");
      link = `mailto:${hotlink.content}`;
    }
  }

  if (hotlink.link_type === HOTLINK_TYPES.partners) {
    link = `${config.baseURL}/home/partners/${hotlink.linked_organization.id}`;
  }

  if (hotlink.link_type === HOTLINK_TYPES.collection) {
    link = `/organizations/${orgID}/collections/${hotlink.id}`;
    title = translate("Подборка", "app.compilation");
    icon = <CollectionIcon color="#FFF" />;
  }

  return (
    <div
      className={classnames(
        "hotlink-card",
        isMail && "mail",
        isPhone && "phone",
        className
      )}
    >
      <MyLink
        href={link}
        className="hotlink-card__image"
        isExternal={
          !isPost &&
          hotlink.link_type !== HOTLINK_TYPES.collection &&
          hotlink.link_type !== HOTLINK_TYPES.partners
        }
      >
        {canEdit && (
          <button
            className="hotlink-card__settings"
            onClick={(e) => {
              e.preventDefault();
              history.push(`/organizations/${orgID}/hotlinks/${hotlink.id}`);
            }}
          >
            <GearIcon />
          </button>
        )}
        <img className="hotlink-card__images-hover" src={hotlink.image.file} alt={hotlink.image.name} />
        {hotlink.linked_organization && (
          <>
            <div className="hotlink-card__organization">
              <OrgAvatar
                src={
                  hotlink.linked_organization.image &&
                  hotlink.linked_organization.image.medium
                }
                alt={hotlink.linked_organization.title}
                size={30}
                className="hotlink-card__organization-avatar"
              />
              {hotlink.linked_organization.types &&
                hotlink.linked_organization.types[0] && (
                  <div className="hotlink-card__organization-title">
                    {hotlink.linked_organization.types[0].title}
                  </div>
                )}
            </div>
          </>
        )}
        {!isPost && !hotlink.linked_organization && (
          <div className="hotlink-card__type">
            {icon}
            <span className="f-16 f-400">{title}</span>
          </div>
        )}
        {!isPost && <div className="hotlink-card__gradient" />}
      </MyLink>
      <MyLink href={link} className="hotlink-card__title f-14 f-400" isExternal>
        {hotlink.link_type === HOTLINK_TYPES.partners
          ? translate("Партнеров: {count}", "hotlink.partnersCount", {
              count: hotlink.partners_count,
            })
          : hotlink.title}
      </MyLink>
    </div>
  );
};

export default withRouter(HotlinkCard);
