import React from 'react';
import EmptyImage from "../../../assets/images/empty_cart.png";
import {translate} from "../../../locales/locales";
import Preloader from "../../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import PostSelectCard from "../../../components/Cards/PostSelectCard";

import "./index.scss"

const SelectablePostsList = ({posts, loading, selectedPosts, onPostClick, infiniteScrollProps}) => {

  let postsArea = (
    <div className="rent-settings__selectable-posts-list__empty">
      <img src={EmptyImage} alt="Empty products" />
      <div className="f-16 f-600">{translate('У вас пока нет товаров', 'shop.posts.empty')}</div>
    </div>
  );

  if ((!posts || !posts.list.length) && loading) {
    postsArea = <Preloader className="rent-settings__selectable-posts-list__preloader" />;
  } else if (posts && posts.list.length) {
    postsArea = (
      <InfiniteScroll
        loader={<Preloader style={{marginTop: 20, paddingBlock: 20}} />}
        dataLength={Number(posts.list.length) || 0}
        hasMore={posts.list.length < posts.total_count}
        {...infiniteScrollProps}
        className="rent-settings__selectable-posts-list__shop-grid-view"
      >
        {posts.list.map(post => {
          return (
            <PostSelectCard
              post={post}
              onClick={() => onPostClick(post.id)}
              selected={selectedPosts.includes(post.id)}
              key={post.id}
            />
          );
        })}
      </InfiniteScroll>
    );
  }

  return (
    <div className="rent-settings__selectable-posts-list">
      {postsArea}
    </div>
  )
};

export default SelectablePostsList;