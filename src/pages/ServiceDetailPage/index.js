import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  DATE_FORMAT_YYYY_MM_DD,
  DEFAULT_LIMIT,
  TIME_FORMAT_HH_MM,
} from "../../common/constants";
import Preloader from "../../components/Preloader";
import {
  clearServiceData,
  getServiceCategories,
  getServiceOrganizations,
  setViews,
} from "../../store/actions/commonActions";
import { canGoBack } from "../../common/helpers";
import OrganizationMainCard from "../../components/Cards/OrganizationMainCard";
import { OrganizationWorkingTime } from "../../components/OrganizationWorkingTime";
import OrganizationAverageCheck from "../../components/OrganizationAverageCheck";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { throttle } from "../../common/utils";
import HorizontalFilterSelect from "../../components/HorizontalFilterSelect";
import EmptyImage from "../../assets/images/empty_cart.png";
import { translate } from "../../locales/locales";
import "./index.scss";
import { VIEW_TYPES } from "@components/GlobalLayer";
import PostFeedCard from "../../components/Cards/PostFeedCard";
import api from "@/axios-api";
import { Layer } from "@components/Layer";
import SubcategoryFilterView from "@components/SubcategoryFilterView";
import { ORDERING_OPTIONS } from "@components/CategoryFilterView";

class ServiceDetailPage extends Component {
  constructor(props) {
    super(props);
    this.serviceID = props.match.params.serviceID;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      country: props.region && (props.region.country_code || props.region.code),
      selectedCategory: null,
      hasMore: true,
      search: "",
      // New for tabs/products
      showFilters: false,
      selectedSubcategory: null,
      selectedSubcategories: [],
      orderBy: ORDERING_OPTIONS[0].value,
      activeTab: "organizations", // or 'products'
      products: [],
      productsPage: 1,
      productsHasMore: true,
      productsLoading: false,
      productsTotalPages: 1,
    };
    this.prevScrollY = 0;
  }

  componentDidMount() {
    this.getItems();
    this.props.getServiceCategories(this.serviceID, {
      country: this.state.country,
    });
    window.addEventListener("scroll", this.handleStickyScroll);
  }

  componentWillUnmount() {
    this.props.clearServiceData();
    window.removeEventListener("scroll", this.handleStickyScroll);
  }

  handleStickyScroll = () => {
    const currentScrollY = window.scrollY;
    const header = document.querySelector(
      ".service-detail-page .mobile-search-header__wrap"
    );
    if (!header) return;
    if (currentScrollY > this.prevScrollY) {
      // Скроллим вниз — добавляем класс
      header.classList.remove("scrolled-up");
    } else {
      header.classList.add("scrolled-up");
      // Скроллим вверх — убираем класс
    }
    this.prevScrollY = currentScrollY;
  };

  getItems = (isNext, extraParams = {}, extraState = {}) => {
    const params = {
      page: this.state.page,
      limit: this.state.limit,
      country: this.state.country,
      current_timestamp_lt: `${moment().format(
        DATE_FORMAT_YYYY_MM_DD
      )}T${moment().format(TIME_FORMAT_HH_MM)}:00`,
      search: this.state.search,
    };
    this.setState((prevState) => ({ ...prevState, ...extraState }));
    this.props.getServiceOrganizations(
      this.serviceID,
      { ...params, ...extraParams },
      isNext
    );
  };

  getNext = (totalPages) => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      return this.getItems(
        true,
        { page: nextPage, search: this.state.search },
        { hasMore: true, page: nextPage }
      );
    }
    this.setState((prevState) => ({ ...prevState, hasMore: false }));
  };

  onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState(
        (prevState) => ({
          ...prevState,
          search: value,
          page: 1,
          // Reset filters when searching
          selectedSubcategories: [],
          orderBy: ORDERING_OPTIONS[0].value,
        }),
        this.doSearch
      );
    }
  };

  doSearch = throttle(this.getItems, 350);

  searchCancel = () => {
    if (this.state.search !== "") {
      this.setState(
        {
          page: 1,
          search: "",
          // Reset filters when canceling search
          selectedSubcategories: [],
          orderBy: ORDERING_OPTIONS[0].value,
        },
        this.getItems
      );
    }
  };

  onServiceCategorySelect = (category) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        page: 1,
        selectedCategory: category,
        // Reset filters when selecting category
        selectedSubcategories: [],
        orderBy: ORDERING_OPTIONS[0].value,
      }),
      () => {
        this.getItems(false, { subcategory: category && category.id });
        // Also update products if we're on products tab
        if (this.state.activeTab === "products") {
          const params = {};
          if (category && category.id) {
            params.subcategories = category.id;
          }
          if (this.state.orderBy) {
            params.ordering = this.state.orderBy;
          }
          this.getProducts(false, params);
        }
      }
    );
  };

  // Add new filter handlers for products tab
  onSubcategoryFilterSelect = (subcategory) => {
    const { selectedSubcategories } = this.state;
    const selections = selectedSubcategories.map((item) => item.id);

    this.setState(
      (prevState) => ({
        ...prevState,
        productsPage: 1,
        productsHasMore: true,
        selectedSubcategories: selections.includes(subcategory.id)
          ? prevState.selectedSubcategories.filter(
              (item) => item.id !== subcategory.id
            )
          : [...prevState.selectedSubcategories, subcategory],
      }),
      () => {
        // Update products with new filter
        this.getProducts(false, {
          subcategories: this.state.selectedSubcategories
            .map((item) => item.id)
            .join(","),
          ordering: this.state.orderBy,
        });
      }
    );
  };

  onOrderSelect = (ordering) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        orderBy: ordering.value,
        productsPage: 1,
        productsHasMore: true,
      }),
      () => {
        // Update products with new ordering
        this.getProducts(false, {
          subcategories: this.state.selectedSubcategories
            .map((item) => item.id)
            .join(","),
          ordering: this.state.orderBy,
        });
      }
    );
  };

  onFilterClear = () => {
    this.setState(
      (prevState) => ({
        ...prevState,
        selectedSubcategories: [],
        orderBy: ORDERING_OPTIONS[0].value,
        productsPage: 1,
        productsHasMore: true,
      }),
      () => {
        // Update products without filters
        this.getProducts(false, {
          ordering: this.state.orderBy,
        });
      }
    );
  };

  handleMap = () => {
    const { serviceOrganizations, dispatch, serviceCategories } = this.props;
    const locations =
      serviceOrganizations.data?.list?.map((org) => ({
        id: org.id,
        title: org.title,
        latitude: org.latitude, // Assuming org has latitude
        longitude: org.longitude, // Assuming org has longitude
        image: org.image?.small || org.image?.file, // Assuming image structure
      })) || [];

    dispatch(
      setViews({
        type: VIEW_TYPES.map_service,
        serviceID: this.serviceID,
        location: locations?.length > 0 ? locations : null,
        serviceCategories: serviceCategories.data || null,
        onCloseMap: () => {
          this.getItems();
        },
      })
    );
  };

  getProducts = (isNext = false, extraParams = {}, extraState = {}) => {
    const {
      productsPage,
      limit,
      country,
      search,
      selectedCategory,
      selectedSubcategories,
      orderBy,
    } = this.state;
    this.setState({ productsLoading: true });

    const params = {
      page: productsPage,
      limit,
      country,
      search,
      subcategories: selectedCategory ? selectedCategory.id : undefined,
      ordering: orderBy,
      ...extraParams,
    };

    // Handle subcategories filter
    if (selectedSubcategories && selectedSubcategories.length > 0) {
      params.subcategories = selectedSubcategories
        .map((item) => item.id)
        .join(",");
    }

    api
      .get(`/service/${this.serviceID}/items/`, {
        params,
      })
      .then((res) => {
        const list = res.data.list || res.data || [];
        const total_pages = res.data.total_pages || 1;
        this.setState((prevState) => ({
          products: isNext ? [...prevState.products, ...list] : list,
          productsHasMore: list.length === limit,
          productsLoading: false,
          productsTotalPages: total_pages,
          ...extraState,
        }));
      })
      .catch(() => {
        this.setState({ productsLoading: false });
      });
  };
  getNextProducts = () => {
    if (this.state.productsPage < this.state.productsTotalPages) {
      const nextPage = this.state.productsPage + 1;
      this.setState({ productsPage: nextPage }, () => {
        const params = {
          page: nextPage,
        };

        // Include current filters in next page request
        if (
          this.state.selectedSubcategories &&
          this.state.selectedSubcategories.length > 0
        ) {
          params.subcategories = this.state.selectedSubcategories
            .map((item) => item.id)
            .join(",");
        }
        if (this.state.orderBy) {
          params.ordering = this.state.orderBy;
        }

        this.getProducts(true, params);
      });
    } else {
      this.setState({ productsHasMore: false });
    }
  };
  handleTabSwitch = (tab) => {
    if (tab === this.state.activeTab) return;
    this.setState(
      {
        activeTab: tab,
        // Reset pagination for each tab
        page: 1,
        hasMore: true,
        productsPage: 1,
        productsHasMore: true,
        // Reset filters when switching tabs
        selectedSubcategories: [],
        orderBy: ORDERING_OPTIONS[0].value,
      },
      () => {
        if (tab === "products") {
          const params = {};
          if (this.state.selectedCategory && this.state.selectedCategory.id) {
            params.subcategories = this.state.selectedCategory.id;
          }
          if (this.state.orderBy) {
            params.ordering = this.state.orderBy;
          }
          this.getProducts(false, params);
        }
        if (tab === "organizations") this.getItems();
      }
    );
  };

  render() {
    const {
      page,
      hasMore,
      selectedCategory,
      activeTab,
      products,
      productsLoading,
      productsHasMore,
      showFilters,
      selectedSubcategory,
      selectedSubcategories,
      orderBy,
    } = this.state;
    const { serviceOrganizations, history, serviceCategories } = this.props;
    const { data, loading } = serviceOrganizations;
    return (
      <div className="service-detail-page">
        <MobileSearchHeader
          title={data ? data.name : ""}
          onSearchChange={this.onSearchChange}
          onBack={() =>
            canGoBack(history) ? history.goBack() : history.push(`/home/posts`)
          }
          onSearchCancel={this.searchCancel}
          onMap={activeTab === "organizations" ? this.handleMap : undefined}
          onFilterClick={
            activeTab === "products"
              ? () => this.setState({ showFilters: true })
              : undefined
          }
          filterCount={
            activeTab === "products" ? selectedSubcategories.length : 0
          }
        />
        {/* Tab Switcher */}
        <div
          className="container"
          style={{ display: "flex", margin: "0 auto 5px" }}
        >
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",

              borderBottom:
                activeTab === "organizations" ? "2px solid #007aff" : "none",
              color: activeTab === "organizations" ? "#007aff" : undefined,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => this.handleTabSwitch("organizations")}
          >
            {translate("Организации", "app.organizations")}
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",

              borderBottom:
                activeTab === "products" ? "2px solid #007aff" : "none",
              color: activeTab === "products" ? "#007aff" : undefined,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => this.handleTabSwitch("products")}
          >
            {translate("Товары", "shop.products")}
          </button>
        </div>
        <div className="service-detail-page__content">
          {serviceCategories.data &&
            (serviceCategories.data.list?.length > 0 ||
              serviceCategories.data.length > 0) && (
              <div className="sticky is-sticky service-detail-page__category-controls-list-wrap">
                <HorizontalFilterSelect
                  options={serviceCategories.data}
                  activeList={selectedCategory ? [selectedCategory.id] : []}
                  onSelect={this.onServiceCategorySelect}
                  filter={false}
                />
                <div className="organization-module__shop-controls-list-shadow" />
              </div>
            )}
          <div className="container">
            {/* Organizations Tab */}
            {activeTab === "organizations" &&
              (page === 1 && loading ? (
                <Preloader />
              ) : !data || (data && !data.list?.length) ? (
                <div className="organization-module__shop-empty">
                  <img
                    src={EmptyImage}
                    alt="Empty products"
                    style={{ maxWidth: "100%" }}
                  />
                  <div className="f-16 f-600">
                    {translate(
                      "У выбранной категории пока нет организаций",
                      "org.emptyServiceSubcategory"
                    )}
                  </div>
                </div>
              ) : (
                <InfiniteScroll
                  dataLength={Number(data.list?.length) || 0}
                  next={() => this.getNext(data.total_pages)}
                  hasMore={hasMore}
                  loader={null}
                >
                  <div className="service-detail-page__list">
                    {data.list.map((org) => (
                      <div
                        key={org.id}
                        className="service-detail-page__list-item-wrap"
                      >
                        <OrganizationMainCard
                          title={org.title}
                          type={org.types[0] && org.types[0].title}
                          image={org.image && org.image.medium}
                          verificationStatus={org.verification_status}
                          to={`/organizations/${org.id}`}
                          className="service-detail-page__list-card"
                        >
                          <div className="service-detail-page__group-wrap">
                            <div className="service-detail-page__bottom">
                              <OrganizationWorkingTime
                                start={org.opens_at}
                                end={org.closes_at}
                                status={org.time_working}
                                className="service-detail-page__group-time"
                              />
                              {org["avg_check"] && (
                                <OrganizationAverageCheck
                                  id={org.id}
                                  sum={org["avg_check"]}
                                  currency={org.currency}
                                  className="service-detail-page__avg-check"
                                  color="#fbbc05"
                                />
                              )}
                            </div>
                          </div>
                        </OrganizationMainCard>
                      </div>
                    ))}
                  </div>
                </InfiniteScroll>
              ))}
            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                {!productsLoading && products.length === 0 && (
                  <div className="organization-module__shop-empty">
                    <img
                      src={EmptyImage}
                      alt="Empty products"
                      style={{ maxWidth: "100%" }}
                    />
                  </div>
                )}
                <div className="home-posts-module__list grid_layout">
                  <InfiniteScroll
                    dataLength={products.length || 0}
                    next={this.getNextProducts}
                    hasMore={productsHasMore}
                    loader={productsLoading ? <Preloader /> : null}
                  >
                    <div className="service-detail-page__products-grid grid_layout__inner">
                      {products.map((product) => (
                        <PostFeedCard
                          key={product.id}
                          post={product}
                          organization={product.organization}
                          isGuest={!this.props.user}
                          isFromHomeFeed
                          className="home-posts-module__list-card"
                        />
                      ))}
                    </div>
                  </InfiniteScroll>
                </div>
              </div>
            )}
          </div>
        </div>
        <Layer isOpen={showFilters}>
          <SubcategoryFilterView
            orderBy={orderBy}
            selectedCategory={{
              subcategories: serviceCategories.data,
              name: data?.name,
              id: data?.id,
            }}
            activeList={selectedSubcategories.map((item) => item.id)}
            onOrderingSelect={this.onOrderSelect}
            onBack={() => this.setState({ showFilters: false })}
            onSelect={this.onSubcategoryFilterSelect}
            onClear={this.onFilterClear}
            onApply={() => this.setState({ showFilters: false })}
          />
        </Layer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  serviceOrganizations: state.commonStore.serviceOrganizations,
  serviceCategories: state.commonStore.serviceCategories,
  region: state.userStore.region,
  user: state.userStore.user,
});

const mapDispatchToProps = (dispatch) => ({
  getServiceOrganizations: (serviceID, params, isNext) =>
    dispatch(getServiceOrganizations(serviceID, params, isNext)),
  getServiceCategories: (serviceID, params) =>
    dispatch(getServiceCategories(serviceID, params)),
  clearServiceData: () => dispatch(clearServiceData()),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetailPage);
