import React from 'react';
import PostsCollectionModule from "../../containers/PostsCollectionModule";
import qs from "qs";

const CollectionDetailPage = ({match, location}) => {
  const {id} = match.params
  const {title} = qs.parse(location.search.replace('?', ''))
  return (
    <PostsCollectionModule id={id} title={title} />
  );
};

export default CollectionDetailPage;