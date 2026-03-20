import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import Preloader from "../../components/Preloader";
import EmptyBox from "../../components/EmptyBox";
import PartnerCard from "../../components/Cards/PartnerCard";
import { getPartnersList } from "../../store/actions/homeActions";
import "./index.scss";
import { DarkTheme, LightTheme } from "@components/MobileTopHeader/icons";
import { setDarkThemeRT } from "@store/actions/themeDark";
import classNames from "classnames";

const DEFAULT_LIMIT = 10;

const PartnersPage = ({ history }) => {
  const dispatch = useDispatch();

  // Получаем данные из Redux
  const partnersList = useSelector((state) => state.homeStore.partnersList);
  const { data, loading } = partnersList;

  // Локальный стейт
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(DEFAULT_LIMIT);

  // Аналог componentDidMount
  useEffect(() => {
    dispatch(getPartnersList({ page: 1, limit, search: "", hasMore: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    if (value !== search) {
      setSearch(value);
      setPage(1);
      setHasMore(true);

      // Передаем value напрямую, так как стейт search обновится только при следующем рендере
      dispatch(
        getPartnersList({ page: 1, limit, search: value, hasMore: true }),
      );
    }
  };

  const handleSearchCancel = () => {
    if (search !== "") {
      setSearch("");
      setPage(1);
      setHasMore(true);

      dispatch(getPartnersList({ page: 1, limit, search: "", hasMore: true }));
    }
  };

  const getNext = (totalPages) => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      setHasMore(true);

      dispatch(
        getPartnersList(
          {
            page: nextPage,
            limit,
            search, // Здесь можно использовать стейт search, так как он не меняется в этой функции
            hasMore: true,
          },
          true,
        ),
      ); // true указывает на isNext
    } else {
      setHasMore(false);
    }
  };

  const darkTheme = useSelector((state) => state.theme.darkTheme);

  return (
    <div
      className={classNames("partners-page", {
        dark: darkTheme,
      })}
    >
      <MobileSearchHeader
        onBack={() => history.push("/home")}
        title="Партнеры"
        searchValue={search}
        renderRight={true}
        onSearchChange={handleSearchChange}
        onSearchCancel={handleSearchCancel}
        searchPlaceholder="Поиск партнеров"
      />

      <div className="partners-page__content">
        <div className="partners-page__list">
          <div className="container">
            {page === 1 && loading ? (
              <Preloader />
            ) : !data || (data && !data.total_count) ? (
              <EmptyBox
                title="Нет партнеров"
                description={!!search && "Поиск не дал результатов"}
              />
            ) : (
              <InfiniteScroll
                dataLength={Number(data.list.length) || 0}
                next={() => getNext(data.total_pages)}
                hasMore={hasMore}
                loader={null}
              >
                {data.list.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    darkTheme={darkTheme}
                    partner={partner}
                    to={`/home/partners/${partner.id}`}
                    className="partners-page__item"
                  />
                ))}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
