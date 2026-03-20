import React, { useCallback, useEffect, useMemo, useState } from "react";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { translate } from "../../locales/locales";
import { canGoBack, getPostImage } from "../../common/helpers";
import { ImageWithPlaceholder } from "../../components/ImageWithPlaceholder";
import Truncate from "react-truncate";
import { Link } from "react-router-dom";
import { DEFAULT_LIMIT } from "../../common/constants";
import { getCollections } from "../../store/services/collectionServices";
import Notify from "../../components/Notification";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../components/Preloader";
import { debounce } from "../../common/utils";
import PlaceholderImage from "../../components/PlaceholderImage";
import "./index.scss";

const SavedPage = ({ history }) => {
  const LIMIT = DEFAULT_LIMIT;

  const [compilations, setCompilations] = useState({
    total_pages: 1,
    total_count: 0,
    list: [],
  });
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompilations = useCallback(async (queryParams) => {
    const res = await getCollections(queryParams);
    if (res.success) {
      return res.data;
    } else {
      Notify.error({
        text: translate("Что-то пошло не так", "app.fail"),
      });
      console.error(res.error);
      throw new Error(res.error);
    }
  }, []);

  const fetchNextCompilations = async () => {
    try {
      const newCompilations = await fetchCompilations({
        page: page + 1,
        limit: LIMIT,
        search: searchValue === "" ? undefined : searchValue,
      });
      setCompilations((prevCompilations) => ({
        ...newCompilations,
        list: prevCompilations.list.concat(newCompilations.list),
      }));
      setPage((prevPage) => prevPage + 1);
    } catch (e) {}
  };

  const changeSearchValue = useMemo(() => {
    return debounce((newSearch) => {
      setSearchValue(newSearch ?? "");
    }, 200);
  }, []);

  const handleSearch = (e) => {
    changeSearchValue(e.target.value);
  };

  useEffect(() => {
    setIsLoading(true);
    setCompilations({
      total_pages: 1,
      total_count: 0,
      list: [],
    });
    setPage(1);
    fetchCompilations({
      page: 1,
      limit: LIMIT,
      search: searchValue === "" ? undefined : searchValue,
    }).then((compilations) => {
      setCompilations(compilations);
      setIsLoading(false);
    });
  }, [fetchCompilations, LIMIT, searchValue]);

  const hasMore = compilations.total_pages !== page;

  return (
    <div className="saved-page">
      <MobileSearchHeader
        onSearchChange={handleSearch}
        onSearchCancel={() => setSearchValue("")}
        onBack={() =>
          canGoBack(history) ? history.goBack() : history.push("/profile")
        }
        title={translate("Избранное", "app.favorites")}
        className="saved-page__header"
      />

      <InfiniteScroll
        next={fetchNextCompilations}
        hasMore={hasMore}
        loader={<Preloader />}
        dataLength={compilations.list.length + 1}
        className="container"
      >
        <>
          <Compilation
            compilation={{
              name: translate("Избранное", "app.favorites"),
            }}
            image={
              <div className="saved-page__all-saved-item f-17 f-500">
                {translate("Все", "app.all")}
              </div>
            }
            to={`/saved/all/?title=${translate("Избранное", "app.favorites")}`}
          />
          {compilations.list.map((compilation) => (
            <Compilation
              compilation={compilation}
              image={
                !getPostImage(compilation.image) ? (
                  <PlaceholderImage
                    wrapperProps={{
                      className:
                        "saved-page__compilation-image saved-page__compilation-image--fixed-sized",
                    }}
                  />
                ) : null
              }
              to={`/saved/${compilation.id}?title=${compilation.name}`}
              key={compilation.id}
            />
          ))}
          {isLoading && <Preloader />}
        </>
      </InfiniteScroll>
    </div>
  );
};

const Compilation = ({ compilation, to, image }) => {
  return (
    <Link to={to} className="saved-page__compilation">
      {image ? (
        image
      ) : (
        <ImageWithPlaceholder
          src={getPostImage(compilation.image)}
          alt={compilation.name}
          loading="lazy"
          width={60}
          height={60}
          className="saved-page__compilation-image"
        />
      )}
      <div className="saved-page__compilation-content">
        <Truncate
          lines={2}
          ellipsis="..."
          className="saved-page__compilation-title f-17 f-500"
        >
          {compilation.name}
        </Truncate>
      </div>
    </Link>
  );
};

export default SavedPage;
