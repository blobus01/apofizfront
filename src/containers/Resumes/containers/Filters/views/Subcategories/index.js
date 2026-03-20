import React from "react";
import MobileTopHeader from "../../../../../../components/MobileTopHeader";
import SubcategoryList from "../../../SubcategoryList";
import {useSelector} from "react-redux";

const Subcategories = ({onBack}) => {
  const {data: currentCategory} = useSelector(state => state.postStore.postSubCategories)

  return (
    <>
      <MobileTopHeader
        onBack={onBack}
        title={currentCategory?.name}
        style={{marginBottom: '1rem'}}
      />
      <SubcategoryList className="container"/>
    </>
  );
};

export default Subcategories;