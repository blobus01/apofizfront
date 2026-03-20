import React from 'react';
import useCurrentCategory from "../../hooks/useCurrentCategory";
import Preloader from "../../../../components/Preloader";
import {useFormikContext} from "formik";
import {SEARCH_PARAMS} from "../../constants";
import PostSubcategoriesList from "../../../../components/PostSubcategoriesList";

const Subcategories = ({...rest}) => {
  const {values, setFieldValue} = useFormikContext()

  const {data: currentCategory, loading} = useCurrentCategory(Number(values[SEARCH_PARAMS.category]))

  const handleSelect = targetCat => {
    const currentSubcategories = values[SEARCH_PARAMS.subcategories]
    const isExist = !!currentSubcategories.find(cat => cat.id === targetCat.id)

    setFieldValue(SEARCH_PARAMS.subcategories, isExist ?
      currentSubcategories.filter(cat => cat.id !== targetCat.id) :
      [...currentSubcategories, {...targetCat, category: currentCategory.id}])
  }

  if (loading && !currentCategory) return <Preloader/>

  return (
    <PostSubcategoriesList
      selected={values[SEARCH_PARAMS.subcategories].map(cat => cat.id)}
      subcategories={currentCategory?.subcategories ?? []}
      onSelect={handleSelect}
      {...rest}
    />
  );
};

export default Subcategories;