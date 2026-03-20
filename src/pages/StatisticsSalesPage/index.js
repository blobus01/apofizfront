import React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import {getUserStatisticSaleTotals} from '../../store/actions/statisticActions';
import {getMyAffiliatedOrganizations} from '../../store/actions/organizationActions';
import {getUnprocessedTranCount} from '../../store/actions/shopActions';
import MobileSearchHeader from '../../components/MobileSearchHeader';
import PartnerCard from '../../components/Cards/PartnerCard';
import Preloader from '../../components/Preloader';
import SavingsBlock from '../../components/UI/SavingsBlock';
import MobileMenu from '../../components/MobileMenu';
import MenuDatePicker from '../../components/MenuDatePicker';
import {DATE_FORMAT_DD_MMMM_YYYY, DEFAULT_LIMIT} from '../../common/constants';
import StatisticsEmpty from '../StatisticsOrdersPage/empty';
import {translate} from '../../locales/locales';
import TabLinks from '../../components/TabLinks';
import './index.scss';

const TABS = [
  {label: 'Покупки', path: '/statistics/orders', translation: 'shop.orders'},
  {label: 'Продажи', path: '/statistics/sales', translation: 'shop.sales', withCount: true},
];

class StatisticsSalesPage extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      start: null,
      end: null,
      showMenu: false,
      loading: true,
      hasMore: true,
    }
  }

  componentDidMount() {
    this.getStatistics();
    this.getSummary();
    this.props.getUnprocessedTranCount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getStatistics = async (params, isNext) => {
    const {page, limit, start, end, loading} = this.state;
    await this.props.getOrgUserHasTransactionsAsSeller({page, limit, start, end, ...params}, isNext);
    loading && this.mounted && this.setState(prevState => ({...prevState, loading: false}));
  }

  getSummary = () => {
    const {start, end} = this.state;
    this.props.getUserStatisticSaleTotals({start, end});
  }

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      this.getStatistics({page: nextPage}, true);
      return this.setState(prevState => ({...prevState, hasMore: true, page: nextPage}));
    }
    this.setState(prevState => ({...prevState, hasMore: false}));
  }

  render() {
    const {
      orgUserHasTransactionsAsSeller: data,
      userStatisticSaleTotals: stats,
      unprocessedTransCount,
      locale,
      history
    } = this.props;
    const {page, start, end, loading, showMenu} = this.state;

    return (
      <div className="statistics-sales-page">
        <MobileSearchHeader
          onBack={() => history.goBack()}
          title={translate("Покупки / Продажи", "statistics.salesAndOrders")}
        />

        <div className="container">
          <TabLinks links={TABS.map(tab => tab.withCount ? ({...tab, count: unprocessedTransCount}) : tab)} />
        </div>

        <div className="statistics-sales-page__content">
          <div className="statistics-sales-page__top" onClick={() => this.setState({ ...this.state, showMenu: true })}>
            <div className="container">
              <SavingsBlock
                total={stats && stats.total_spent}
                savings={stats && stats.total_savings}
                currency={stats && stats.currency}
                className="statistics-sales-page__summary"
              />
              <div className="statistics-sales-page__calendar f-14 f-500">
                {(start && end)
                  ? translate("с {start} - по {end}", "app.dateRange", { start: moment(start).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY), end: moment(end).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)})
                  : translate("За все время", "app.allTime")
                }
              </div>
            </div>
          </div>

          <div className="statistics-sales-page__list">
            <div className="container">
              {(page === 1 && loading)
                ? <Preloader />
                : (!data || (data && !data.total_count))
                  ? <StatisticsEmpty />
                  : (
                    <InfiniteScroll
                      dataLength={Number(data.list.length) || 0}
                      next={() => this.getNext(data.total_pages)}
                      hasMore={this.state.hasMore}
                      loader={null}
                    >
                      {data.list.map(partner => (
                        <PartnerCard
                          key={partner.id}
                          partner={partner}
                          count={partner.unprocessed_transaction_count}
                          to={`/organizations/${partner.id}/receipts`}
                          className="statistics-sales-page__item"
                        />
                      ))}
                    </InfiniteScroll>
                  )}
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={showMenu}
          contentLabel={translate("Параметры даты", "app.dateOptions")}
          onRequestClose={() => this.setState(prevState => ({...prevState, showMenu: false}))}
        >
          <MenuDatePicker
            start={start}
            end={end}
            locale={locale}
            onChange={range => {
              this.setState(prevState => ({
                ...prevState,
                ...range,
                page: 1,
                hasMore: true,
                showMenu: false,
                loading: true
              }), () => {
                this.getSummary();
                this.getStatistics();
              })
            }}
          />
        </MobileMenu>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgUserHasTransactionsAsSeller: state.organizationStore.orgUserHasTransactionsAsSeller,
  userStatisticSaleTotals: state.statisticStore.userStatisticSaleTotals,
  unprocessedTransCount: state.shopStore.unprocessedTransCount,
  locale: state.userStore.locale,
})

const mapDispatchToProps = dispatch => ({
  getOrgUserHasTransactionsAsSeller: (params, isNext) => dispatch(getMyAffiliatedOrganizations(params, isNext)),
  getUserStatisticSaleTotals: params => dispatch(getUserStatisticSaleTotals(params)),
  getUnprocessedTranCount: () => dispatch(getUnprocessedTranCount()),
})

export default connect(mapStateToProps, mapDispatchToProps)(StatisticsSalesPage);