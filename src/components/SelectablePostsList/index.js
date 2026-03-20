import React from 'react';
import PropTypes from "prop-types";
import PostSelectCard from "../Cards/PostSelectCard";
import classNames from "classnames";
import "./index.scss"

const SelectablePostsList = ({posts, selected=[], className, onChange}) => {

  const handleSelect = id => {
    let newSelectedPosts
    if (selected.includes(id)) {
      newSelectedPosts = selected.filter(postID => postID !== id)
    } else {
      newSelectedPosts = [...selected, id]
    }
    onChange(newSelectedPosts)
  }

  return (
    <div className={classNames('selectable-posts-list', className)}>
      {posts.map(post => (
        <PostSelectCard
          post={post}
          selected={selected?.includes(post.id)}
          onClick={() => handleSelect(post.id)}
          key={post.id}
        />
      ))}
    </div>
  );
};

SelectablePostsList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object),
  selected: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func
}

export default SelectablePostsList;