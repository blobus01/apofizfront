import React, {Component} from 'react';
import Preloader from '../../components/Preloader';
import EmptyBox from '../../components/EmptyBox';
import InfiniteScroll from 'react-infinite-scroll-component';
import {connect} from 'react-redux';
import {getOrgsByCategories} from '../../store/actions/homeActions';
import OrganizationDscCard from '../../components/Cards/OrganizationDscCard';
import {translate} from '../../locales/locales';
import {DEFAULT_LIMIT} from '../../common/constants';

class VerticalScrollOrgs extends Component {
  constructor(props) {
    super(props);
    this.category = props.category;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      category: props.category,
      partner: props.organization,
      hasMore: true,
    }
  }

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1
      this.props.getOrgsByCategories({
        ...this.state,
        page: nextPage,
      }, true);

      return this.setState({ ...this.state, hasMore: true, page: nextPage })
    }
    this.setState({ ...this.state, hasMore: false });
  }

  render() {
    const { page, hasMore } = this.state;
    const { orgsByCategories } = this.props;
    const { data, loading } = orgsByCategories;

    return (
      <div className="container">
        {(page === 1 && loading)
          ? <Preloader />
          : (!data || (data && !data.total_count))
            ? <EmptyBox title={translate("Нет организации", "org.noOrganizations")} />
            : (
              <InfiniteScroll
                dataLength={Number(data.list.length) || 0}
                next={() => this.getNext(data.total_pages)}
                hasMore={hasMore}
                loader={null}
              >
                {data.list.map(organization => (
                  <OrganizationDscCard
                    key={organization.id}
                    organization={organization}
                    className="organizations-page__card"
                  />
                ))}
              </InfiniteScroll>
            )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgsByCategories: state.homeStore.orgsByCategories,
})

const mapDispatchToProps = dispatch => ({
  getOrgsByCategories: (params, isNext) => dispatch(getOrgsByCategories(params, isNext)),
})

export default connect(mapStateToProps, mapDispatchToProps)(VerticalScrollOrgs);