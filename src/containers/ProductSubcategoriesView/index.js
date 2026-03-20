import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MobileTopHeader from "../../components/MobileTopHeader";
import { SubCategoryOption } from "../../components/SubCategoryOption";
import Button from "../../components/UI/Button";
import MobileMenu from "../../components/MobileMenu";
import {
  createPostSubCategory,
  getPostSubCategories,
  removePostSubCategory,
  updatePostSubCategory,
} from "../../store/actions/postActions";
import Preloader from "../../components/Preloader";
import { translate } from "../../locales/locales";
import "./index.scss";
import { PlusIcon } from "@components/UI/Icons";
import { uploadFile } from "@store/actions/commonActions";
import axios from "axios-api";
import Loader from "@components/UI/Loader";

const ProductSubcategoriesView = (props) => {
  const {
    parentID,
    orgID,
    postSubCategories,
    selectedSubcategory,
    onBack,
    onSelect,
    onNext,
    loadingSavePost,
    clearSelection,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [value, setValue] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const { data, loading } = postSubCategories;
  const selectedID = selectedSubcategory && selectedSubcategory.id;

  useEffect(() => {
    if (!parentID) {
      onBack();
      return;
    }

    props.getPostSubCategories(parentID, {
      organization: orgID,
    });
  }, [parentID]);

  const onEditCategory = (cat) => {
    setToEdit(cat);
    setValue(cat.name);

    if (cat.sub_icon) {
      const imageUrl =
        typeof cat.sub_icon === "string" ? cat.sub_icon : cat.sub_icon?.file;

      setPreview(imageUrl || null);
    } else {
      setPreview(null);
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setToEdit(null);
    setValue("");
    setImageFile(null);
    setPreview(null);
    setShowModal(false);
  };

  const createCategory = async (name) => {
    if (isSubmit) return;

    try {
      setIsSubmit(true);

      let imageId = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await axios.post("/files/", formData);

        console.log("files", res);

        if (res?.data?.id) {
          imageId = res.data.id;
        }

        console.log(res);
      }

      const payload = {
        name,
        category: parentID,
        organization: orgID,
        sub_icon: imageId, // ВОТ ЧТО НУЖНО БЭКУ
      };

      const result = await props.createPostSubCategory(payload);

      if (result && result.success) {
        await props.getPostSubCategories(parentID, {
          organization: orgID,
        });
        closeModal();
      }

      result && result.success && closeModal();
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmit(false);
    }
  };

  const updateCategory = async (subcategory, name) => {
    if (isSubmit) return;

    try {
      setIsSubmit(true);

      let imageId = subcategory.sub_icon?.id || null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await axios.post("/files/", formData);

        if (res?.data?.id) {
          imageId = res.data.id;
        }
      }

      const payload = {
        name,
        sub_icon: imageId,
      };

      const result = await props.updatePostSubCategory(subcategory.id, payload);

      result && result.success && closeModal();
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmit(false);
    }
  };

  const removeCategory = (subcategory) => {
    selectedSubcategory &&
      selectedSubcategory.id === subcategory.id &&
      clearSelection &&
      clearSelection();

    props
      .removePostSubCategory(subcategory.id)
      .then((res) => res && res.success && closeModal());
  };

  const handleSubmit = () => {
    if (!value || isSubmit) return;

    toEdit ? updateCategory(toEdit, value) : createCategory(value);
  };

  const isSelectedCategoryInList = data
    ? !!data.subcategories.find((cat) => cat.id === selectedID)
    : false;

  console.log(imageFile);

  return (
    <div className="product-subcategories-view">
      <MobileTopHeader
        title={translate("Выберите категорию", "category.selectCategory")}
        onBack={onBack}
        nextLabel={translate("Готово", "app.ready")}
        onNext={isSelectedCategoryInList && !loading ? onNext : null}
        onSubmit={props.onSubmit}
        submitLabel={
          loadingSavePost
            ? translate("Сохранение", "app.saving")
            : translate("Cохранить", "app.save")
        }
        isSubmitting={loadingSavePost}
      />

      <div className="product-subcategories-view__content">
        <div className="product-subcategories-view__list">
          <div className="container">
            {loading ? (
              <Preloader className="product-subcategories-view__preloader" />
            ) : data ? (
              <>
                {data.subcategories.map((cat) => {
                  console.log(cat.sub_icon);

                  return (
                    <SubCategoryOption
                      key={cat.id}
                      option={cat}
                      label={cat.name}
                      icon={cat.icon}
                      sub_icon={cat?.sub_icon}
                      isActive={selectedID === cat.id}
                      onClick={() => onSelect(cat)}
                      onEdit={cat.organization && onEditCategory}
                      className="product-subcategories-view__item"
                    />
                  );
                })}
              </>
            ) : (
              <div>Нет подкатегорий</div>
            )}
          </div>
          <Button
            type="button"
            label={translate("Добавить свою категорию", "category.addOwn")}
            className="product-subcategories-view__add"
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>

      <MobileMenu
        isOpen={showModal}
        contentLabel={
          toEdit
            ? translate("Изменить категорию", "category.change")
            : translate("Новая категория", "category.new")
        }
        onRequestClose={closeModal}
        onClose={closeModal}
      >
        <div className="product-subcategories-view__popup">
          <div className="product-subcategories-view__image-picker">
            <input
              type="file"
              accept="image/*"
              id="subcategory-image"
              onChange={handleImageChange}
              hidden
            />

            {!preview ? (
              <label
                htmlFor="subcategory-image"
                className="product-subcategories-view__image-placeholder"
              >
                <PlusIcon />
              </label>
            ) : (
              <div className="product-subcategories-view__image-preview">
                <img src={preview} alt="preview" />

                <button
                  type="button"
                  className="product-subcategories-view__image-remove"
                  onClick={removeImage}
                >
                  🗑
                </button>
              </div>
            )}
          </div>

          <input
            name="subcategory"
            placeholder={translate("Название категории", "category.name")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="product-subcategories-view__popup-input"
          />

          <Button
            disabled={isSubmit}
            label={
              isSubmit ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Loader />
                  {toEdit
                    ? translate("Обновление", "app.updating")
                    : translate("Создание", "app.creating")}
                </div>
              ) : toEdit ? (
                translate("Обновить", "app.update")
              ) : (
                translate("Создать", "app.create")
              )
            }
            className="product-subcategories-view__popup-button"
            type="button"
            onClick={handleSubmit}
          />

          {toEdit && (
            <Button
              label={translate("Удалить", "app.delete")}
              className="product-subcategories-view__popup-delete-button"
              type="button"
              onClick={() => removeCategory(toEdit)}
            />
          )}
        </div>
      </MobileMenu>
    </div>
  );
};

const mapStateToProps = (state) => ({
  postSubCategories: state.postStore.postSubCategories,
});

const mapDispatchToProps = (dispatch) => ({
  getPostSubCategories: (catID, params) =>
    dispatch(getPostSubCategories(catID, params)),

  createPostSubCategory: (subcategory) =>
    dispatch(createPostSubCategory(subcategory)),

  updatePostSubCategory: (subcategoryID, payload) =>
    dispatch(updatePostSubCategory(subcategoryID, payload)),

  removePostSubCategory: (subcategoryID) =>
    dispatch(removePostSubCategory(subcategoryID)),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProductSubcategoriesView);
