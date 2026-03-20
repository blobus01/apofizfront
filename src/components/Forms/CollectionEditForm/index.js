import React, { useState } from "react";
import { useFormik } from "formik";
import MobileTopHeader from "../../MobileTopHeader";
import { translate } from "../../../locales/locales";
import * as Yup from "yup";
import { ERROR_MESSAGES } from "../../../common/messages";
import Main from "./views/Main";
import ImageSelection from "./views/ImageSelection";
import classNames from "classnames";
import { getPostImage } from "../../../common/helpers";
import "./index.scss";

const VALIDATION_SCHEMA = Yup.object().shape({
  title: Yup.string()
    .min(1, null)
    .max(100, ERROR_MESSAGES.max_message_limit)
    .required(ERROR_MESSAGES.title_empty),
  collectionImagePost: Yup.number(),
});

const VIEWS = Object.freeze({
  main: "main",
  image_selection: "image_selection",
});

const CollectionEditForm = ({
  initialValues = {
    title: "",
    collectionImagePost: null,
  },
  isCollectionEmpty,
  collectionID,
  onSubmit,
  defaultImage,
  onDelete,
  onBack,
  className,
}) => {
  const [view, setView] = useState(VIEWS.main);
  const [image, setImage] = useState(defaultImage ?? null);
  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema: VALIDATION_SCHEMA,
  });

  const { values } = formik;

  const handleImageSelect = (collectionImagePost) => {
    formik.setFieldValue("collectionImagePost", collectionImagePost.id);
    setImage(getPostImage(collectionImagePost, "small"));
    setView(VIEWS.main);
  };

  return (
    <form
      className={classNames("collection-edit-form", className)}
      onSubmit={formik.handleSubmit}
    >
      <MobileTopHeader
        title={translate("Редактировать", "app.edit")}
        isSubmitting={formik.isSubmitting}
        className="collection-edit-form__header"
        onBack={onBack}
        onSubmit
      />
      {view === VIEWS.main && (
        <Main
          values={values}
          handleChange={formik.handleChange}
          image={image}
          isCollectionEmpty={isCollectionEmpty}
          onDelete={onDelete}
          onImageChange={() => setView(VIEWS.image_selection)}
          touched={formik.touched}
          errors={formik.errors}
        />
      )}
      {view === VIEWS.image_selection && (
        <ImageSelection
          collectionID={collectionID}
          onSelect={handleImageSelect}
        />
      )}
    </form>
  );
};

export default CollectionEditForm;
