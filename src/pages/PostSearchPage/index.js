import React from "react";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { connect } from "react-redux";
import Preloader from "../../components/Preloader";
import InfiniteScroll from "react-infinite-scroll-component";
import { translate } from "../../locales/locales";
import { getOrgPostsList } from "../../store/actions/postActions";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import EmptyData from "../SubscriptionsPostsPage/empty";
import { DEFAULT_LIMIT } from "../../common/constants";
import { debounce } from "../../common/utils";
import qs from "qs";

import "./index.scss";

class PostSearchPage extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.id;
    this.state = {
      search: this.getSearchParam("search") ?? "",
      page: 1,
      limit: DEFAULT_LIMIT,
      organization: this.orgID,
      hasMore: true,
    };
  }

  componentDidMount() {
    this.getPosts();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const location = this.props.location;
    const currSearch = this.state.search;

    // update search param on search state change with debounce
    if (prevState.search !== currSearch) {
      this.updateSearchParams({
        search: currSearch.trim(),
      });
    }
    // fetching posts after search query param has changed
    else if (prevProps.location.search !== location.search) {
      const searchParam = this.getSearchParam("search");

      if (!!searchParam) {
        this.getPosts();
      }
    }
  }

  getSearchParam = (key) => {
    const searchParams = qs.parse(this.props.location.search.replace("?", ""));

    const targetParam = searchParams[key];

    if (!!targetParam && !!targetParam.trim()) {
      return targetParam;
    }

    return null;
  };

  onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState((prevState) => ({
        ...prevState,
        search: value,
        page: 1,
        hasMore: true,
      }));
    }
  };

  onSearchSubmit = (e) => {
    e.preventDefault();
    // this.getPosts();
  };

  getPosts = (isNext, extraParams = {}, extraState = {}) => {
    const { search, page, limit, organization } = this.state;
    const params = { search, page, limit, organization };
    this.props
      .getOrgPostsList({ ...params, ...extraParams }, isNext)
      .finally(() => {
        this.setState((prevState) => ({ ...prevState, ...extraState }));
      });
  };

  updateSearchParams = debounce((params) => {
    const filteredParams = {};

    Object.keys(params).forEach((param) => {
      if (!!params[param]) {
        filteredParams[param] = params[param];
      }
    });

    const searchParams = new URLSearchParams(filteredParams);

    this.props.history.replace({
      pathname: this.props.location.pathname,
      search: `?${searchParams}`,
    });
  }, 300);

  getNext = (totalPages) => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      return this.getPosts(
        true,
        { page: nextPage },
        { hasMore: true, page: nextPage }
      );
    }
    this.setState((prevState) => ({ ...prevState, hasMore: false }));
  };

  render() {
    const { history, user, orgPostsList } = this.props;
    const { page, search } = this.state;
    const { data, loading } = orgPostsList;

    return (
      <div className="post-search-page">
        <MobileSearchHeader
          onBack={() => history.push(`/organizations/${this.orgID}`)}
          defaultState={true}
          searchValue={this.state.search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={() => history.push(`/organizations/${this.orgID}`)}
          onSearchSubmit={this.onSearchSubmit}
          title={translate("Поиск", "app.search")}
        />
        <div className="post-search-page__content">
          <div className="container">
            {page === 1 && !data && loading ? (
              <Preloader />
            ) : !data || (data && !data.list.length) ? (
              <EmptyData searched={!!search} />
            ) : (
              <div style={{ margin: "0 -15px" }}>
                <InfiniteScroll
                  dataLength={Number(data.list.length) || 0}
                  next={() => this.getNext(data.total_pages)}
                  hasMore={this.state.hasMore}
                  loader={null}
                >
                  <div className="post-search-page__list">
                    {data.list.map((post) => (
                      <PostFeedCard
                        key={post.id}
                        post={post}
                        organization={post.organization}
                        permissions={post.organization.permissions}
                        isGuest={!user}
                        className="post-search-page__list-card"
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.userStore.user,
  orgPostsList: state.postStore.orgPostsList,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgPostsList: (params, isNext) =>
    dispatch(getOrgPostsList(params, isNext)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostSearchPage);
