import React, { useCallback, useEffect, useRef, useState } from "react";
import MobileTopHeader from "../../../../components/MobileTopHeader";
import { translate } from "../../../../locales/locales";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  clearOrganizationCategoryCache,
  getOrganizationSubcategoriesByPost,
} from "../../../../store/actions/organizationActions";
import {
  addRelatedPosts,
  getRelatedPosts,
  setOrganization,
  sortPosts,
  toggleSelectedPost,
} from "../../../../store/actions/stockActions";
import { stickyActiveShadow } from "../../../../common/utils";
import ShopControls from "../../../../components/ShopControls";
import SelectablePostsList from "../../SelectablePostsList";

const RelatedItems = ({ postID, onBack, onSubmit }) => {
  const dispatch = useDispatch();
  const { page, subcategories, posts, loading } = useSelector(
    (state) => state.stockStore.organization
  );
  const selectedPosts = useSelector(
    (state) => state.stockStore.selectedPosts.data
  );
  const { orgSubcategories } = useSelector(
    (state) => ({
      orgSubcategories: state.organizationStore.orgSubcategories.data,
    }),
    shallowEqual
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const shadowObserverRef = useRef(null);
  const isFirstEnter = useRef(true);

  const sortPostsCallback = useCallback(
    (postA, postB) => {
      const isPostASelected = selectedPosts.includes(postA.id);
      const isPostBSelected = selectedPosts.includes(postB.id);
      if (isPostASelected === isPostBSelected) return 0;
      if (isPostASelected && !isPostBSelected) return -1;
      return 1;
    },
    [selectedPosts]
  );

  useEffect(() => {
    dispatch(getOrganizationSubcategoriesByPost(postID));
  }, [dispatch, postID]);
  useEffect(() => {
    if (isFirstEnter.current) {
      dispatch(setOrganization({ page: 1 }));
      dispatch(clearOrganizationCategoryCache());
      dispatch(
        getRelatedPosts(postID, {
          subcategories: null,
          isNext: false,
          hasMore: true,
        })
      ).then(() => {
        dispatch(sortPosts(sortPostsCallback));
      });
    }

    isFirstEnter.current = false;
  }, [dispatch, posts, postID, sortPostsCallback]);
  useEffect(() => {
    shadowObserverRef.current = stickyActiveShadow();

    return () => {
      if (shadowObserverRef.current) shadowObserverRef.current.disconnect();
    };
  }, []);

  const handleSubcategorySelect = async (catID) => {
    if (subcategories !== catID) {
      await dispatch(
        getRelatedPosts(postID, {
          isNext: false,
          hasMore: true,
          page: 1,
          subcategories: catID,
          posts: null,
        })
      );
      dispatch(sortPosts(sortPostsCallback));
    }
  };
  const getNext = () => {
    const nextPage = page + 1;

    if (nextPage <= posts.total_pages) {
      dispatch(
        getRelatedPosts(postID, {
          isNext: true,
          page: page + 1,
        })
      );
    }
  };
  const handlePostClick = (targetPostID) => {
    dispatch(toggleSelectedPost(targetPostID));
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await dispatch(
      addRelatedPosts(postID, { shop_items_set: selectedPosts })
    );
    if (res.success) {
      setIsSubmitting(false);
      onSubmit(res);
    }
  };

  return (
    <div>
      <MobileTopHeader
        onBack={onBack}
        title={translate("Выбрать связи", "app.selectRelations")}
        onNext={handleSubmit}
        nextLabel={translate("Готово", "app.done")}
        disabled={isSubmitting}
      />
      <div className="sticky posts-view__sticky container">
        <ShopControls
          selectedCategory={subcategories}
          categories={orgSubcategories}
          onCategorySelect={(cat) =>
            handleSubcategorySelect(cat ? cat.id : null)
          }
          disableShadows
          className="posts-view__shop-controls"
        />
      </div>
      <div className="container">
        <SelectablePostsList
          selectedPosts={selectedPosts}
          posts={posts}
          onPostClick={handlePostClick}
          loading={loading}
          infiniteScrollProps={{
            next: getNext,
          }}
        />
      </div>
    </div>
  );
};

export default RelatedItems;
