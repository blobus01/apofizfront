import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import { translate } from "../../locales/locales";
import WideButton, {
  WIDE_BUTTON_VARIANTS,
} from "../../components/UI/WideButton";
import { setGlobalMenu } from "../../store/actions/commonActions";
import { MENU_TYPES } from "../../components/GlobalMenu";
import Preloader from "../../components/Preloader";
import { SubCategoryOption } from "../../components/SubCategoryOption";
import {
  createPostSubCategory,
  getPostSubCategories,
  removePostSubCategory,
  updatePostSubCategory,
} from "../../store/actions/postActions";
import Notify from "../../components/Notification";
import "./index.scss";

const SubcategorySelectionView = ({
  catID,
  orgID,
  selected,
  onSelect,
  headerProps,
}) => {
  const dispatch = useDispatch();
  const { loading, data: parentCategory } = useSelector(
    (state) => state.postStore.postSubCategories
  );

  useEffect(() => {
    dispatch(getPostSubCategories(catID, orgID ? { organization: orgID } : {}));
  }, [dispatch, catID, orgID]);

  const handleCategoryAdding = () => {
    dispatch(
      setGlobalMenu({
        type: MENU_TYPES.category_creation_menu,
        menuLabel: translate("Новая категория", "category.new"),
        onSubmit: async (values) => {
          if (values.name) {
            const res = await dispatch(
              createPostSubCategory({
                category: catID,
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

  const handleCategoryUpdate = (cat) => {
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

  return (
    <>
      <MobileTopHeader
        title={translate("Выберите категорию", "category.selectCategory")}
        submitLabel={translate("Далее", "app.next")}
        style={{
          marginBottom: 20,
        }}
        {...headerProps}
      />
      <div className="rent-subcategories-view container">
        {loading || !parentCategory ? (
          <Preloader />
        ) : (
          parentCategory.subcategories.map((cat) => (
            <SubCategoryOption
              label={cat.name}
              icon={cat.icon}
              key={cat.id}
              isActive={selected === cat.id}
              onClick={() => onSelect(cat)}
              onEdit={cat.organization && (() => handleCategoryUpdate(cat))}
              className="rent-subcategories-view__option"
            />
          ))
        )}

        <div className="rent-subcategories-view__fixed-bottom">
          <div className="container">
            <WideButton
              variant={WIDE_BUTTON_VARIANTS.ACCEPT}
              onClick={handleCategoryAdding}
            >
              {translate("Добавить свою категорию", "category.addOwn")}
            </WideButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubcategorySelectionView;
