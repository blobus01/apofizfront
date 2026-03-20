import React, { useEffect, useState } from "react";
import FullHeightContainer from "../../components/FullHeightContainer";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import PostSubcategoriesList from "../../components/PostSubcategoriesList";
import WideButton, {
  WIDE_BUTTON_VARIANTS,
} from "../../components/UI/WideButton";
import { setGlobalMenu } from "../../store/actions/commonActions";
import { MENU_TYPES } from "../../components/GlobalMenu";
import Notify from "../../components/Notification";
import { useDispatch, useSelector } from "react-redux";
import Preloader from "../../components/Preloader";
import {
  createPostSubCategory,
  getPostSubCategories,
  removePostSubCategory,
  updatePostSubCategory,
} from "../../store/actions/postActions";
import "./index.scss";

const SubcategoriesView = ({
  onBack,
  categoryID,
  orgID,
  selected: defaultSelected,
  submitButtonLabel,
  onSubmit,
  isSubmitting,
}) => {
  const dispatch = useDispatch();
  const { loading, data: category } = useSelector(
    (state) => state.postStore.postSubCategories
  );
  const canAddOwnSubcategory = !!orgID;

  const [selectedSubcategory, setSelectedSubcategory] =
    useState(defaultSelected);

  const handleSelect = (cat) => {
    setSelectedSubcategory(cat);
  };

  const handleEdit = async (cat) => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.category_edit_menu,
        menuLabel: translate("Изменить категорию", "category.change"),
        subcategory: cat,
        onUpdate: async ({ name }) => {
          const res = await dispatch(updatePostSubCategory(cat.id, name));
          if (res && res.success) {
            Notify.success({
              text: translate("Категория обнавлена", "category.updated"),
            });
          } else {
            Notify.error({
              text: translate(
                "Не уделось обновить категорию",
                "notify.categoryUpdateFailure"
              ),
            });
          }
          dispatch(setGlobalMenu(null));
        },
        onRemove: async () => {
          const res = await dispatch(removePostSubCategory(cat.id));
          if (res && res.success) {
            Notify.success({
              text: translate("Категория удалена", "category.deleted"),
            });
          } else {
            Notify.error({
              text: translate(
                "Не уделось удалить категорию",
                "notify.categoryDeleteFailure"
              ),
            });
          }
          dispatch(setGlobalMenu(null));
        },
      })
    );
  };

  const handleCategoryAdding = async () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.category_creation_menu,
        menuLabel: translate("Новая категория", "category.new"),
        onSubmit: async (values) => {
          if (values.name) {
            const res = await dispatch(
              createPostSubCategory({
                category: categoryID,
                name: values.name,
                organization: orgID,
              })
            );
            if (res.success) {
              Notify.success({
                text: translate("Категория создана", "category.created"),
              });
            } else {
              Notify.error({
                text: res.message,
              });
            }
            dispatch(setGlobalMenu(null));
          }
        },
      })
    );
  };

  useEffect(() => {
    dispatch(
      getPostSubCategories(categoryID, orgID ? { organization: orgID } : {})
    );
  }, [dispatch, categoryID, orgID]);

  return (
    <FullHeightContainer
      includeNavbar={false}
      className="event-subcategories-view"
    >
      <MobileTopHeader
        onBack={onBack}
        title={translate("Выберите категорию", "category.selectCategory")}
        onNext={() => {
          let selected = null;
          if (selectedSubcategory) {
            selected =
              category.subcategories.find(
                (SC) => SC.id === selectedSubcategory.id
              ) ?? null;
          }
          onSubmit(selected);
        }}
        nextLabel={submitButtonLabel}
        isSubmitting={isSubmitting}
        style={{
          marginBottom: "1rem",
        }}
      />

      {loading && <Preloader />}

      <div className="event-subcategories-view__list-wrap">
        {category && !loading && (
          <PostSubcategoriesList
            onEdit={handleEdit}
            subcategories={category.subcategories}
            selected={selectedSubcategory?.id}
            onSelect={handleSelect}
            className="event-subcategories-view__list container"
          />
        )}
      </div>

      {canAddOwnSubcategory && (
        <div className="event-subcategories-view__bottom">
          <div className="container">
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.ACCEPT}
              onClick={handleCategoryAdding}
            >
              {translate("Добавить свою категорию", "category.addOwn")}
            </WideButton>
          </div>
        </div>
      )}
    </FullHeightContainer>
  );
};

export default SubcategoriesView;
