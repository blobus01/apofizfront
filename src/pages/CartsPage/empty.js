import React from "react";
import MockImage from "../../assets/images/empty_cart.png";
import RoundLink from "../../components/UI/RoundLink";
import { translate } from "../../locales/locales";
import { ButtonWithContent } from "@components/UI/Buttons";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { HomeIcon } from "./icons";

const EmptyData = ({ searched, darkTheme }) => {
  const history = useHistory();

  return (
    <div className="carts-page__empty">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: '100%',
          position: 'relative'
        }}
      >
        <img
          src={MockImage}
          alt="Carts empty"
          className="carts-page__empty-image"
        />
        <p className="carts-page__empty-title f-16 f-600" style={{ color: darkTheme ? "#FFF" :  "" } }>
          {searched
            ? translate(
                "По поисковому запросу ничего не найдено",
                "search.requestNoResult"
              )
            : translate("У вас пока нет заказов", "shop.noOrdersYet")}
        </p>
      </div>
      {/* <RoundLink
        label={translate("Перейти на ленту", "shop.goToFeed")}
        to="/home/posts"
        className="carts-page__empty-link"
      /> */}
      <Link to="/home/posts" className="create__folder">
        <p>{translate("Перейти на ленту", "shop.goToFeed")}</p>
        <div style={{ borderRadius: "0 16px 16px 0" }}>
          <HomeIcon />
        </div>
      </Link>
    </div>
  );
};

export default EmptyData;
