import React, { useEffect, useMemo } from 'react';
import { useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import MobileTopHeader from '../../components/MobileTopHeader';
import Preloader from '../../components/Preloader';
import { translate } from '../../locales/locales';
import { getSelection } from '../../store/actions/stockActions';
import ShopFeedView from '../ShopFeedView';

import './index.scss';

const PostsSelection = ({ history, ...props }) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.userStore.user);
  const { data: postsSelection, page } = useSelector(state => state.stockStore.selection);

  const getData = useCallback(
    payload => {
      dispatch(getSelection(props.match.params.id, payload));
    },
    [dispatch, props.match.params.id]
  );

  useEffect(() => {
    getData({
      page: 1,
      data: null,
    });
  }, [getData]);

  const getNext = () => {
    getData({
      page: page + 1,
    });
  };

  const orgDetail = useMemo(() => {
    return postsSelection && postsSelection.list[0] ? postsSelection.list[0].organization : null;
  }, [postsSelection]);

  return (
    <div className="posts-selection">
      <MobileTopHeader onBack={() => history.goBack()} title={translate('Подборка', 'app.collection')} />
      {postsSelection && postsSelection.list.length !== 0 ? (
        <div className="posts-selection__container container">
          <InfiniteScroll
            dataLength={postsSelection.list.length}
            loader={<Preloader />}
            hasMore={postsSelection.total_count > postsSelection.list.length}
            next={getNext}
          >
            <ShopFeedView data={postsSelection} orgDetail={orgDetail} user={user} />
          </InfiniteScroll>
        </div>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default PostsSelection;
