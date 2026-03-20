import React, {useEffect, useRef} from 'react';
import ShopControlsWithViewChange from "@components/ShopControls/ShopControlsWithViewChange";
import useSearchParam from "@hooks/useSearchParam";
import {SEARCH_PARAMS} from "../../constants";
import {POSTS_VIEWS} from "@common/constants";
import useCategories from "../../hooks/useCategories";
import useCurrentCategory from "../../hooks/useCurrentCategory";
import useSearchParams from "@hooks/useSearchParams";
import useObjectSearchParam from "../../hooks/useObjectSearchParam";

const ShopControls = () => {
  const [postsView, setPostsView] = useSearchParam(SEARCH_PARAMS.posts_view, POSTS_VIEWS.FEED)
  const [category] = useSearchParam(SEARCH_PARAMS.category, null)

  const rootRef = useRef(null);

  const hasCategorySelected = !!category

  const changeResumesView = newView => setPostsView(newView)

  useEffect(() => {
    const handler = () => {
      const rootElement = rootRef.current
      if (!rootElement) return;

      const scrollY = window.scrollY
      const stickyClassName = 'resumes__shop-controls-wrap--sticky'

      if (scrollY === 0) {
        return rootElement.classList.remove(stickyClassName)
      }

      rootElement.classList.add(stickyClassName)
    }

    window.addEventListener('scroll', handler)

    return () => window.removeEventListener('scroll', handler)
  }, []);

  let content = <Categories
    view={postsView}
    onViewChange={changeResumesView}
    rootRef={rootRef}
  />

  if (hasCategorySelected)
    content = <Subcategories
      category={category}
      view={postsView}
      onViewChange={changeResumesView}
    />

  return (
    <div className="resumes__shop-controls-wrap" ref={rootRef}>
      {content}
    </div>
  );
};

const Categories = ({view, onViewChange}) => {
  const resumeCategories = useCategories()
  const setSearchParams = useSearchParams()[1]
  const [region] = useObjectSearchParam(SEARCH_PARAMS.region)

  const handleSelect = cat => {
    setSearchParams({
      [SEARCH_PARAMS.category]: cat ? cat.id : null,
      [SEARCH_PARAMS.region]: region && JSON.stringify(region)
    }, {replace: false, merge: false})
  }

  return (
    <ShopControlsWithViewChange
      view={view}
      onViewChange={onViewChange}
      categories={resumeCategories.data ?? []}
      onCategorySelect={handleSelect}
      className="container resumes__shop-controls"
    />
  );
}

const Subcategories = ({category, view, onViewChange}) => {
  const setSearchParams = useSearchParams()[1]
  const [subcategory] = useSearchParam(SEARCH_PARAMS.subcategory, null)
  const {data: currentCategory} = useCurrentCategory(category ? Number(category) : category)
  const subcategories = currentCategory?.subcategories ?? []

  const handleSelect = cat => {
    setSearchParams({
      [SEARCH_PARAMS.subcategory]: cat ? cat.id : null,
      [SEARCH_PARAMS.subcategories]: null
    })
  }

  return (
    <ShopControlsWithViewChange
      view={view}
      onViewChange={onViewChange}
      selectedCategory={subcategory ? Number(subcategory) : subcategory}
      categories={subcategories}
      onCategorySelect={handleSelect}
      className="container resumes__shop-controls"
    />
  );
}

export default ShopControls;