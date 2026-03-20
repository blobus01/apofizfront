import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { DEFAULT_LIMIT } from "../../../../../common/constants";
import { canGoBack } from "../../../../../common/helpers";
import { getCollectionItems } from "../../../../../store/services/collectionServices";
import Notify from "../../../../Notification";
import Preloader from "../../../../Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import SelectablePostsList from "../../../../SelectablePostsList";
import "../../index.scss";

const ImageSelection = ({ onSelect, collectionID }) => {
  const initialPosts = {
    total_pages: 1,
    total_count: 0,
    list: [],
  };
  const history = useHistory();
  const LIMIT = DEFAULT_LIMIT;
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);

  const goBack = useCallback(() => {
    canGoBack(history) ? history.goBack() : history.push("/saved");
  }, [history]);

  const fetchPosts = useCallback(
    async (id, queryParams) => {
      const queryRes = await getCollectionItems(id, queryParams);
      if (queryRes.success) {
        return queryRes.data;
      } else {
        Notify.error({
          text: queryRes.message,
        });
        goBack();
      }
    },
    [goBack]
  );

  const fetchNextPosts = async () => {
    try {
      const newPosts = await fetchPosts(collectionID, {
        page: page + 1,
        limit: LIMIT,
      });
      setPage((prevPage) => prevPage + 1);
      setPosts((prevPosts) => ({
        ...newPosts,
        list: prevPosts.list.concat(newPosts.list),
      }));
    } catch (e) {}
  };

  const handleChange = (selectedPostsIDs) => {
    const selectedPostID = selectedPostsIDs[0];
    if (!selectedPostID) return;
    const selectedPost = posts.list.find((post) => post.id === selectedPostID);
    onSelect(selectedPost ?? null);
  };

  useEffect(() => {
    fetchPosts(collectionID, {
      page: 1,
      limit: LIMIT,
    })
      .then((res) => {
        setPosts(res);
      })
      .finally(() => setIsLoading(false));
  }, [fetchPosts, collectionID, LIMIT]);

  const hasMore = posts.total_pages > page;

  return (
    <div className="collection-edit-form__image-selection">
      <InfiniteScroll
        next={fetchNextPosts}
        hasMore={hasMore}
        loader={<Preloader />}
        dataLength={posts.list.length}
        className="container"
      >
        {isLoading && <Preloader />}
        <SelectablePostsList
          posts={posts.list}
          onChange={handleChange}
          className="collection-edit-form__image-selection-list"
        />
      </InfiniteScroll>
    </div>
  );
};

export default ImageSelection;
