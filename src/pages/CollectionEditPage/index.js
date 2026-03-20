import React, {useEffect, useState} from 'react';
import CollectionEditForm from "../../components/Forms/CollectionEditForm";
import Preloader from "../../components/Preloader";
import {deleteCollection, getCollection, updateCollection} from "../../store/services/collectionServices";
import Notify from "../../components/Notification";
import {translate} from "../../locales/locales";
import useDialog from "../../components/UI/Dialog/useDialog";
import {getPostImage} from "../../common/helpers";
import "./index.scss"

const CollectionEditPage = ({match, history}) => {
  const {id} = match.params
  const [loading, setLoading] = useState(true);
  const [collectionDetail, setCollectionDetail] = useState(null);
  const {confirm} = useDialog()

  useEffect(() => {
    getCollection(id)
      .then(res => {
        if (res.success) {
          setCollectionDetail(res.data)
        } else {
          Notify.error({
            text: res.error
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id]);

  const goBack = () => history.push(`/saved`)

  const handleSubmit = async values => {
    const {title, collectionImagePost} = values
    const res = await updateCollection(id, {
      name: title,
      item_id: collectionImagePost
    })
    if (res.success) {
      goBack()
    } else {
      Notify.error({
        text: res.error
      })
    }
  }

  const handleCompilationDeletion = async () => {
    try {
      await confirm({
        title: translate('Удалить подборку', 'compilations.delete'),
        description: translate('Вы действительно хотите удалить эту подборку. После удаления все сохраненные будут доступны в папке “Все”', 'compilations.deletionConfirmation'),
        confirmTitle: translate('Удалить', 'app.delete')
      })
      const res = await deleteCollection(id)
      if (res.success) {
        goBack()
      } else {
        Notify.error({
          text: res.error
        })
      }
    } catch (e) {}
  }

  if (loading) return <Preloader/>

  const image = getPostImage(collectionDetail.image)

  return (
    <div className="collection-edit-page">
      <CollectionEditForm
        collectionID={id}
        onBack={goBack}
        initialValues={{
          title: collectionDetail.name,
        }}
        defaultImage={image}
        isCollectionEmpty={!collectionDetail.has_items}
        onSubmit={handleSubmit}
        onDelete={handleCompilationDeletion}
        className="collection-edit-page__form"
      />
    </div>
  );
};

export default CollectionEditPage;