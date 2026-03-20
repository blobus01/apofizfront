import React from "react";
import { connect } from "react-redux";
import {
  BackArrow,
  LocationIcon,
  SearchIcon,
  SocialIcon,
} from "../../components/UI/Icons";
import OrganizationSlider from "../../components/OrganizationSlider";
import { Link } from "react-router-dom";
import Preloader from "../../components/Preloader";
import BannerSlider from "../../components/BannerSlider";
import InfiniteScroll from "react-infinite-scroll-component";
import { translate } from "../../locales/locales";
import EmptyImg from "../../assets/images/empty_home.png";
import { setViews } from "../../store/actions/commonActions";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { setRegion } from "../../store/actions/userActions";
import {
  getCategoryDetail,
  getHomeOrganizations,
  getLocalBanners,
  selectCategory,
} from "../../store/actions/homeActions";

import "./index.scss";

const DEFAULT_LIMIT = 5;

class HomeModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      hasMore: true,
    };
  }
  componentDidMount() {
    const { region } = this.props;

    const params = { page: 1, limit: DEFAULT_LIMIT };

    if (region && region.name !== "Планета Земля") {
      if (region.code) params.country = region.country_code || region.code;
      if (region.id) params.city = region.id;
    }

    this.props.getHomeOrganizations(params);
    this.props.getLocalBanners(params);
  }

  componentDidUpdate(prevProps) {
    if (this.props.region && prevProps.region?.id !== this.props.region.id) {
      const { region } = this.props;
      const params = { page: 1, limit: DEFAULT_LIMIT };

      if (region.name !== "Планета Земля") {
        if (region.code) params.country = region.country_code || region.code;
        if (region.id) params.city = region.id;
      }

      this.props.getHomeOrganizations(params);
      this.props.getLocalBanners(params);

      this.setState({ page: 1, hasMore: true });
    }
  }

  getNext = (totalPages) => {
    const { region } = this.props;

    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;

      const params = { page: nextPage, limit: DEFAULT_LIMIT };

      if (region && region.name !== "Планета Земля") {
        if (region.code) params.country = region.country_code || region.code;
        if (region.id) params.city = region.id;
      }

      this.props.getHomeOrganizations(params, true);
      this.setState({ hasMore: true, page: nextPage });
    } else {
      this.setState({ hasMore: false });
    }
  };

  onRegionClick = () => {
    this.props.setViews({
      type: VIEW_TYPES.region_select,
      value: this.props.region,
      onSelect: (selectedRegion) => {
        this.props.setRegion(selectedRegion);
        window.location.reload();
      },
    });
  };

  render() {
    const {
      homeOrganizations,
      localBanners,
      selectCategory,
      region,
      homePartners,
    } = this.props;

    const { data, loading } = homeOrganizations;

    const organizationsLoaded = homeOrganizations.data && !loading;
    const bannersLoaded = localBanners.data !== undefined;

    const isEmpty =
      organizationsLoaded &&
      bannersLoaded &&
      !homeOrganizations.data?.list?.length &&
      !localBanners.data?.length;

    const userCountry = region?.country_code || region?.code;
    const userCity = region?.id;

    // Фильтрация баннеров по стране и городу
    const filteredBanners =
      localBanners?.data?.filter((banner) => {
        if (banner.country_code && banner.country_code !== userCountry)
          return false;
        if (banner.city_id && banner.city_id !== userCity) return false;
        return true;
      }) || [];

    return (
      <div className="home-module">
        <div className="home-module-header__wrap">
          <div className="container">
            <div className="home-module-header row">
              <div className="home-module-header__logo">
                <Link to="/">
                  <BackArrow />
                </Link>
              </div>

              <div
                className="home-module-header__region"
                onClick={this.onRegionClick}
              >
                {region ? (
                  <LocationIcon className="home-module-header__region-location" />
                ) : (
                  <SocialIcon />
                )}
                <p className="home-module-header__region-title f-16 f-600 tl">
                  {region
                    ? region.name
                    : translate("Планета Земля", "app.planetEarth")}
                </p>
                <svg
                  className="home-module-header__region-arrow"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.45442 0.691051C1.06285 0.384877 0.497225 0.454099 0.19105 0.845663C-0.115124 1.23723 -0.0459015 1.80286 0.345663 2.10903L4.4423 5.3123C4.76791 5.5669 5.22507 5.56699 5.55078 5.31252L9.65074 2.10925C10.0424 1.80323 10.1119 1.23763 9.80585 0.845942C9.49983 0.454257 8.93423 0.384813 8.54255 0.690833L4.99691 3.46101L1.45442 0.691051Z"
                    fill="#4285F4"
                  />
                </svg>
              </div>

              <Link to="/home/search" className="home-module-header__search">
                <SearchIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="home-module__content">
          {isEmpty ? (
            <div className="home-module__empty">
              <div className="container">
                <div className="home-module__empty-image">
                  <img src={EmptyImg} alt="No organizations" />
                </div>
                <p className="home-module__empty-text f-16 f-600">
                  {translate(
                    "В данной локации нет зарегистрированных организаций и баннеров",
                    "home.emptyBoth"
                  )}
                </p>
              </div>
            </div>
          ) : (
            ""
          )}
          {filteredBanners.length > 0 && (
            <div className="container">
              <div className="home-module__banners">
                <BannerSlider
                  key="mainBannerSlider"
                  banners={filteredBanners}
                />
              </div>
            </div>
          )}

          <div className="home-module__categories">
            {!data && loading && <Preloader />}
            {data && (
              <InfiniteScroll
                dataLength={data.list.length}
                next={() => this.getNext(data.total_pages)}
                hasMore={this.state.hasMore}
                loader={<Preloader />}
                className="home-module__scroller"
                style={{ overflow: "hidden", transition: "none" }} // 🚫 отключаем анимацию
              >
                {data.list.map((category) => (
                  <div
                    key={category.id}
                    className="home-module__category"
                    style={{ transition: "none" }} // 🚫 чтобы категории не анимировались при добавлении
                  >
                    <div className="container">
                      <div className="home-module__category-top row">
                        <h2 className=" f-600">{category.name}</h2>
                        <Link
                          to={`/home/organizations?cat=${category.id}`}
                          className="f-14"
                          onClick={() => selectCategory(category)}  
                        >
                          {translate("Показать все", "app.showAll")}
                        </Link>
                      </div>
                    </div>
                    <OrganizationSlider
                      organizations={category.organizations}
                      category={category}
                      totalCount={category.organizations_count}
                      className="home-module__category-slider"
                    />
                  </div>
                ))}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  region: state.userStore.region,
  homeOrganizations: state.homeStore.homeOrganizations,
  homePartners: state.homeStore.homePartners,
  localBanners: state.homeStore.localBanners,
});

const mapDispatchToProps = (dispatch) => ({
  getHomeOrganizations: (params, isNext) =>
    dispatch(getHomeOrganizations(params, isNext)),
  getLocalBanners: (params) => dispatch(getLocalBanners(params)),
  getCategoryDetail: (catID) => dispatch(getCategoryDetail(catID)),
  selectCategory: (category) => dispatch(selectCategory(category)),
  setViews: (view) => dispatch(setViews(view)),
  setRegion: (region) => dispatch(setRegion(region)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeModule);
