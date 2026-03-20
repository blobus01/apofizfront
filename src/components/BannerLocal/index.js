import React from "react";
import OrgAvatar from "../UI/OrgAvatar";
import { getRandomElementFromArray } from "../../common/utils";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import "./index.scss";

const MESSAGES = [
  (title, type, discount, intl) =>
    intl.formatMessage(
      {
        id: "banner.text1",
        defaultMessage:
          "Теперь вы можете посещать {type} {title} со скидкой до {discount}%",
      },
      { type, title, discount }
    ),
  (title, type, discount, intl) =>
    intl.formatMessage(
      {
        id: "banner.text2",
        defaultMessage:
          "Специально для Вас {type} {title} подготовила скидки до {discount}%",
      },
      { type, title, discount }
    ),
  (title, type, discount, intl) =>
    intl.formatMessage(
      {
        id: "banner.text3",
        defaultMessage: "{type} {title} дарит скидку до {discount}%",
      },
      { type, title, discount }
    ),
  (title, type, discount, intl) =>
    intl.formatMessage(
      {
        id: "banner.text4",
        defaultMessage:
          "Уже сегодня {type} {title} подарит Вам скидку до {discount}%",
      },
      { type, title, discount }
    ),
  (title, type, discount, intl) =>
    intl.formatMessage(
      {
        id: "banner.text5",
        defaultMessage:
          "Раскажите всем {type} {title} дарит теперь скидки до {discount}%",
      },
      { type, title, discount }
    ),
];

const MAX_LENGTH = 19;

const getBannerText = (title, type = "", discount, intl) => {
  let shortenTitle = title;
  if (title.length > MAX_LENGTH) {
    shortenTitle = title?.slice(0, MAX_LENGTH) + "...";
  }
  return getRandomElementFromArray(MESSAGES)(
    shortenTitle,
    type,
    discount,
    intl
  );
};

const BannerLocal = ({ banner, background }) => {
  const { id, image, max_discount, title, types } = banner;
  const intl = useIntl();

  return (
    <Link
      className="banner-local"
      style={{ background }}
      to={`/organizations/${id}`}
    >
      <div className="banner-local__inner">
        <OrgAvatar
          src={image && image.medium}
          alt={title}
          size={60}
          className="banner-local__left"
        />
        <div className="banner-local__right">
          <h4 className="banner-local__title f-16 f-600 tl">{title}</h4>
          <p className="banner-local__desc f-14 f-400">
            {getBannerText(
              title,
              types[0] && types[0].title,
              max_discount,
              intl
            )}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BannerLocal;
