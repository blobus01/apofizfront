import React, {Component} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MobileTopHeader from '../../components/MobileTopHeader';
import {canGoBack} from '../../common/helpers';
import {getSavedPosts} from '../../store/services/postServices';
import PostFeedCard from '../../components/Cards/PostFeedCard';
import Preloader from '../../components/Preloader';
import {DEFAULT_LIMIT} from '../../common/constants';
import {translate} from '../../locales/locales';
import {Empty} from '../../components/Empty';
import EmptyImage from '../../assets/images/empty_saved_feed.png'
import './index.scss';

class SavedPostsPage extends Component {
  state = {
    posts: null,
    loading: true,
    hasMore: true,
    params: {
      page: 1,
      limit: DEFAULT_LIMIT,
    }
  }

  componentDidMount() {
    getSavedPosts(this.state.params)
      .then(res => res && res.success
        ? this.setState(prevState => ({...prevState, loading: false, posts: res.data}))
        : this.setState(prevState => ({...prevState, loading: false}))
      );
  }

  getNext = totalPages => {
    const {params} = this.state;
    if (params.page < totalPages) {
      const nextPage = params.page + 1;
      return getSavedPosts({...params, page: nextPage})
        .then(res => res && res.success && this.setState(prevState => ({
          ...prevState,
          hasMore: true,
          params: {
            ...prevState.params,
            page: nextPage
          },
          posts: {
            ...res.data,
            list: [...prevState.posts.list, ...res.data.list]
          }
        })));
    }
    this.setState(prevState => ({...prevState, hasMore: false}));
  }

  render() {
    const {posts, loading, hasMore, params} = this.state;
    const {user, history} = this.props;
    const {page} = params;
    const hasPosts = !!(posts && posts.total_count);

    return (
      <div className="saved-posts-page">
        <MobileTopHeader
          title={translate("Избранное", "app.favorites")}
          onBack={() => canGoBack(history) ? history.goBack() : history.push(`/profile`)}
        />
        <div className="saved-posts-page__content">
          {(page === 1 && loading)
            ? <Preloader/>
            : hasPosts && (
            <div className="saved-posts-page__list">
              <InfiniteScroll
                dataLength={Number(posts.list.length) || 0}
                next={() => this.getNext(posts.total_pages)}
                hasMore={hasMore}
                style={{overflow: 'unset'}}
                loader={null}
              >
                {posts.list.map(post => (
                  <PostFeedCard
                    key={post.id}
                    post={post}
                    organization={post.organization}
                    permissions={post.organization.permissions}
                    isGuest={!user}
                    className="saved-posts-page__card"
                  />
                ))}
              </InfiniteScroll>
            </div>
          )}

          {!loading && !hasPosts && (
            <div className="saved-posts-page__empty">
              <Empty
                label={translate("У вас пока нет сохранений", "shop.saved.empty")}
                image={EmptyImage}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SavedPostsPage;