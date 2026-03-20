import React, {useCallback, useEffect, useRef, useState} from 'react';
import SelectableCompilationItem from "./components/SelectableCompilationItem";
import ScrollContainer from "react-indiana-drag-scroll";
import {translate} from "../../locales/locales";
import {CloseButton, PlusIcon} from "../UI/Icons";
import {useDispatch} from "react-redux";
import {setGlobalMenu} from "../../store/actions/commonActions";
import {MENU_TYPES} from "../GlobalMenu";
import Notify from "../Notification";
import {addToCollection, getCollections, removeFromCollection} from "../../store/services/collectionServices";
import Preloader from "../Preloader";
import SavedInFavoritesToast from "./components/SavedInFavoritesToast";
import SavedInCompilationsToast from "./components/SavedInCompilationsToast";
import DeletedFromCompilationToast from "./components/DeletedFromCompilationToast";
import {togglePostBookmark} from "../../store/services/postServices";
import useDialog from "../UI/Dialog/useDialog";
import "./index.scss"

const PostCompilationsMenu = ({onClose, postID, playAnimation, setPostBookmarkedState, menuLabel}) => {
  const TOASTS = {
    default: 'default',
    remove_success: 'remove_success',
    add_success: 'add_success'
  }
  const LIMIT = 10
  const DESCRIPTIONS = {
    creation: translate('Вы можете создать подборку для удобной навигации в вашем Профиле - в Избранном', 'compilations.creationDesc'),
    sharing: translate('Вы можете делиться подборками с другими пользователями, в меню Избранного в Профиле', 'compilations.sharingDesc')
  }
  const dispatch = useDispatch()

  const [firstLoading, setFirstLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeletingFromFavorites, setIsDeletingFromFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [compilations, setCompilations] = useState({
    total_pages: 0,
    total_count: 0,
    list: []
  });

  const [clickedCompilation, setClickedCompilation] = useState(null);
  const [currToast, setCurrToast] = useState(TOASTS.default);
  const [desc, setDesc] = useState(null);

  const scrollContainerRef = useRef(null);

  const {confirm} = useDialog()

  const fetchCompilations = useCallback(async queryParams => {
    const res = await getCollections({...queryParams, item: postID})
    if (res.success) {
      return res.data
    } else {
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
      console.error(res.error)
      throw new Error(res.error)
    }
  }, [postID])

  const fetchNextCompilations = async () => {
    try {
      setIsFetching(true)
      const newCompilations = await fetchCompilations({
        page: page + 1,
        limit: LIMIT
      })
      setCompilations(prevCompilations => ({
        ...newCompilations,
        list: prevCompilations.list.concat(newCompilations.list)
      }))
      setPage(prevPage => prevPage + 1)
    } catch (e) {
    } finally {
      setIsFetching(false)
    }
  }

  const openCompilationCreationMenu = () => {
    dispatch(setGlobalMenu({
      type: MENU_TYPES.post_compilation_create_menu,
      menuLabel: translate('Подборки избранных', 'compilations.favorites'),
      postID
    }))
  }

  async function removeFromFavorites() {
    try {
      await confirm({
        title: translate('Удалить избранное', 'dialog.deleteFavorite'),
        description: translate('Вы действительно хотите удалить из избранного.', 'dialog.deleteFavoriteDesc'),
        confirmTitle: translate('Удалить', 'app.delete')
      })
    } catch (e) {
      return
    }

    const res = await togglePostBookmark(postID, false)

    if (res.success) {
      setPostBookmarkedState(false)
      setIsDeletingFromFavorites(true)

      setTimeout(() => {
        onClose()
      }, 1600)
    } else {
      Notify.error({
        text: res.message
      })
    }
  }

  const toggleCompilation = async targetCompilation => {
    if (clickedCompilation || isDeletingFromFavorites) return
    setClickedCompilation(targetCompilation)

    const isAdding = !targetCompilation.in_collection

    let requestResponse

    if (isAdding) {
      requestResponse = await addToCollection(targetCompilation.id, postID)
    } else {
      requestResponse = await removeFromCollection(targetCompilation.id, postID)
    }

    if (!requestResponse.success) {
      return Notify.error({
        text: requestResponse.error
      })
    }

    const updatedCompilationsList = compilations.list.map(compilation => {
      if (compilation.id === targetCompilation.id) {
        return {...compilation, in_collection: !compilation.in_collection};
      }
      return compilation;
    })

    setCompilations(prevCompilations => ({
      ...prevCompilations,
      list: updatedCompilationsList
    }))


    if (isAdding) {
      setCurrToast(TOASTS.add_success)
      setTimeout(() => {
        onClose()
      }, 1400)
    } else {
      setCurrToast(TOASTS.remove_success)
      setTimeout(() => {
        onClose()
      }, 1600)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchCompilations({
      page: 1,
      limit: LIMIT
    }).then(compilations => {
        setFirstLoading(false)
        setCompilations(compilations)
        if (compilations.list.length > 0) {
          setDesc(DESCRIPTIONS.creation)
        } else {
          setDesc(DESCRIPTIONS.sharing)
        }
      }
    )
  }, [fetchCompilations, LIMIT, DESCRIPTIONS.creation, DESCRIPTIONS.sharing]);

  const hasMore = compilations.total_pages !== page

  return (
    <div className="post-compilation-menu">
      <div className="container">
        <div className="post-compilation-menu__header">
          <button className="post-compilation-menu__add-btn" onClick={openCompilationCreationMenu}>
            <PlusIcon/>
          </button>
          <h5
            className="post-compilation-menu__header-title f-20 f-600 tl">{menuLabel || translate('Настройки', 'app.settings')}</h5>
          <CloseButton className="post-compilation-menu__header-close-button" onClick={!isDeletingFromFavorites && onClose}/>
        </div>
      </div>

      {!firstLoading && (
        <>
          {currToast === TOASTS.default && <SavedInFavoritesToast onBookmarkClick={removeFromFavorites} playAnimation={playAnimation} isDeleting={isDeletingFromFavorites}  />}
          {currToast === TOASTS.add_success && <SavedInCompilationsToast />}
          {currToast === TOASTS.remove_success && <DeletedFromCompilationToast/>}
        </>
      )}

      <div className="container">
        {firstLoading && <Preloader/>}
        <ScrollContainer
          onScroll={(scrollLeft, _, scrollWidth) => {
            if (scrollContainerRef.current && scrollContainerRef.current.container.current) {
              const scrollContainerWidth = scrollContainerRef.current.container.current.offsetWidth;
              const isEndReached = (scrollWidth - scrollContainerWidth - scrollLeft) < 100
              if (isEndReached && !isFetching) {
                hasMore && fetchNextCompilations()
              }
            }
          }}
          ref={scrollContainerRef}
        >
          <div className="post-compilation-menu__list">
            {compilations.list.map(compilation => (
              <SelectableCompilationItem
                compilation={compilation}
                className="post-compilation-menu__list-item"
                selected={compilation.in_collection}
                onClick={() => toggleCompilation(compilation)}
                key={compilation.id}
              />
            ))}
            {hasMore && !firstLoading && <Preloader className="post-compilation-menu__preloader"/>}
          </div>
        </ScrollContainer>
      </div>
      {desc && (
        <p className="post-compilation-menu__desc container f-14 f-500">
          {desc}
        </p>
      )}
    </div>
  );
};

export default PostCompilationsMenu;