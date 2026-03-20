import React from "react";
import * as classnames from "classnames";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";
import { getCitiesAndCountries } from "../../store/actions/commonActions";
import Preloader from "../../components/Preloader";
import { SocialIcon } from "../../components/UI/Icons";
import { translate } from "../../locales/locales";
import "./index.scss";
import debounce from "lodash.debounce";

class CityAndCountryView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = (nextLink, extraParams) => {
    const { limit } = this.state;
    this.props.getCitiesAndCountries({ limit, ...extraParams }, nextLink);
  };

  debouncedGetList = debounce(this.getList, 500);

  onChange = (e) => {
    const search = e.target.value;
    if (search.length > 1) {
      this.debouncedGetList(null, { search });
    }
    if (search.length === 0) {
      this.debouncedGetList();
    }
    return this.setState({ search });
  };

  handleClick = (value) => {
    this.props.onSelect(value);
    this.props.exitOnSelect && this.props.onBack();
  };

  render() {
    const { search } = this.state;
    const { data, loading, hasMore } = this.props.citiesAndCountries;
    const { value, onBack, intl, className } = this.props;
    const isEmpty = !(data && data.results && data.results.length);

    return (
      <div className={classnames("cities-and-countries-view", className)}>
        <div className="cities-and-countries-view__header">
          <div className="container">
            <div className="cities-and-countries-view__search">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.2583 16.075L14.425 13.25C15.3392 12.0854 15.8352 10.6472 15.8333 9.16667C15.8333 7.84813 15.4423 6.5592 14.7098 5.46287C13.9773 4.36654 12.9361 3.51206 11.7179 3.00747C10.4997 2.50289 9.15927 2.37087 7.86607 2.6281C6.57286 2.88534 5.38497 3.52027 4.45262 4.45262C3.52027 5.38497 2.88534 6.57286 2.6281 7.86607C2.37087 9.15927 2.50289 10.4997 3.00747 11.7179C3.51206 12.9361 4.36654 13.9773 5.46287 14.7098C6.5592 15.4423 7.84813 15.8333 9.16667 15.8333C10.6472 15.8352 12.0854 15.3392 13.25 14.425L16.075 17.2583C16.1525 17.3364 16.2446 17.3984 16.3462 17.4407C16.4477 17.4831 16.5567 17.5048 16.6667 17.5048C16.7767 17.5048 16.8856 17.4831 16.9872 17.4407C17.0887 17.3984 17.1809 17.3364 17.2583 17.2583C17.3364 17.1809 17.3984 17.0887 17.4407 16.9872C17.4831 16.8856 17.5048 16.7767 17.5048 16.6667C17.5048 16.5567 17.4831 16.4477 17.4407 16.3462C17.3984 16.2446 17.3364 16.1525 17.2583 16.075ZM4.16667 9.16667C4.16667 8.17776 4.45991 7.21106 5.00932 6.38882C5.55873 5.56657 6.33962 4.92571 7.25325 4.54727C8.16688 4.16883 9.17222 4.06982 10.1421 4.26274C11.112 4.45567 12.0029 4.93187 12.7022 5.63114C13.4015 6.3304 13.8777 7.22131 14.0706 8.19122C14.2635 9.16112 14.1645 10.1665 13.7861 11.0801C13.4076 11.9937 12.7668 12.7746 11.9445 13.324C11.1223 13.8734 10.1556 14.1667 9.16667 14.1667C7.84059 14.1667 6.56882 13.6399 5.63114 12.7022C4.69345 11.7645 4.16667 10.4928 4.16667 9.16667Z"
                  fill="#818C99"
                />
              </svg>
              <input
                type="text"
                name="search_city"
                value={search}
                placeholder={intl.formatMessage({
                  id: "app.cityAndCounty",
                  defaultMessage: "Страна или город",
                })}
                onChange={this.onChange}
              />
              <button type="button" onClick={onBack}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM10.4657 4.26022L8 6.727L5.5357 4.26022C5.18423 3.90875 4.61438 3.90875 4.26291 4.26022C3.91144 4.6117 3.91144 5.18154 4.26291 5.53302L6.728 8.001L4.26291 10.47C3.91144 10.8215 3.91144 11.3913 4.26291 11.7428C4.61438 12.0943 5.18423 12.0943 5.5357 11.7428L8 9.275L10.4657 11.7428C10.8172 12.0943 11.387 12.0943 11.7385 11.7428C12.09 11.3913 12.09 10.8215 11.7385 10.47L9.272 8.001L11.7385 5.53302C12.09 5.18154 12.09 4.6117 11.7385 4.26022C11.387 3.90875 10.8172 3.90875 10.4657 4.26022Z"
                    fill="#99A2AD"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="cities-and-countries-view__list">
          <div className="container">
            {!loading && isEmpty && (
              <div className="cities-and-countries-view__empty">
                {translate("Поиск не дал результатов", "search.noResult")}
              </div>
            )}
            {!isEmpty && (
              <InfiniteScroll
                dataLength={data.results.length || 0}
                next={() => this.getList(data.next)}
                scrollableTarget="views_wrap_region_select"
                hasMore={hasMore}
                loader={null}
              >
                {(!search ||
                  (search &&
                    ("Земля".includes(search) ||
                      "Earth".includes(search)))) && (
                  <div
                    onClick={() => this.handleClick(null)}
                    className={classnames(
                      "cities-and-countries-view__item",
                      !value && "active"
                    )}
                  >
                    <p className="tl">
                      {translate("Планета Земля", "app.planetEarth")}
                    </p>
                    <SocialIcon />
                  </div>
                )}
                {data.results.map((item, idx) => {
                  const id = item.id || item.code;
                  const selectedID = value && (value.id || value.code);
                  return (
                    <div
                      key={id + idx}
                      onClick={() => this.handleClick(item)}
                      className={classnames(
                        "cities-and-countries-view__item",
                        id === selectedID && "active"
                      )}
                    >
                      <p className="tl">{item.name}</p>
                      {item.type === "countries" && (
                        <div className="cities-and-countries-view__item-flag">
                          <img
                            src={"https://apofiz.com" + item.flag}
                            alt={item.name}
                          />
                        </div>
                      )}

                      {item.type === "cities" && (
                        <div className="cities-and-countries-view__item-postal">
                          {item.postal}
                        </div>
                      )}
                    </div>
                  );
                })}
              </InfiniteScroll>
            )}
            {loading && (
              <Preloader className="cities-and-countries-view__preloader" />
            )}
          </div>
        </div>
      </div>
    );
  }
}

CityAndCountryView.propTypes = {
  value: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  exitOnSelect: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  citiesAndCountries: state.commonStore.citiesAndCountries,
});

const mapDispatchToProps = (dispatch) => ({
  getCitiesAndCountries: (params, isNext, nextLink) =>
    dispatch(getCitiesAndCountries(params, isNext, nextLink)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CityAndCountryView));
