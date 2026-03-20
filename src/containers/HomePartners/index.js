import React, { Component } from "react";
import { connect } from "react-redux";
import PartnersSlider from "./parentSlider";
import { translate } from "../../locales/locales";
import { getHomePartners } from "../../store/actions/homeActions";
import { Link } from "react-router-dom";
import Preloader from "../../components/Preloader";
import "./index.scss";

class HomePartners extends Component {
  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
  }

  componentDidMount() {
    const { country, city } = this.props.region;
    const { data } = this.props.homePartners;

    // --- ИСПРАВЛЕНИЕ 1: Проверка наличия данных ---
    // Запрашиваем данные только если их нет или список пуст
    if (!data || !data.list || data.list.length === 0) {
      this.props.getHomePartners({ country, city });
    }
  }

  handlePrevClick = () => {
    if (this.sliderRef.current && this.sliderRef.current.swiper) {
      this.sliderRef.current.swiper.slidePrev();
    }
  };

  handleNextClick = () => {
    if (this.sliderRef.current && this.sliderRef.current.swiper) {
      this.sliderRef.current.swiper.slideNext();
    }
  };

  render() {
    const { data, loading, darkTheme } = this.props.homePartners;

    // Проверка на полнейшее отсутствие данных (чтобы не рендерить пустой блок)
    const hasData = data && data.list && data.list.length > 0;

    // --- ИСПРАВЛЕНИЕ 2: Умный лоадер ---
    // Показываем лоадер ТОЛЬКО если идет загрузка И данных еще нет.
    // Если данные есть (кэш), но мы вдруг решили их обновить в фоне — лоадер не покажется.
    const showLoader = loading && !hasData;

    if (!hasData && !loading) {
      return null;
    }

    return (
      <div className="home-partners">
        <div className="home-partners__top container row">
          <div className="home-partners__top-title-wrap">
            <h2 className="home-partners__top-title f-16 f-700 tl">
              {translate("Партнеры", "app.partners")}
            </h2>
            <div className="slide-btns">
              {/* Ваши кнопки (svg) ... */}
              <svg
                width="10"
                height="16"
                viewBox="0 0 10 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={this.handlePrevClick}
                className="prev"
                style={{ cursor: "pointer" }}
              >
                <path
                  d="M8 2L2 8L8 14"
                  stroke="#007AFF"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                width="10"
                height="16"
                viewBox="0 0 10 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={this.handleNextClick}
                className="next"
                style={{ cursor: "pointer" }}
              >
                <path
                  d="M2 14L8 8L2 2"
                  stroke="#007AFF"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <Link
            to="/home/partners"
            className="home-partners__top-link f-14 f-500"
          >
            {translate("Показать все", "app.showAll")}
          </Link>
        </div>

        {/* Логика отображения: Лоадер ИЛИ Слайдер */}
        {showLoader ? (
          <Preloader className="home-partners__preloader" />
        ) : (
          hasData && (
            <PartnersSlider swiperRef={this.sliderRef} partners={data.list} />
          )
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  homePartners: state.homeStore.homePartners,
});

const mapDispatchToProps = (dispatch) => ({
  getHomePartners: (params) => dispatch(getHomePartners(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePartners);
