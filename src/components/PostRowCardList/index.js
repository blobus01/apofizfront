import React from 'react';
import PostRowCard from "../Cards/PostRowCard";
import classNames from "classnames";
import "./index.scss"

const PostRowCardList = ({posts, generateProps, className}) => {
  return (
    <div className={classNames('post-row-card-list', className)}>
      {posts.map(post => {
        const props = (generateProps && generateProps(post)) ?? {}
        return (
          <PostRowCard
            post={post}
            {...props}
            className={classNames('post-row-card-list__item', props.className)}
            key={post.id}
          />
        )
      })}
    </div>
  );
};

export default PostRowCardList;