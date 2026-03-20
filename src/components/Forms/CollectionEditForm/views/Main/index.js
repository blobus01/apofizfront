import React, {useState} from 'react';
import {translate} from "../../../../../locales/locales";
import {InputTextField} from "../../../../UI/InputTextField";
import PlaceholderImage from "../../../../PlaceholderImage";
import Avatar from "../../../../UI/Avatar";
import WideButton from "../../../../UI/WideButton";
import "../../index.scss"

const Main = ({values, isCollectionEmpty, image, handleChange, onImageChange, onDelete, touched, errors}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletion = async () => {
    try {
      setIsDeleting(true)
      await onDelete()
    } catch (e) {}
    finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="collection-edit-form__main container">
      <div className="collection-edit-form__main-image-wrap">
        {image === null ? (
          <PlaceholderImage wrapperProps={{className: "collection-edit-form__main-placeholder-image"}} />
        ) : (
          <Avatar src={image} alt="compilation" className="collection-edit-form__main-image" size={74}/>
        )}
      </div>
      <button onClick={onImageChange} className="collection-edit-form__main-change-image-btn" disabled={isCollectionEmpty}>
        {translate('Изменить обложку', 'app.changeCover')}
      </button>

      <InputTextField
        name="title"
        value={values.title}
        onChange={handleChange}
        label={translate('Название подборки', 'compilations.title')}
        error={touched?.title && errors?.title}
        className="collection-edit-form__main-title"
      />
      <WideButton
        onClick={handleDeletion}
        className="collection-edit-page__delete-btn f-14"
        loading={isDeleting}
      >
        {translate('Удалить подборку', 'compilations.delete')}
      </WideButton>
      <p className="collection-edit-page__deletion-warn f-14">
        {translate('Если вы удалите эту подборку, то все сохраненные будут доступны в папке все', 'compilations.deletionWarning')}
      </p>
    </div>
  );
};

export default Main;