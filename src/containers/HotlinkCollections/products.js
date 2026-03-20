import React, { useEffect, useState, useRef } from "react";
import { prettyFloatMoney } from "../../common/utils";
import { ImageWithPlaceholder } from "../../components/ImageWithPlaceholder";
import { ArrowRight, BackArrow, CheckedIcon } from "../../components/UI/Icons";
import Preloader from "../../components/Preloader";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios-api";
import ScrollContainer from "react-indiana-drag-scroll";
import * as classnames from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { translate } from "@locales/locales";

import "./index.scss";
import { RightIcon } from "@components/Cards/NotificationCard/icons";

const CollectionItems = ({
  formikBag,
  searchValue,
  selectedSubcategory,
  ordering,
  setFilters,
  categories,
  setIsFilterOpen,
}) => {
  const { values, setFieldValue } = formikBag;
  const { orgID } = useParams(); // orgID из UR

  let id = orgID;

  const [items, setItems] = useState([]); // товары
  const [page, setPage] = useState(1); // номер страницы
  const [hasMore, setHasMore] = useState(true); // есть ли ещё данные
  const selectedCategoryRef = useRef(null);

  const scrollContainerRef = useRef(null);

  const handlePrevClick = () => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };

  const handleNextClick = () => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  const loadItems = async (pageNumber = 1) => {
    try {
      let url = `/organizations/${id}/collection_items/?page=${pageNumber}&limit=21`;

      if (Array.isArray(selectedSubcategory) && selectedSubcategory.length) {
        url += `&subcategory_id=${selectedSubcategory.join(",")}`;
      }

      if (searchValue?.trim()) {
        url += `&search=${encodeURIComponent(searchValue)}`;
      }

      if (ordering) {
        url += `&ordering=${ordering}`;
      }

      const res = await axios.get(url);
      const list = res.data.list || [];

      if (pageNumber === 1) {
        setItems(list);
      } else {
        setItems((prev) => [...prev, ...list]);
      }

      setHasMore(list.length === 21);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadItems(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadItems(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchValue, selectedSubcategory, ordering, id]);

  // ---------------- LOAD NEXT PAGE ----------------
  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage, false);
  };

  // ---------------- CATEGORY SELECT ----------------
  const handleCategorySelect = (cat) => {
    const id = cat ? cat.id : null;

    setFilters((prev) => {
      const current = prev.categories || [];

      if (!id) {
        return { ...prev, categories: [] };
      }

      const isSelected = current.includes(id);

      return {
        ...prev,
        categories: isSelected
          ? current.filter((c) => c !== id)
          : [...current, id],
      };
    });
  };

  const visibleCategories = selectedSubcategory?.length
    ? categories.filter((cat) => selectedSubcategory.includes(cat.id))
    : categories;
  // ---------------- RENDER ----------------
  if (!items.length && hasMore) return <Preloader />;

  return (
    <div className="hotlink-collection-form__content">
      {/* Категории */}
      <div className="shop-controls">
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <button
            type="button"
            className="shop-controls-arrow left"
            onClick={handlePrevClick}
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={handlePrevClick}
              className="prev"
              style={{ cursor: "pointer" }}
            >
              <path
                d="M8 2L2 8L8 14"
                stroke="#007AFF"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="shop-controls-arrow"
            onClick={handleNextClick}
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleNextClick}
              className="next"
              style={{ cursor: "pointer" }}
            >
              <path
                d="M2 14L8 8L2 2"
                stroke="#007AFF"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div>
          <button
            type="button"
            style={{ color: "#007aff", fontSize: "14px" }}
            className="shop-controls-show-all"
            onClick={() => setIsFilterOpen(true)}
          >
            {translate("Показать все", "app.showAll")}
          </button>
        </div>
      </div>
      <ScrollContainer
        innerRef={scrollContainerRef}
        className="shop-controls-list__container"
        style={{ maxWidth: "1140px", margin: "0 auto" }}
      >
        <ul className="shop-controls-list" style={{ padding: "5px 10px 20px" }}>
          <li
            className={classnames(
              "shop-controls-list__item f-14",
              selectedSubcategory === null && "active",
            )}
            onClick={() => handleCategorySelect(null)}
            style={
              selectedSubcategory === null
                ? { color: "#fff", borderColor: "#4285f4" }
                : { color: "#4285f4", borderColor: "#4285f4" }
            }
          >
            {translate("Все", "app.all")}
          </li>

          {visibleCategories.map((cat) => (
            <li
              key={cat.id}
              className={classnames(
                "shop-controls-list__item f-14",
                selectedSubcategory?.includes(cat.id) && "active",
              )}
              onClick={() => handleCategorySelect(cat)}
              ref={
                selectedSubcategory?.includes(cat.id)
                  ? selectedCategoryRef
                  : undefined
              }
              style={{ borderColor: "#4285f4" }}
            >
              {cat.icon && (
                <div className="shop-controls-list__image-wrap">
                  <img
                    src={cat.icon.small || cat.icon}
                    alt={cat.name}
                    className="shop-controls-list__image"
                    loading="lazy"
                  />
                </div>
              )}

              <span
              // style={
              //   selectedSubcategory === cat.id
              //     ? { color: "#fff" }
              //     : { color: "#4285f4" }
              // }
              >
                {cat.name}
              </span>
            </li>
          ))}
        </ul>
      </ScrollContainer>

      {/* Товары */}
      <div className="container">
        <InfiniteScroll
          dataLength={items.length}
          next={loadNextPage}
          hasMore={hasMore}
          loader={<Preloader />}
        >
          <div className="hotlink-collection-form__products">
            {items.map((post) => (
              <PostItem
                key={post.id}
                post={{
                  ...post,
                  is_selected:
                    values.selectedItems[post.id] ?? post.is_selected,
                }}
                onChange={(value) =>
                  setFieldValue("selectedItems", {
                    ...values.selectedItems,
                    ...value,
                  })
                }
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

// ---------------- POST ITEM COMPONENT ----------------
const PostItem = ({ post, onChange }) => {
  const [selected, setSelected] = useState(post.is_selected);

  const clickHandler = () => {
    const newValue = !selected;
    setSelected(newValue);
    onChange({ [post.id]: newValue });
  };

  return (
    <div className="hotlink-collection-form__product" onClick={clickHandler}>
      <div className="hotlink-collection-form__product-image">
        <ImageWithPlaceholder
          src={
            post.image?.medium || post.image?.small || post.image?.large || ""
          }
          alt={post.name}
        />
        {selected && (
          <CheckedIcon className="hotlink-collection-form__product-check" />
        )}
      </div>

      <div className="hotlink-collection-form__product-content">
        <div className="f-11 f-400">{post.name}</div>

        {post.price && (
          <div className="hotlink-collection-form__product-cost">
            <p className="hotlink-collection-form__product-amount f-12 f-500">
              {prettyFloatMoney(post.discounted_price, false, post.currency)}
            </p>

            {post.subcategory_name && (
              <p className="hotlink-collection-form__product-category f-11">
                {post.subcategory_name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionItems;
