import React, {useCallback, useEffect, useState} from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {DEFAULT_LIMIT} from "../../common/constants";
import {deletePostsFromBookmarks, getSavedPosts} from "../../store/services/postServices";
import {getCollectionItems, updateCollection} from "../../store/services/collectionServices";
import Notify from "../../components/Notification";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../components/Preloader";
import SelectablePostsList from "../../components/SelectablePostsList";
import useDialog from "../../components/UI/Dialog/useDialog";
import classNames from "classnames";
import DeletionToast from "../../components/Toasts/DeletionToast";
import CollectionEmptyMessage from "../../components/CollectionEmptyMessage";
import "./index.scss"

const CollectionItemsDeletionPage = ({history, match}) => {
  const {id} = match.params

  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {confirm} = useDialog()

  const initialPosts = {
    total_pages: 1,
    total_count: 0,
    list: []
  }
  const LIMIT = DEFAULT_LIMIT
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);

  const isCollectionRoot = id => id === 'all'

  const goBack = useCallback(() => {
    history.push(`/saved`)
  }, [history])

  const handleSubmit = async () => {
    if (!selectedItems.length) return
    setIsSubmitting(true)
    try {
      await confirm({
        title: translate('Удалить выбранные', 'dialog.removeSelected'),
        description: translate('Вы действительно хотите удалить выбранные. После удаления все выбранные будут доступны в системной папке “Сохраненные”', 'dialog.removeSelectedDesc'),
        confirmTitle: translate('Удалить', 'app.delete')
      })
      const res = isCollectionRoot(id) ?
        await deletePostsFromBookmarks(selectedItems) :
        await updateCollection(id, {
          items: selectedItems
        })
      if (res.success) {
        if (isCollectionRoot(id)) Notify.custom(<DeletionToast
          text={translate('Удалено из сохраненных', 'notify.removedFromSaved')}/>,           {
          className: 'toastify-toast-reset',
        })
        goBack()
      } else {
        Notify.error({
          text: res.error
        })
      }
    } catch (e) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPosts = useCallback(async (id, queryParams) => {
    let queryRes
    if (isCollectionRoot(id)) {
      queryRes = await getSavedPosts(queryParams)
    } else {
      queryRes = await getCollectionItems(id, queryParams)
    }
    if (queryRes.success) {
      return queryRes.data
    } else {
      Notify.error({
        text: queryRes.message
      })
      goBack()
    }
  }, [goBack]);

  const fetchNextPosts = async () => {
    try {
      const newPosts = await fetchPosts(id, {
        page: page + 1,
        limit: LIMIT,
      })
      setPage(prevPage => prevPage + 1)
      setPosts(prevPosts => ({
        ...newPosts,
        list: prevPosts.list.concat(newPosts.list)
      }))
    } catch (e) {
    }
  }

  useEffect(() => {
    fetchPosts(id, {
      page: 1,
      limit: LIMIT
    }).then(res => {
      setPosts(res)
    }).finally(() => setIsLoading(false))
  }, [fetchPosts, id, LIMIT]);

  const hasMore = posts.total_pages > page

  const header = (
    <MobileTopHeader
      onBack={goBack}
      onNext={handleSubmit}
      title={translate('Выбор', 'app.selection')}
      nextLabel={
        <span
          className={
            classNames(
              'collection-items-deletion-page__remove-text',
              selectedItems.length > 0 && 'collection-items-deletion-page__remove-text--available'
            )
          }
        >
            {translate('Удалить', 'app.delete')}
          </span>
      }
      isSubmitting={isSubmitting}
      className="collection-items-deletion-page__header"
    />
  )

  if (!isLoading && posts.list.length === 0) {
    return (
      <>
        {header}
        <CollectionEmptyMessage/>
      </>
    )
  }

  return (
    <div className="collection-items-deletion-page">
      {header}
      <InfiniteScroll
        next={fetchNextPosts}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={posts.list.length}
        className="container"
      >
        {isLoading && <Preloader/>}
        <SelectablePostsList
          posts={posts.list}
          selected={selectedItems}
          onChange={newSelectedItems => setSelectedItems(newSelectedItems)}
          className="collection-edit-form__image-selection-list"
        />
      </InfiniteScroll>
    </div>
  );
};

export default CollectionItemsDeletionPage;