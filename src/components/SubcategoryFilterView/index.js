import React from "react";
import * as classnames from "classnames";
import MobileTopHeader from "../MobileTopHeader";
import { SubCategoryOption } from "../SubCategoryOption";
import { translate } from "../../locales/locales";
import { ORDERING_OPTIONS } from "../CategoryFilterView";
import Button from "../UI/Button";
import "./index.scss";

const SubcategoryFilterView = ({
  selectedCategory,
  activeList,
  onBack,
  orderBy,
  onClear,
  onSelect,
  onOrderingSelect,
  onApply,
  disableSorting,
}) => {
  return (
    <div className="subcategory-filter-view">
      <MobileTopHeader
        onBack={() => onBack(false)}
        title={selectedCategory.name}
        renderRight={() =>
          (onClear || selectedCategory) && (
            <button
              type="button"
              onClick={onClear}
              className="subcategory-filter-view__clear f-14"
            >
              {translate("Очистить", "app.clear")}
            </button>
          )
        }
      />
      <div className="subcategory-filter-view__content">
        <div className="container containerMax">
          {!disableSorting && (
            <div className="subcategory-filter-view__ordering">
              {ORDERING_OPTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onOrderingSelect(item)}
                  className={classnames(
                    "subcategory-filter-view__ordering-item f-14",
                    orderBy === item.value && "active"
                  )}
                >
                  {translate(item.label, item.translation)}
                </button>
              ))}
            </div>
          )}
          <div className="subcategory-filter-view__list">
            {selectedCategory.subcategories.map((category) => (
              <SubCategoryOption
                key={category.id}
                label={category.name}
                icon={category.icon}
                isActive={activeList.includes(category.id)}
                option={category}
                className="subcategory-filter-view__option"
                onClick={() =>
                  onSelect({ parentID: selectedCategory.id, ...category })
                }
              />
            ))}
          </div>
        </div>

        {onApply && (
          <div className="container subcategory-filter-view__button-container">
            <Button
              type="button"
              label={translate("Показать", "app.show")}
              onClick={() => onApply(true)}
              className="subcategory-filter-view__button"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryFilterView;
