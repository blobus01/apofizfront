import React, { useCallback, useEffect, useRef } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import * as classnames from "classnames";
import { FilterIcon } from "../UI/Icons";
import { translate } from "../../locales/locales";
import "./index.scss";

const HorizontalFilterSelect = ({
  count,
  options = [],
  activeList = [],
  onSelect,
  onFilterClick,
  filter = true,
  showShadow = true,
  className,
}) => {
  const scrollContainerRef = useRef(null);
  const selectedOptionRef = useRef(null);

  const scrollIntoSelectedOption = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    const selectedOption = selectedOptionRef.current;
    if (scrollContainer && selectedOption) {
      const { offsetLeft } = selectedOption;
      offsetLeft && offsetLeft > 0 && scrollContainer.scrollTo(offsetLeft, 0);
    }
  }, []);

  useEffect(() => {
    scrollIntoSelectedOption();
  }, [scrollIntoSelectedOption]);

  return (
    <div className={classnames("horizontal-filter-select", className)}>
      {filter && (
        <>
          {!!count && (
            <div className="horizontal-filter-select__count">
              <span className="f-16">{count}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onFilterClick}
            className="horizontal-filter-select__filter"
          >
            <FilterIcon />
          </button>
        </>
      )}

      <div className="horizontal-filter-select__list-wrap">
        <ScrollContainer
          className="horizontal-filter-select__list-container"
          innerRef={scrollContainerRef}
        >
          <ul className="horizontal-filter-select__list">
            <li
              className={classnames("f14", activeList.length === 0 && "active")}
              onClick={() => onSelect(null)}
              style={
                activeList.length === 0
                  ? { color: "#fff", borderColor: "#4285f4" }
                  : { color: "#4285f4", borderColor: "#4285f4" }
              }
            >
              {translate("Все", "app.all")}
            </li>
            {options.map((option) => (
              <li
                key={option.id}
                className={classnames(
                  "f14",
                  activeList.includes(option.id) && "active"
                )}
                onClick={() => onSelect(option)}
                ref={
                  !selectedOptionRef.current && activeList.includes(option.id)
                    ? selectedOptionRef
                    : null
                }
                style={{ borderColor: "#4285f4" }}
              >
                <div className="horizontal-filter-select__image-wrap">
                  {option.icon && (
                    <img
                      src={option.icon.small}
                      className="horizontal-filter-select__image"
                      alt={option.name}
                    />
                  )}
                </div>
                <span
                  style={
                    activeList.includes(option.id)
                      ? { color: "#fff" }
                      : { color: "#4285f4" }
                  }
                >
                  {option.name}
                </span>
              </li>
            ))}
          </ul>
        </ScrollContainer>
        {showShadow && (
          <div className="horizontal-filter-select__list-shadow" />
        )}
      </div>
    </div>
  );
};

export default HorizontalFilterSelect;
