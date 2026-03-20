import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import {getBannersList} from '../../store/actions/bannerActions';
import {AddIcon} from '../../components/UI/Icons';
import Preloader from '../../components/Preloader';
import MobileTopHeader from '../../components/MobileTopHeader';
import EmptyBox from '../../components/EmptyBox';
import BannerCard from '../../components/Cards/BannerCard';
import {translate} from '../../locales/locales';
import './index.scss';

class BannersPage extends Component {
  constructor(props) {
    super(props);
    this.organization = props.match.params.id;
    this.state = {
      page: 1,
      limit: 10,
      hasMore: true,
    }
  }

  componentDidMount() {
    this.props.getBannersList({ organization: this.organization, ...this.state });
  }

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1
      this.props.getBannersList({
        ...this.state,
        organization: this.organization,
        page: nextPage,
      }, true);

      return this.setState({ ...this.state, hasMore: true, page: nextPage })
    }
    this.setState({ ...this.state, hasMore: false });
  }

  render() {
    const { page } = this.state;
    const { bannersList, history } = this.props;
    const { data, loading } = bannersList;

    return (
      <div className="banners-page">
        <MobileTopHeader
          title={translate("Баннеры", "app.banners")}
          onBack={() => history.push(`/organizations/${this.organization}/partners`)}
          renderRight={() => (
            <Link
              className="banners-page__add"
              to={`/organizations/${this.organization}/banners/create`}
            >
              <AddIcon />
            </Link>
          )}
        />

        <div className="banners-page__content">'
      
          <div className="container">
            {(page === 1 && loading)
              ?  <Preloader />
              : (!data || (data && !data.total_count))
                ? <EmptyBox title={translate("Нет баннеров", "banners.empty")} />
                : (
                  <InfiniteScroll
                    dataLength={Number(data.list.length) || 0}
                    next={() => this.getNext(data.total_pages)}
                    hasMore={this.state.hasMore}
                    loader={null}
                  >
                    {data.list.map(banner => (
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        className="banners-page__card"
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
  bannersList: state.bannerStore.bannersList,
})

const mapDispatchToProps = dispatch => ({
  getBannersList: (params, isNext) => dispatch(getBannersList(params, isNext))
})

export default connect(mapStateToProps, mapDispatchToProps)(BannersPage);