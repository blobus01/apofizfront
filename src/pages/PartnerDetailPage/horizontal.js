import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Preloader from '../../components/Preloader';
import OrganizationSlider from '../../components/OrganizationSlider';
import {getHomeOrganizations, selectCategory} from '../../store/actions/homeActions';
import EmptyBox from '../../components/EmptyBox';
import {translate} from '../../locales/locales';
import {DEFAULT_LIMIT} from '../../common/constants';

class HorizontalScrollOrgs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      partner: props.organization,
      hasMore: true,
    }
  }

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1
      this.props.getHomeOrganizations({
        ...this.state,
        page: nextPage,
      }, true);

      return this.setState({ ...this.state, hasMore: true, page: nextPage })
    }
    this.setState({ ...this.state, hasMore: false });
  }

  render() {
    const { page, hasMore } = this.state;
    const { homeOrganizations } = this.props;
    const { data, loading } = homeOrganizations;

    return (
      <div className="partner-detail-page__categories">
        {(page === 1 && loading)
          ? <Preloader />
          : (!data || (data && !data.total_count))
            ? <EmptyBox title={translate("Нет организации", "org.noOrganizations")} />
            : (
            <InfiniteScroll
              dataLength={Number(data.list.length) || 0}
              next={() => this.getNext(data.total_pages)}
              hasMore={hasMore}
              loader={<Preloader />}
              className="partner-detail-page__scroller"
            >
              {data.list.map(category => (
                <div key={category.id} className="partner-detail-page__category">
                  <div className="container">
                    <div className="partner-detail-page__category-top row">
                      <h2 className="f-20 f-600 tl">{category.name}</h2>
                      <Link to={`/home/organizations?cat=${category.id}&ptr=${this.props.organization}`} className="f-14" onClick={() => selectCategory(category)}>
                        {translate("Показать все", "app.showAll")}
                      </Link>
                    </div>
                  </div>
                  <OrganizationSlider
                    organizations={category.organizations}
                    partner={this.props.organization}
                    category={category}
                    totalCount={category.organizations_count}
                    className="partner-detail-page__category-slider"
                  />
                </div>
              ))}
            </InfiniteScroll>
          )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  homeOrganizations: state.homeStore.homeOrganizations,
})

const mapDispatchToProps = dispatch => ({
  getHomeOrganizations: (params, isNext) => dispatch(getHomeOrganizations(params, isNext)),
  selectCategory: category => dispatch(selectCategory(category)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HorizontalScrollOrgs);