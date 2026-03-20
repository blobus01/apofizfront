import MobileTopHeader from '@components/MobileTopHeader';
import { translate } from '@locales/locales';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';

import axios from 'axios-api';
import { ImageWithPlaceholder } from '@components/ImageWithPlaceholder';
import { CheckedIcon, SearchIcon } from '@components/UI/Icons';
import { prettyFloatMoney } from '@common/utils';

import InfiniteScroll from "react-infinite-scroll-component";
import './index.scss';

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Loader from '@components/UI/Loader';
import { setChosenProduct } from '@store/actions/chosenProductActions';
import { setSearchState } from '@store/actions/userActions';
import ScrollContainer from 'react-indiana-drag-scroll';
import * as classnames from "classnames";


const CouponChoiceProduct = () => {

    const history = useHistory();
    const dispatch = useDispatch();
    const { id } = useParams();

    // основной список
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // поиск
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const isSearching = searchQuery.trim().length > 0;

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [categories, setCategories] = useState([])
    const selectedCategoryRef = useRef(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    const [searchPage, setSearchPage] = useState(1);
    const [searchHasMore, setSearchHasMore] = useState(true);

    const loadData = async (pageNumber) => {
        try {
            const url = selectedSubcategory
                ? `/organizations/${id}/collection_items/?subcategory_id=${selectedSubcategory}&page=${pageNumber}&limit=21&without_price=True`
                : `/organizations/${id}/collection_items/?page=${pageNumber}&limit=21&without_price=True`;


            const res = await axios.get(url);

            const list = res.data.list || [];

            if (pageNumber === 1) {
                setPosts(list);
            } else {
                setPosts(prev => [...prev, ...list]);
            }

            if (list.length === 0 || (res.data.list && res.data.list.length < 21)) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (err) {
            console.log("Ошибка:", err);
        }
    };

    const handelCategorySelect = (cat) => {
        const id = cat ? cat.id : null;

        setSelectedSubcategory(id);

        // сброс поиска
        setSearchQuery("");
        setSearchResults([]);
        setSearchPage(1);
        setSearchHasMore(true);

        // сброс списка
        setPosts([]);
        setPage(1);
        setHasMore(true);

        // загружаем новую категорию
        loadData(1);
    };

    const loadCategories = async () => {
        try {
            const res = await axios.get(
                `/organizations/${id}/collection_subcategories/?page=1&limit=100`
            );

            setCategories(res.data.list)

            console.log(res.data);
        } catch (err) {
            console.log("Ошибка загрузки категорий:", err);
        }
    };

    useEffect(() => {
        dispatch(setSearchState(true));
        loadCategories();
    }, []);

    // helper: нормализуем строку поиска (удаляем ведущие/замыкающие пробелы и сводим множественные пробелы к одному)
    const normalizeQuery = (q = "") => q.trim().replace(/\s+/g, " ");

    // search with pagination support
    const fetchSearch = async (query, pageNumber = 1) => {
        try {
            setSearchLoading(true);

            // нормализуем запрос перед отправкой на сервер
            const q = normalizeQuery(query);
            if (!q) {
                // если после нормализации пусто — сбрасываем результаты
                setSearchResults([]);
                setSearchHasMore(false);
                setSearchLoading(false);
                return;
            }

            const url = selectedSubcategory
                ? `/organizations/${id}/collection_items/?search=${encodeURIComponent(q)}&subcategory_id=${selectedSubcategory}&page=${pageNumber}&limit=21`
                : `/organizations/${id}/collection_items/?search=${encodeURIComponent(q)}&page=${pageNumber}&limit=21`;

            const res = await axios.get(url);

            const list = res.data.list || [];

            if (pageNumber === 1) {
                setSearchResults(list);
            } else {
                setSearchResults(prev => [...prev, ...list]);
            }

            // если вернулась короче лимита — больше страниц нет
            if (list.length === 0 || (res.data.list && res.data.list.length < 21)) {
                setSearchHasMore(false);
            } else {
                setSearchHasMore(true);
            }
        } catch (err) {
            console.log("Search error:", err);
        } finally {
            setSearchLoading(false);
        }
    };


    // Загрузка общего списка (пагинация)
    useEffect(() => {
        if (!isSearching) {
            loadData(page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isSearching]);

    // Когда меняется страница поиска — подгружаем следующую страницу результатов поиска
    useEffect(() => {
        if (isSearching) {
            fetchSearch(searchQuery, searchPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPage]);

    const handleSelect = (product) => {
        setSelectedProduct(product);
    };

    const handleSave = () => {
        if (!selectedProduct) return;

        dispatch(setSearchState(false));
        dispatch(setChosenProduct(selectedProduct));

        history.goBack();
    };

    const handleSearchClick = () => {
        setShowSearch(true);
    };

    const handleSearchCancel = () => {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        setSearchPage(1);
        setSearchHasMore(true);

        // сбрасываем основной список для перезагрузки (если нужно)
        setPosts([]);
        setPage(1);
        setHasMore(true);
        loadData(1);
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            const normalized = normalizeQuery(searchQuery);

            if (normalized === "") {
                // очистили поиск → показываем категорию / всё
                setSearchResults([]);
                setSearchHasMore(true);
                setSearchPage(1);

                setPosts([]);
                setPage(1);
                loadData(1);   // ← вот это важно
                return;
            }

            // новый поиск — начинаем с первой страницы
            setSearchPage(1);
            fetchSearch(normalized, 1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    console.log(posts);


    const renderPosts = (list) =>
        list
            .filter(post => {
                if (!selectedSubcategory) return true;

                const cat = categories.find(c => c.id === selectedSubcategory);
                if (!cat) return true;

                return post.subcategory_name === cat.name;
            })
            .map(post => {
                const isSelected = selectedProduct?.id === post.id;
                return (
                    <div
                        className="hotlink-collection-form-choice__product"
                        key={post.id}
                        onClick={() => handleSelect(post)}
                    >
                        <div className="hotlink-collection-form-choice__product-image">
                            <ImageWithPlaceholder
                                src={post.image?.medium || post.image?.small || post.image?.large || ""}
                                alt={post.name}
                            />
                            {isSelected && (
                                <CheckedIcon className="hotlink-collection-form-choice__product-check" />
                            )}
                        </div>

                        <div className="hotlink-collection-form-choice__product-content">
                            <div className="f-11 f-400">{post.name}</div>

                            <div className="hotlink-collection-form-choice__product-cost">
                                <p className="hotlink-collection-form__product-amount f-12 f-500">
                                    {prettyFloatMoney(post.discounted_price, false, post.currency)}
                                </p>

                                {post.subcategory_name && (
                                    <p className="hotlink-collection-form-choice__product-category f-11">
                                        {post.subcategory_name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            });

    return (
        <>

            <div style={{
                position: "sticky",
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                maxWidth: '1140px',
                margin: '0 auto',
                top: '0',
                background: '#fff',
                zIndex: '999'
            }}>


                <div className={`module-search ${showSearch ? "active" : ""}`}
                    style={{
                        maxWidth: '1140px',
                        margin: '0 auto',
                    }}
                >
                    <div className="module-search__search-file">
                        <SearchIcon />
                        <input
                            autoFocus
                            type="text"
                            className="module-search__input"
                            placeholder={translate('поиск', 'app.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className="module-search__cancel-btn" onClick={handleSearchCancel}>
                        Отменить
                    </button>
                </div>

                <MobileTopHeader
                    title={translate("Выбрать из товаров", "hotlink.chooseFromItems")}
                    onBack={() => {
                        history.goBack();
                        dispatch(setSearchState(false));
                    }}
                    renderRight={() =>
                        !showSearch ? (
                            <button className="mobile-search-header__icon-btn" onClick={handleSearchClick}>
                                <SearchIcon />
                            </button>
                        ) : null
                    }
                />
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                <ScrollContainer
                    className="shop-controls-list__container"
                    style={{ maxWidth: '1140px', margin: '0 auto' }}
                >
                    <ul className="shop-controls-list" style={{ padding: "5px 10px 20px" }}>
                        <li
                            className={classnames(
                                "shop-controls-list__item f-14",
                                selectedSubcategory === null && "active"
                            )}
                            onClick={() => selectedSubcategory !== null && handelCategorySelect(null)}
                            style={
                                selectedSubcategory === null
                                    ? { color: "#fff", borderColor: "#4285f4" }
                                    : { color: "#4285f4", borderColor: "#4285f4" }
                            }
                        >
                            {translate("Все", "app.all")}
                        </li>
                        {categories &&
                            categories.map((cat) => (
                                <li
                                    className={classnames(
                                        "shop-controls-list__item f-14",
                                        selectedSubcategory === cat.id && "active"
                                    )}
                                    ref={
                                        selectedSubcategory === cat.id ? selectedCategoryRef : undefined
                                    }
                                    key={cat.id}
                                    onClick={() =>
                                        selectedSubcategory !== cat.id && handelCategorySelect(cat)
                                    }
                                    style={{ borderColor: "#4285f4" }}
                                >
                                    {cat.icon && (
                                        <div className="shop-controls-list__image-wrap">
                                            <img
                                                className={"shop-controls-list__image"}
                                                src={cat.icon.small}
                                                alt={cat.name}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <span
                                        style={
                                            selectedSubcategory === cat.id
                                                ? { color: "#fff" }
                                                : { color: "#4285f4" }
                                        }
                                    >
                                        {cat.name ?? cat.title}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </ScrollContainer>
            </div>


            <div className="hotlink-collection-form-choice" style={{ paddingBottom: 70 }}>


                {isSearching ? (
                    <div className="hotlink-collection-form-choice__products">
                        {searchLoading ? (
                            <Loader />
                        ) : (
                            renderPosts(searchResults)
                        )}
                    </div>
                ) : (
                    <div style={{ width: "100%" }}>
                        <InfiniteScroll
                            dataLength={(isSearching ? searchResults : posts).length}
                            next={() => {
                                if (isSearching) {
                                    if (searchHasMore) setSearchPage(prev => prev + 1);
                                } else {
                                    if (hasMore) setPage(prev => prev + 1);
                                }
                            }}
                            hasMore={isSearching ? searchHasMore : hasMore}
                            loader={<p style={{ textAlign: "center", padding: 20 }}><Loader /></p>}
                        >
                            <div className="hotlink-collection-form-choice__products">
                                {isSearching ? renderPosts(searchResults) : renderPosts(posts)}
                            </div>
                        </InfiniteScroll>
                    </div>


                )}

                <button
                    className="hotlink-collection-choice__content-button-submit"
                    style={{ margin: "0px 15px" }}
                    onClick={handleSave}
                >
                    {translate("Добавить", "app.add")}
                </button>
            </div>
        </>
    );
};

export default CouponChoiceProduct;
