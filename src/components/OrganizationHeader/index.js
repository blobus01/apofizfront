import React, { useEffect, useState } from "react";
import * as classnames from "classnames";
import OrgAvatar from "../UI/OrgAvatar";
import { shortenNumber } from "../../common/helpers";
import { Link } from "react-router-dom";
import { translate } from "../../locales/locales";
import { B2BIcon, LockIcon, QuestionIcon } from "../UI/Icons";
import ShadowBan from "../ShadowBan";
import OrgVerification from "../UI/OrgVerification";
import "./index.scss";

const OrganizationHeader = ({
  id,
  title,
  image,
  types,
  subscribers,
  isBanned,
  isPrivate,
  isWholesale,
  isSubscribed,
  perm,
  verification_status,
  user,
  size,
  classNames,
  categories,
  proceedDiscount,
  darkTheme,
}) => {
  const [shadowBanIsOpen, setShadowBanIsOpen] = useState(false);

  const showShadowBan = () => {
    setShadowBanIsOpen(!shadowBanIsOpen);
  };

  useEffect(() => {}, []);

  const content = (
    <>
      <OrgAvatar
        src={image && image.large}
        alt={title}
        size={size ? size : 80}
        darkTheme={darkTheme}
        className={
          proceedDiscount
            ? "organization-header__avatar organization-header__avatar--absolute-discount"
            : classNames
              ? "organization-header__avatar"
              : "organization-header__avatar organization-header__avatar--absolute"
        }
      />
      <div
        className="organization-header__right"
        style={
          classNames
            ? {
                paddingLeft: "20px",
                gap: "20px",
              }
            : { paddingLeft: "100px" }
        }
      >
        <div className="organization-header__title-wrap">
          <h1
            className={classnames(
              "organization-header__title f-20 f-700 dfc",
              isBanned &&
                ((perm && perm.is_owner) ||
                  (perm && perm.can_edit_organization)) &&
                "organization-header__title--red",
            )}
            style={{
              color: darkTheme ? "#fff" : "",
              transition: "color 0.25s ease",
              marginBottom: "10px",
            }}
          >
            <OrgVerification
              status={verification_status}
              className="organization-header__verification"
            />
            {title || translate("Название приложения", "org.organizationTitle")}
          </h1>
        </div>
        <div className="dfc">
          {isWholesale && <B2BIcon className="organization-header__b2b-icon" />}
          <p
            className="organization-header__type f-12 tl"
            style={{
              color: darkTheme ? "#fff" : "",
              transition: "color 0.25s ease",
            }}
          >
            {categories
              ? categories
              : types && types[0]
                ? types[0].title
                : translate("Категория приложения", "org.organizationType")}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="organization-header">
      <div className="organization-header__link">{content}</div>

      {isBanned &&
      ((perm && perm.is_owner) || (perm && perm.can_edit_organization)) ? (
        <button type="button" onClick={showShadowBan}>
          <QuestionIcon />
        </button>
      ) : (
        isPrivate && isSubscribed && <LockIcon />
      )}

      <ShadowBan orgId={id} onBack={showShadowBan} isOpen={shadowBanIsOpen} />
    </div>
  );
};

export default OrganizationHeader;
