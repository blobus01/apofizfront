import React, { useEffect, useRef, useState } from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";
import ShopControls from "../../../../components/ShopControls";
import { InfoTitle } from "../../../../components/UI/InfoTitle";
import SelectablePostsList from "../../../../components/SelectablePostsList";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getOrganizationSubcategoriesByPost } from "../../../../store/actions/organizationActions";
import {
  addRelatedPosts,
  getRelatedPostsList,
  getSelectedPosts,
} from "../../../../store/actions/stockActions";
import { DEFAULT_LIMIT } from "../../../../common/constants";
import { notifyQueryResult } from "../../../../common/helpers";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../../../components/Preloader";
import { stickyActiveShadow } from "../../../../common/utils";

const Associations = ({ eventID, onBack }) => {
  const dispatch = useDispatch();
  const LIMIT = DEFAULT_LIMIT;
  const { orgSubcategories } = useSelector(
    (state) => ({
      orgSubcategories: state.organizationStore.orgSubcategories.data,
    }),
    shallowEqual
  );

  console.log(orgSubcategories);
  

  const [posts, setPosts] = useState({
    total_count: 0,
    total_pages: 0,
    list: [],
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [selectedPosts, setSelectedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shadowObserverRef = useRef(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await dispatch(
      addRelatedPosts(eventID, { shop_items_set: selectedPosts })
    );
    if (res.success) {
      onBack();
    }
  };

  const handelCategorySelect = (cat) => {
    setSelectedSubcategory(cat ? cat.id : null);
  };

  const getNext = async () => {
    const res = await notifyQueryResult(
      getRelatedPostsList(eventID, {
        page,
        limit: LIMIT,
        subcategory: selectedSubcategory,
      })
    );
    if (res && res.success) {
      const requestData = res.data;
      setPosts((prevState) => ({
        ...requestData,
        list: prevState.list.concat(requestData.list),
      }));
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    dispatch(getOrganizationSubcategoriesByPost(eventID));
    dispatch(getSelectedPosts(eventID)).then((res) => {
      if (res && res.success) setSelectedPosts(res.data);
    });
  }, [dispatch, eventID]);

  useEffect(() => {
    setPosts({
      total_count: 0,
      total_pages: 0,
      list: [],
    });
    setPage(1);
    setIsPostsLoading(true);
    notifyQueryResult(
      getRelatedPostsList(eventID, {
        page: 1,
        limit: LIMIT,
        subcategory: selectedSubcategory,
      })
    ).then((res) => {
      if (res && res.success) {
        setPosts(res.data);
        setPage((prevPage) => prevPage + 1);
        setIsPostsLoading(false);
      }
    });
  }, [LIMIT, dispatch, eventID, selectedSubcategory]);

  useEffect(() => {
    shadowObserverRef.current = stickyActiveShadow();

    return () => {
      if (shadowObserverRef.current) shadowObserverRef.current.disconnect();
    };
  }, []);

  return (
    <div className="event-settings__associations-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate(
          "Выбор ассоциаций",
          "events.settings.associationsSelect"
        )}
        onNext={handleSubmit}
        nextLabel={translate("Готово", "app.done")}
        isSubmitting={isSubmitting}
        disabled={isSubmitting}
        className="event-settings__associations-view-header"
      />
      <div className="sticky event-settings__associations-view-shop-controls-container container">
        <ShopControls
          selectedCategory={selectedSubcategory}
          categories={orgSubcategories}
          onCategorySelect={handelCategorySelect}
          className="event-settings__associations-view-shop-controls"
          disableShadows
        />
      </div>

      <div className="container">
        <InfoTitle
          title={translate("Примечание", "printer.note")}
          className="event-settings__title"
        />
        <p className="event-settings__desc event-settings__associations-view-desc">
          {translate(
            "Добавьте похожие мероприятия или виды билетов. Если у вас разные цены и категории билетов, на одно мероприятие вы можете их объединить в  похожих товарах для удобства пользователей.",
            "events.settings.associationsInfo"
          )}
        </p>

        <InfiniteScroll
          next={getNext}
          hasMore={posts.total_pages !== page - 1}
          loader={<Preloader />}
          dataLength={posts.list.length}
        >
          {isPostsLoading && posts.list.length === 0 && <Preloader />}
          <SelectablePostsList
            posts={posts.list}
            selected={selectedPosts}
            onChange={(selectedPostsIDs) => setSelectedPosts(selectedPostsIDs)}
            className="event-settings__associations-view-list"
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Associations;
