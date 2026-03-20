import React, {Component} from 'react';
import {connect} from 'react-redux';
import MobileSearchHeader from '../../components/MobileSearchHeader';
import {getBannerOrganizations} from '../../store/actions/bannerActions';
import Preloader from '../../components/Preloader';
import EmptyBox from '../../components/EmptyBox';
import InfiniteScroll from 'react-infinite-scroll-component';
import OrganizationCard from '../../components/Cards/OrganizationCard';
import {translate} from '../../locales/locales';
import './index.scss';

class BannerOrganizationsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: 10,
      hasMore: true,
      search: '',
    }
  }

  componentDidMount() {
    this.props.getBannerOrganizations(this.props.organization, this.state)
  }

  onSearchChange = e => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState({ ...this.state, search: value, page: 1, hasMore: true });
      this.props.getBannerOrganizations(this.props.organization, { ...this.state, search: value, page: 1 });
    }
  }

  onSearchCancel = () => {
    if (this.state.search !== '') {
      this.setState({ ...this.state, search: '', hasMore: true });
      this.props.getBannerOrganizations(this.props.organization, { ...this.state, search: '', page: 1 });
    }
  };

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1
      this.props.getBannerOrganizations(this.props.organization, {
        ...this.state,
        page: nextPage,
      }, true);

      return this.setState({ ...this.state, hasMore: true, page: nextPage })
    }
    this.setState({ ...this.state, hasMore: false });
  }

  render() {
    const { page, search } = this.state;
    const { onBack, onSelect, bannerOrganizations } = this.props;
    const { data, loading } = bannerOrganizations;

    return (
      <div className="banner-organizations-view">
        <MobileSearchHeader
          title={translate("Организации", "app.organizations")}
          onBack={onBack}
          searchValue={search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={this.onSearchCancel}
        />

        <div className="container">
          <div className="banner-organizations-view__content">
            {(page === 1 && loading)
              ?  <Preloader />
              : (!data || (data && !data.total_count))
                ? <EmptyBox
                  title={translate("Нет организаций", "org.noOrganizations")}
                  description={!!this.state.search && translate("Поиск не дал результатов", "hint.noSearchResult")} />
                : (
                  <InfiniteScroll
                    dataLength={Number(data.list.length) || 0}
                    next={() => this.getNext(data.total_pages)}
                    hasMore={this.state.hasMore}
                    loader={null}
                  >
                    {data.list.map(organization => (
                      <OrganizationCard
                        key={organization.id}
                        id={organization.id}
                        image={organization.image && organization.image.medium}
                        title={organization.title}
                        type={organization.types[0] && organization.types[0].title}
                        onClick={() => onSelect(organization)}
                        className="banner-organizations-view__item"
                        size={60}
                      />
                    ))}
                  </InfiniteScroll>
                )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  bannerOrganizations: state.bannerStore.bannerOrganizations,
})

const mapDispatchToProps = dispatch => ({
  getBannerOrganizations: (orgID, params, isNext) => dispatch(getBannerOrganizations(orgID, params, isNext)),
})

export default connect(mapStateToProps, mapDispatchToProps)(BannerOrganizationsView);