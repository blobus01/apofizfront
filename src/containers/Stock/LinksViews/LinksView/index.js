import PropTypes from "prop-types";
import React, { useState } from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";

import * as classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useTransition } from "react-spring";
import { Transition } from "react-spring/renderprops-universal";
import LinkItem from "../../../../components/LinkItem";
import Preloader from "../../../../components/Preloader";
import { getItemByLink } from "../../../../store/actions/stockActions";
import config from "../../../../config";
import { useRef } from "react";
import "./index.scss";
import { useEffect } from "react";

const apofizProductLinkRgx = new RegExp(
  `^${config.domain}\/p/\(\\d+)\/?$`,
  "i"
);

const LinksView = ({ onBack, links, setLinks }) => {
  const dispatch = useDispatch();
  const isFirstMount = useRef(true);

  const { loading } = useSelector((state) => state.stockStore.links);

  const [link, setLink] = useState("");

  const linksWithTransitions = useTransition(links, (link) => link.id, {
    from: { position: "relative", left: "100%" },
    enter: { left: "0%" },
    leave: { left: "100%" },

    delay: 200,
    config: {
      duration: 200,
      delay: 400,
    },
  });

  const [linkError, setLinkError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  const validateLink = (link) => {
    if (!apofizProductLinkRgx.test(link)) {
      setLinkError({
        message:
          process.env.REACT_APP_ENV === "development"
            ? "Введите ссылку на товар c test.apofiz!"
            : "Введите ссылку на товар c Apofiz.com!",
      });
      return false;
    }
    const match = link.match(apofizProductLinkRgx);

    const productID = Number(match[1]);

    const isAlreadyExist = !!links.find((l) => {
      const currLinkMatch = l.link.match(apofizProductLinkRgx);
      const currProductID = Number(currLinkMatch[1]);
      return productID === currProductID;
    });

    if (isAlreadyExist) {
      setLinkError({ message: "Ссылка уже существует" });
      return false;
    }
    setLinkError(null);
    return true;
  };

  const handleChange = (e) => {
    setLink(e.target.value);
    linkError && setLinkError(null);
  };

  const handleInputSubmit = async (link) => {
    if (!validateLink(link)) {
      return;
    }

    const { success, data: newItemLink } = await dispatch(getItemByLink(link));
    if (success) {
      setLinks((prevState) => [{ ...newItemLink, link }, ...prevState]);
      setLink("");
    }
  };

  const handleLinkDeletion = (id) => {
    setLinks((prevVal) => prevVal.filter((link) => link.id !== id));
  };

  const handleSubmit = () => {
    onBack();
  };

  return (
    <div className="links-view">
      <MobileTopHeader
        title={translate("Связи с товаром", "stock.connectionsWithProduct")}
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel={translate("Готово", "app.done")}
        className="view-top-header"
      />

      <Transition />
      {loading && !links ? (
        <Preloader />
      ) : (
        <div className="container">
          <div className="links-view__desc f-14">
            <p>
              <b>{translate("Примечание", "printer.note")}</b>
              <i>
                {translate(
                  "Добавляйте ссылки на товары и создавайте готовые луки или товары на разные цвета. Ссылки доступны только на товары с ресурса",
                  "stock.createLinks"
                )}
              </i>
            </p>
            <b>{translate("Пример ссылки:", "stock.linkExample")}</b>{" "}
            <span className="links-view__link-example">
              https://apofiz.com/p/1234?ref=1234
            </span>
          </div>

          <h3 className="links-view__form-title f-20 f-500">
            {translate("Добавление ссылок на товары", "stock.addingLinks")}
          </h3>

          <div
            className={classnames(
              "links-view__input-box",
              linkError ? "links-view__input-box_error" : null
            )}
          >
            <input
              type="text"
              size={5}
              className="links-view__input"
              value={link}
              placeholder={translate(
                "ссылка на товар Apofiz.com",
                "app.linkToApofizPost"
              )}
              onChange={handleChange}
              onSubmit={(e) => {
                e.preventDefault();
                void handleInputSubmit();
              }}
              onClick={(e) => {
                setIsFocused(true);
                e.target.select();
              }}
              onBlur={() => setIsFocused(false)}
              onFocus={(e) => e.target.select()}
              readOnly={!isFocused}
            />
            <button
              className="links-view__submit-button f-14"
              onClick={(e) => {
                e.preventDefault();
                void handleInputSubmit(link);
              }}
            >
              {translate("Добавить", "dialog.add")}
            </button>
          </div>
          {linkError && (
            <div className="links-view__error-label">{linkError?.message}</div>
          )}

          <div
            className={classnames(
              "links-view__list",
              linksWithTransitions.length !== 0 && "links-view__list_not-empty"
            )}
          >
            {linksWithTransitions.map((link) => {
              return (
                <LinkItem
                  link={link.item}
                  onDelete={handleLinkDeletion}
                  className="links-view__list-item"
                  key={link.item.id}
                  style={isFirstMount.current ? null : link.props}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

LinksView.propTypes = {
  productID: PropTypes.number,
};

export default LinksView;
