import React from "react";
import * as classnames from "classnames";
import MobileTopHeader from "../MobileTopHeader";
import { CategoryOption } from "../CategoryOption";
import { translate } from "../../locales/locales";
import Button from "../UI/Button";
import "./index.scss";
import { FilterIcon } from "@components/UI/Icons";

export const ORDERING_OPTIONS = [
  { value: null, label: "Новое", translation: "shop.new" },
  { value: "-price", label: "Дороже", translation: "shop.expensive" },
  { value: "price", label: "Дешевле", translation: "shop.cheaper" },
];

const CategoryFilterView = ({
  categories,
  onBack,
  orderBy,
  selectedSubcategories,
  onClear,
  onSelect,
  onOrderingSelect,
  setIsSorted,
}) => {
  return (
    <div className="category-filter-view">
      <MobileTopHeader
        onBack={() => onBack(false)}
        width={true}
        title={translate("Фильтры", "shop.filters")}
        filterCount={(selectedSubcategories?.length || 0) + (orderBy ? 1 : 0)}
        renderRight={() =>
          onClear &&
          (orderBy || !!selectedSubcategories.length) && (
            <div style={{ display: "flex" }}>
              <button
                type="button"
                onClick={onClear}
                className="category-filter-view__clear f-14"
              >
                {translate("Очистить", "app.clear")}
              </button>
            </div>
          )
        }
      />
      <div className="category-filter-view__content">
        <div className="category-filter-view__ordering">
          {ORDERING_OPTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOrderingSelect(item)}
              className={classnames(
                "category-filter-view__ordering-item f-14",
                orderBy === item.value && "active",
              )}
            >
              {translate(item.label, item.translation)}
            </button>
          ))}
        </div>
        <div className="category-filter-view__list">
          <div className="container containerMax">
            {categories.map((category) => (
              <CategoryOption
                key={category.id}
                label={category.name}
                icon={category.icon}
                description={selectedSubcategories
                  .filter((subcategory) => subcategory.parentID === category.id)
                  .map((item) => item.name)
                  .join(", ")}
                className="category-filter-view__option"
                onClick={() => onSelect(category)}
              />
            ))}
          </div>
        </div>

        <Button
          type="button"
          label={translate("Показать", "app.show")}
          onClick={() => onBack(true)}
          className="category-filter__btn"
        />
      </div>
    </div>
  );
};

export default CategoryFilterView;
