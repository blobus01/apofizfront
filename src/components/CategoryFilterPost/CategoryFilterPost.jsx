import React, { useEffect, useState } from "react";
import classes from "./index.module.scss";
import classNames from "classnames";
import { translate } from "@locales/locales";
import { FilterIcon } from "./icons";
import { ButtonWithContent } from "@components/UI/Buttons";
import Preloader from "@components/Preloader";
import Loader from "@components/UI/Loader";
import { DoneIcon } from "@components/UI/Icons";
import MobileTopHeader from "@components/MobileTopHeader";

const CategoryFilterPost = ({
  isOpen,
  onClose,
  onClear,
  filters,
  setFilters,
  categoryList,
  setCategoryList,
  orderingOptions,
  onApply,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const { categories = [], ordering } = filters;

  const fetchInitialPosts = () => {
    // 1️⃣ сбрасываем локальные фильтры
    setFilters({
      categories: [],
      ordering: null,
    });
    // 2️⃣ вызываем очистку в родителе
    onClear?.();

    // 3️⃣ закрываем модалку
    onClose();
  };

  const handleOrderingSelect = (value) => {
    setFilters((prev) => ({
      ...prev,
      ordering: value,
    }));
  };

  const toggleCategory = (category) => {
    setFilters((prev) => {
      const current = prev.categories || [];
      const isSelected = current.includes(category.id);

      return {
        ...prev,
        categories: isSelected
          ? current.filter((id) => id !== category.id)
          : [...current, category.id],
      };
    });
  };

  const fetchFilteredPosts = () => {
    onClose();

    if (typeof onApply === "function") {
      onApply(filters);
    }
  };
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  return (
    <div
      className={classNames(classes.overlay, visible && classes.overlayOpen)}
      onClick={onClose}
    >
      <div
        className={classNames(
          classes.filterWrapper,
          visible && classes.filterWrapperOpen,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <MobileTopHeader
          title={translate("Фильтры", "shop.filters")}
          // filterCount={
          //   (filters.categories?.length || 0) + (filters.ordering ? 1 : 0)
          // }
          renderRight={() => {
            return (
              <div>
                <button
                  type="button"
                  onClick={fetchInitialPosts}
                  className={classes.clear}
                >
                  {translate("Очистить", "app.clear")}
                </button>
              </div>
            );
          }}
          onBack={onClose}
        />
        <div className={classes.filterOrdering}>
          {orderingOptions.map((item, idx) => {
            const isActive = ordering === item.value;

            return (
              <button
                key={idx}
                type="button"
                className={classNames(
                  classes.filterOrderingBtn,
                  isActive && classes.filterOrderingBtnActive,
                )}
                onClick={() => handleOrderingSelect(item.value)}
              >
                {translate(item.label, item.translation)}
              </button>
            );
          })}
        </div>

        <div className={classes.content}>
          {loadingPosts ? (
            <Preloader />
          ) : (
            (categoryList || []).map((category) => {
              const isSelected = (filters.categories || []).includes(
                category.id,
              );

              return (
                <div
                  key={category.id}
                  className={classNames(
                    classes.contentItem,
                    isSelected && classes.contentItemActive,
                  )}
                  onClick={() => toggleCategory(category)}
                >
                  <div className={classes.contentItemText}>
                    <img
                      className={classes.icon}
                      src={`${category?.icon?.file}`}
                      alt=""
                    />
                    {category?.name}
                  </div>
                  {isSelected && <DoneIcon />}
                </div>
              );
            })
          )}
        </div>
        <div className={classes.footer}>
          <ButtonWithContent
            label={translate("Показать", "app.show")}
            radiusOrg={true}
            children={loading ? <Loader color={"#fff"} /> : <FilterIcon />}
            onClick={fetchFilteredPosts}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterPost;
