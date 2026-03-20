import React, { useEffect, useState } from "react";
import classNames from "classnames";
import MobileTopHeader from "@components/MobileTopHeader";
import { translate } from "@locales/locales";
import classes from "./index.module.scss";
import { ButtonWithContent } from "@components/UI/Buttons";
import { useSelector } from "react-redux";
import axios from "axios-api";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { DoneIcon } from "@components/UI/Icons";
import { useDispatch } from "react-redux";
import { FilterIcon } from "./icons";
import Preloader from "@components/Preloader";
import Loader from "@components/UI/Loader";

export const ORDERING_OPTIONS = [
  { value: null, label: "Новое", translation: "shop.new" },
  { value: "-price", label: "Дороже", translation: "shop.expensive" },
  { value: "price", label: "Дешевле", translation: "shop.cheaper" },
];

const CategoryFilterOrg = ({
  isOpen,
  onClose,
  onClear,
  filters,
  setFilters,
  categoryList,
  setCategoryList,
  orderingOptions,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const { categories: selectedCategoryIds, ordering } = filters;

  const dispatch = useDispatch();

  const { id } = useParams();

  const handleOrderingSelect = (value) => {
    setFilters((prev) => ({ ...prev, ordering: value }));
  };

  const toggleCategory = (category) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(category.id);

      return {
        ...prev,

        categories: exists
          ? prev.categories.filter((id) => id !== category.id)
          : [...prev.categories, category.id],

        categoryObjects: exists
          ? prev.categoryObjects.filter((c) => c.id !== category.id)
          : [...prev.categoryObjects, category],
      };
    });
  };

  useEffect(() => {
    if (categoryList.length > 0) return;

    const fetchSubCategory = async () => {
      try {
        setLoadingPosts(true);

        const response = await axios.get(`/shop/${id}/subcategories`);
        setCategoryList(response.data);
      } catch (error) {
        console.log("ERRORS CATEGORY", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchSubCategory();
  }, [categoryList.length, id]);

  const fetchFilteredPosts = async () => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        limit: 16,
        organization: id,
      };

      if (selectedCategoryIds.length) {
        params.subcategories = selectedCategoryIds.join(",");
      }

      if (ordering) {
        params.ordering = ordering;
      }
      const response = await axios.get("/shop/organization_items/", { params });

      const posts =
        response.data.list || response.data.results || response.data || [];

      dispatch({
        type: "REPLACE_ORGANIZATION_POSTS",
        payload: {
          posts,
          total: response.data.total,
        },
      });

      onClose();

      console.log("response from filtered posts", response);
    } catch (error) {
      console.error("ERROR FILTER POSTS", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialPosts = async () => {
    try {
      setLoading(true);

      const params = {
        page: 1,
        limit: 16,
        organization: id,
      };

      const response = await axios.get("/shop/organization_items/", { params });

      const posts =
        response.data.list || response.data.results || response.data || [];

      dispatch({
        type: "REPLACE_ORGANIZATION_POSTS",
        payload: {
          posts,
          total: response.data.total,
        },
      });

      setFilters({
        categories: [],
        ordering: null,
      });

      onClose();
    } catch (error) {
      console.error("ERROR RESET FILTERS", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden"; // html
      document.body.style.overflow = "hidden"; // body
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // даём браузеру применить initial styles
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          filterCount={
            (filters.categories?.length || 0) + (filters.ordering ? 1 : 0)
          }
          renderRight={() => {
            const hasCategories =
              Array.isArray(selectedCategoryIds) &&
              selectedCategoryIds.length > 0;

            const hasOrdering = Boolean(ordering);

            if (!hasCategories && !hasOrdering) return null;

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
            categoryList.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);

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
                    {category?.sub_icon ? (
                      <img
                        className={classes.subIcon}
                        src={`${category?.sub_icon?.file}`}
                        alt=""
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <img
                        className={classes.icon}
                        src={`${category?.icon?.file}`}
                        alt=""
                      />
                    )}
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

export default CategoryFilterOrg;
