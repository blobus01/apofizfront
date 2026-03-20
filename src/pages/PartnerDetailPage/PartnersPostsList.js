import React, { useEffect } from "react";
import PostsList from "../../components/PostsList";
import { useDispatch, useSelector } from "react-redux";
import {
  changePartnerPostsView,
  getPartnerPosts,
  getPartnersCategories,
} from "../../store/actions/partnerActions";
import ShopControlsWithViewChange from "../../components/ShopControls/ShopControlsWithViewChange";
import EmptyData from "../SubscriptionsPostsPage/empty";

const PartnersPostsList = ({ partnerID, searchParam }) => {
  const dispatch = useDispatch();
  const {
    data: posts,
    page,
    view,
    category,
  } = useSelector((state) => state.partnerStore.partnerPosts);
  const { data: categories } = useSelector(
    (state) => state.partnerStore.partnerCategories
  );
  const user = useSelector((state) => state.userStore.user);

  useEffect(() => {
    dispatch(
      getPartnerPosts(partnerID, {
        page: 1,
        data: null,
      })
    );
    dispatch(getPartnersCategories(partnerID));
  }, [dispatch, partnerID]);

  const getNext = () => {
    dispatch(
      getPartnerPosts(partnerID, {
        page: page + 1,
      })
    );
  };
  const handleViewChange = (newView) => {
    dispatch(changePartnerPostsView(newView));
    dispatch(
      getPartnerPosts(partnerID, {
        page: 1,
        data: null,
      })
    );
  };

  const handleCategoryClick = (cat) => {
    dispatch(
      getPartnerPosts(partnerID, {
        page: 1,
        data: null,
        category: cat ? cat.id : null,
      })
    );
  };

  useEffect(() => {
    dispatch(
      getPartnerPosts(partnerID, {
        page: 1,
        data: null,
        search: searchParam,
      })
    );
  }, [dispatch, partnerID, searchParam]);

  return (
    <div className="container container--no-padding">
      <div
        className="sticky"
        style={{
          borderRadius: "16px",
          margin: "5px 0",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <ShopControlsWithViewChange
          view={view}
          onViewChange={handleViewChange}
          categories={categories}
          onCategorySelect={handleCategoryClick}
          selectedCategory={category}
          style={{
            paddingLeft: 15,
          }}
        />
      </div>
      <PostsList
        hasMore={!posts || posts.total_pages !== page}
        posts={posts?.list ?? []}
        view={view}
        getNext={getNext}
        user={user}
        EmptyComponent={() => <EmptyData />}
        className="partner-detail-page__posts-list"
      />
    </div>
  );
};

export default React.memo(PartnersPostsList);
