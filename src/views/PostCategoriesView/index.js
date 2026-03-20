import React from "react";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import Preloader from "../../components/Preloader";
import PostCategoryList from "../../components/PostCategoryList";
import Loader from "@components/UI/Loader";

const PostCategoriesView = ({
  onBack,
  onNext,
  categories,
  onSelect,
  onSubmit,
  selected,
  loading,
  isSubmitting,
}) => {
  const handleSelect = (...args) => {
    !isSubmitting && onSelect(...args);
  };

  return (
    <div>
      <MobileTopHeader
        onBack={onBack}
        title={translate("Выберите категорию", "category.selectCategory")}
        onNext={onNext}
        onSubmit={onSubmit}
        nextLabel={
          isSubmitting ? (
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {translate("Создание", "app.creating")}
              <Loader />
            </span>
          ) : (
            <span>{translate("Далее", "app.next")}</span>
          )
        }
        isSubmitting={isSubmitting}
        style={{
          marginBottom: "1rem",
        }}
      />

      {loading && !categories.length && <Preloader />}

      <PostCategoryList
        categories={categories}
        selectedSubcategories={selected}
        selectedSubcategory={selected}
        onSelect={handleSelect}
        className="container"
        style={{
          paddingBottom: "2rem",
        }}
      />
    </div>
  );
};

export default PostCategoriesView;
