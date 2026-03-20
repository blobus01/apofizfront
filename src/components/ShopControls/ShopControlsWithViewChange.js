import React from "react";
import PropTypes from "prop-types";
import { ButtonShopViewSwitch } from "../UI/ButtonShopViewSwitch";
import ShopControls, { ShopControlsPropTypes } from "./index";
import { POSTS_VIEWS } from "../../common/constants";
import classnames from "classnames";

import "./index.scss";
import { translate } from "@locales/locales";

const ShopControlsWithViewChange = ({
  onViewChange,
  view,
  className,
  style,
  button,
  darkTheme,
  scrollContainerRef,

  ...other
}) => {
  return (
    <div
      className={classnames(
        "shop-controls-with-view-change",
        className,
        darkTheme && "shop-controls-with-view-change--dark",
      )}
      style={style}
    >
      {/* TODO: refactor or create a new button cause it cannot be used when new view added */}
      <div style={{ display: "flex" }}>
        {!button && (
          <ButtonShopViewSwitch
            onChange={() =>
              onViewChange(
                view === POSTS_VIEWS.FEED ? POSTS_VIEWS.GRID : POSTS_VIEWS.FEED,
              )
            }
            active={view === POSTS_VIEWS.FEED}
            className="shop-controls-with-view-change__button"
          />
        )}
        <ShopControls
          darkTheme={darkTheme}
          className="shop-controls-with-view-change__shop-controls"
          {...other}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
    </div>
  );
};

ShopControlsWithViewChange.propTypes = {
  view: PropTypes.oneOf(Object.keys(POSTS_VIEWS)).isRequired,
  onViewChange: PropTypes.func.isRequired,
  ...ShopControlsPropTypes,
};

export default ShopControlsWithViewChange;
