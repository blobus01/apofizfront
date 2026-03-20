import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {commentedItems} from "../../store/actions/commonActions";
import {DEFAULT_LIMIT} from "../../common/constants";
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {canGoBack} from "../../common/helpers";
import Preloader from "../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import {Empty} from "../../components/Empty";
import SwitchableTabLinks from "../../components/TabLinks/SwitchableTabLinks";
import EmptyComment from "../../assets/images/empty_cart.png";
import './index.scss';

const CommentsPostsPage = ({ history }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.commonStore.commentedItems);

  const [params, setParams] = useState({
    type: 'outcome',
    page: 1,
    limit: DEFAULT_LIMIT,
    hasMore: true,
  });

  const [isScroll, setIsScroll] = useState(false);


  const COMMENTS_TABS = [
    {
      label: 'Исходящие',
      translation: 'app.outcome',
      key: 'outcome',
      onClick: () => setParams({ ...params, type: 'outcome', page: 1, hasMore: true })
    }, {
      label: 'Входящие',
      translation: 'app.income',
      key: 'income',
      onClick: () => setParams({ ...params, type: 'income', page: 1, hasMore: true })
    },
  ];

  useEffect(() => {
    dispatch(commentedItems({ ...params }))
  }, [dispatch, params.type]);

  const getNext = async totalPages => {
    if (params.page < totalPages) {
      const nextPage = params.page + 1;
      setIsScroll(true);
      await dispatch(commentedItems({ ...params, page: nextPage }, true));
      setIsScroll(false);
      return setParams(prev => ({...prev, hasMore: true, page: nextPage}));
    }

    setParams(prev => ({...prev, hasMore: false}));
  };


  return (
    <div className="commented-posts-page">
      <MobileTopHeader
        title={translate("Комментарии", "app.comments")}
        onBack={() => canGoBack(history) ? history.goBack() : history.push(`/profile`)}
      />

      <div className="container commented-posts-page__switch-tab sticky is-sticky">
        <SwitchableTabLinks links={COMMENTS_TABS} activeLink={params.type}/>
      </div>

      <div className="commented-posts-page__content">
        {(params.page === 1 && loading && !isScroll)
          ? <Preloader />
          : data && (
          <div className="commented-posts-page__list">
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => getNext(data.total_pages)}
              hasMore={params.hasMore}
              loader={null}
            >
              {data.list.map(post => (
                <PostFeedCard
                  key={post.id}
                  post={post}
                  organization={post.organization}
                  permissions={post.organization.permissions}
                  className="commented-posts-page__card"
                />
              ))}

              {(isScroll && loading) && <Preloader/>}
            </InfiniteScroll>
          </div>
        )}

        {!loading && !data && (
          <div className="commented-posts-page__empty">
            <Empty
              label={translate("Вы пока ничего не комментировали", "shop.comment.empty")}
              image={EmptyComment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPostsPage;