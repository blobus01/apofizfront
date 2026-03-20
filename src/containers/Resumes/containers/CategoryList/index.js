import React from 'react';
import useCategories from "../../hooks/useCategories";
import PostCategoryList from "../../../../components/PostCategoryList";
import Preloader from "../../../../components/Preloader";

const CategoryList = props => {
  const {className} = props
  const {loading, data: categories} = useCategories()

  if (loading && !categories) return <Preloader className={className} />

  return (
    <PostCategoryList
      categories={categories}
      className={className}
      {...props}
    />
  );
};

export default CategoryList;