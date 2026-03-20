import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../Preloader";
import PropTypes from "prop-types";
import { POSTS_VIEWS } from "../../common/constants";
import EmptyData from "../../pages/CartsPage/empty";
import classNames from "classnames";
import PostFeedCard from "../Cards/PostFeedCard";
import PostGridCard from "../Cards/PostGridCard";
import "./index.scss";
import SubscriptionsSkeleton from "@components/SubscriptionsSkeleton/SubscriptionsSkeleton";

const PostsList = ({
  posts,
  getNext,
  hasMore,
  view,
  user,
  EmptyComponent = EmptyData,
  ...other
}) => {
  return (
    <div className="posts-list" {...other}>
      {!posts.length && !hasMore && <EmptyComponent />}
      <InfiniteScroll
        dataLength={posts.length}
        next={getNext}
        hasMore={hasMore}
        loader={<SubscriptionsSkeleton padding={true} length={21} />}
      >
        {!!posts.length && (
          <div
            className={classNames(
              "posts-list__inner",
              view === POSTS_VIEWS.FEED && "grid_layout__inner",
              view === POSTS_VIEWS.GRID && "shop-grid-view"
            )}
          >
            {posts.map((post) =>
              view === POSTS_VIEWS.FEED ? (
                <PostFeedCard
                  noShadow={true}
                  key={post.id}
                  post={post}
                  organization={post.organization}
                  isGuest={!user}
                />
              ) : (
                <PostGridCard
                  key={post.id}
                  post={post}
                  organization={post.organization}
                  isGuest={!user}
                />
              )
            )}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

PostsList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
  getNext: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  view: PropTypes.oneOf(Object.keys(POSTS_VIEWS)).isRequired,

  user: PropTypes.object,
  EmptyComponent: PropTypes.any,
};

export default PostsList;
