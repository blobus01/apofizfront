import React, { useEffect, useRef } from "react";
import { translate } from "../../locales/locales";
import ScrollContainer from "react-indiana-drag-scroll";
import * as classnames from "classnames";
import { nullable } from "../../common/helpers";
import PropTypes from "prop-types";

import "./index.scss";
import { useDispatch } from "react-redux";
import { setCategories } from "@store/actions/categoriesActions";

const ShopControls = ({
  selectedCategory,
  categories,
  onCategorySelect,
  disableShadows,
  scrollContainerProps = {},
  scrollContainerRef,
  className,
  darkTheme,
  setIsFilterOpen,
}) => {
  const selectedCategoryRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCategories(categories));
  }, [categories, dispatch]);

  useEffect(() => {
    if (selectedCategoryRef.current) {
      selectedCategoryRef.current.scrollIntoView();
    }
  }, []);

  return (
    <div className={classnames("shop-controls-list-wrap", className)}>
      <ScrollContainer
        className="shop-controls-list__container"
        {...scrollContainerProps}
        innerRef={scrollContainerRef}
      >
        <ul className="shop-controls-list">
          <li
            className={classnames(
              "shop-controls-list__item",
              selectedCategory === null && "active",
              darkTheme && "shop-controls-list__item--dark",
            )}
            onClick={() => selectedCategory !== null && onCategorySelect(null)}
          >
            {translate("Все", "app.all")}
          </li>
          {categories &&
            categories.map((cat) => (
              <li
                className={classnames(
                  "shop-controls-list__item f-14",
                  selectedCategory === cat.id && "active",
                )}
                ref={
                  selectedCategory === cat.id ? selectedCategoryRef : undefined
                }
                key={cat.id}
                onClick={() =>
                  selectedCategory !== cat.id && onCategorySelect(cat)
                }
                style={{ borderColor: "#007aff;" }}
              >
                {cat?.sub_icon ? (
                  <div
                    className="shop-controls-list__image-wrap-sub"
                    style={{
                      borderRadius: "8px",
                      marginRight: "10px",
                      display: 'flex',
                      alignItems:'center'
                    }}
                  >
                    <img
                      className={"shop-controls-list__image-sub"}
                      src={cat?.sub_icon?.file}
                      alt={cat.name}
                      loading="lazy"
                      style={{
                        objectFit: "cover",
                        width: "24px",
                        height: "24px",
                        borderRadius: "8px",
                        boxShadow:
                          "0 0 0 1px #fff, 0 0 4px 0 rgba(0, 0,0,0.25)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="shop-controls-list__image-wrap">
                    <img
                      className={"shop-controls-list__image"}
                      src={cat?.icon?.small}
                      alt={cat.name}
                      loading="lazy"
                    />
                  </div>
                )}
                <span>{cat.name ?? cat.title}</span>
              </li>
            ))}
        </ul>
      </ScrollContainer>

      {!disableShadows && !darkTheme && (
        <div className="shop-controls-list-shadow" />
      )}
    </div>
  );
};

export const ShopControlsPropTypes = {
  selectedCategory: nullable(PropTypes.number.isRequired),
  categories: nullable(PropTypes.arrayOf(PropTypes.object).isRequired),
  onCategorySelect: PropTypes.func,
  disableShadows: PropTypes.bool,
  className: PropTypes.string,
};

ShopControls.propTypes = ShopControlsPropTypes;

ShopControls.defaultProps = {
  disableShadows: false,
  selectedCategory: null,
};

export default ShopControls;
