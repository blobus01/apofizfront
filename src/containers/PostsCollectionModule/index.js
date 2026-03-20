import React, {useCallback, useEffect, useState} from 'react';
import {DEFAULT_LIMIT} from "../../common/constants";
import MobileTopHeader from "../../components/MobileTopHeader";
import {useHistory} from "react-router-dom";
import {canGoBack} from "../../common/helpers";
import {getSavedPosts} from "../../store/services/postServices";
import {getCollectionItems} from "../../store/services/collectionServices";
import Notify from "../../components/Notification";
import InfiniteScroll from "react-infinite-scroll-component";
import Preloader from "../../components/Preloader";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import MobileMenu from "../../components/MobileMenu";
import {translate} from "../../locales/locales";
import RowButton, {ROW_BUTTON_TYPES} from "../../components/UI/RowButton";
import EmptyMessage from "../../components/CollectionEmptyMessage";
import "./index.scss"

const PostsCollectionModule = ({id, title}) => {
  const initialPosts = {
    total_pages: 1,
    total_count: 0,
    list: []
  }
  const history = useHistory()
  const LIMIT = DEFAULT_LIMIT
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);

  const isCollectionRoot = id => id === 'all'

  const goBack = useCallback(() => {
    canGoBack(history) ? history.goBack() : history.push('/saved')
  }, [history])

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

  const isThisRootCollection = isCollectionRoot(id)

  const mobileTopHeader = (
    <MobileTopHeader
      onBack={goBack}
      title={title}
      onMenu={() => setIsMenuOpen(true)}
    />
  )

  const isEmpty = posts.list.length === 0

  const menu = (
    <MobileMenu
      isOpen={isMenuOpen}
      onRequestClose={() => setIsMenuOpen(false)}
      contentLabel={translate('Настройки подборки', 'compilations.settings')}
    >
      {!isThisRootCollection && (
        <RowButton to={`/saved/${id}/edit`} type={ROW_BUTTON_TYPES.link} className="posts-collection-module__menu-option f-17" showArrow>
          <EditIcon />
          {translate('Редактировать подборку', 'compilations.editCompilation')}
        </RowButton>
      )}
      {!isEmpty && (
        <RowButton to={`/saved/${id}/items-deletion`} type={ROW_BUTTON_TYPES.link} className="posts-collection-module__menu-option f-17" showArrow>
          <SelectIcon />
          {translate('Выбрать для удаления', 'app.selectToDelete')}
        </RowButton>
      )}
    </MobileMenu>
  )

  if (posts.list.length === 0 && !isLoading) {
    return (
      <>
        {mobileTopHeader}
        <EmptyMessage />
        {menu}
      </>
    )
  }

  return (
    <div className="posts-collection-module">
      {mobileTopHeader}
      <InfiniteScroll
        next={fetchNextPosts}
        hasMore={hasMore}
        loader={<Preloader/>}
        dataLength={posts.list.length}
        className="grid_layout container"
      >
        <div className="grid_layout__inner">
          {posts.list.map(post => {
            return (
              <PostFeedCard
                post={post}
                organization={post.organization}
                key={post.id}
              />
            )
          })}
        </div>
      </InfiniteScroll>
      {isLoading && <Preloader />}

      {menu}
    </div>
  );
};

const EditIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="#4285F4"
        strokeWidth={1.3}
        d="M14.48 12v.002a2.226 2.226 0 0 1-.032.394c-.095.542.292 1.154.95 1.154h2.978c.434 0 .881-.315.928-.834a2.91 2.91 0 0 0 .013-.266v-.752l1.817-1.383a.95.95 0 0 0 .248-1.23l-2.199-3.817a.95.95 0 0 0-1.193-.401l-2.09.882a7.73 7.73 0 0 0-.241-.154 3.971 3.971 0 0 0-.288-.16l-.28-2.252a.95.95 0 0 0-.943-.833H9.753a.95.95 0 0 0-.943.833l-.281 2.26a5.418 5.418 0 0 0-.527.307L5.91 4.867a.95.95 0 0 0-1.193.4L2.52 9.085a.95.95 0 0 0 .248 1.23l1.817 1.384v.604l-1.817 1.383a.95.95 0 0 0-.248 1.23l2.198 3.817a.95.95 0 0 0 1.193.401L8 18.251c.08.053.16.104.242.154.093.057.19.11.288.16l.28 2.252a.95.95 0 0 0 .943.833h1.002a.95.95 0 0 0 .95-.95v-5.468a.967.967 0 0 0-.614-.895 2.53 2.53 0 0 1-1.097-.84c-.32-.42-.483-.91-.483-1.497 0-.701.235-1.28.72-1.772.48-.488 1.054-.728 1.764-.728.692 0 1.265.238 1.756.731.49.493.728 1.07.728 1.769Z"
      />
      <path
        fill="#4285F4"
        fillRule="evenodd"
        d="M13 23.613v-7.358c.006-.016.015-.032.017-.048.073-.616.696-1.215 1.362-1.207 1.415.017 2.83.005 4.246.006.082 0 .165.002.245.016.572.1 1.133.699 1.13 1.409-.01 2.343-.004 4.685-.004 7.028 0 .036.002.07 0 .106-.015.205-.137.367-.32.417a.45.45 0 0 1-.405-.09c-.895-.66-1.792-1.317-2.686-1.979-.064-.047-.104-.048-.168 0-.472.352-.948.7-1.422 1.048-.43.316-.859.634-1.29.948-.263.191-.594.068-.685-.25-.005-.016-.013-.03-.02-.046Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)

const SelectIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <g stroke="#4285F4" strokeWidth={1.5} clipPath="url(#a)">
      <path
        strokeMiterlimit={10}
        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m17 9-4.994 5.714-2.14-2.143m-.725 2.143L7 12.571M14.22 9l-2.302 2.634"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default PostsCollectionModule;