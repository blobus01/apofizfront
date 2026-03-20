import React from 'react';
import * as moment from 'moment';
import {injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import MobileSearchHeader from '../../components/MobileSearchHeader';
import ReceiptCard from '../../components/Cards/ReceiptCard';
import Preloader from '../../components/Preloader';
import SavingsBlock from '../../components/UI/SavingsBlock';
import {DATE_FORMAT_DD_MMMM_YYYY, DEFAULT_LIMIT} from '../../common/constants';
import MenuDatePicker from '../../components/MenuDatePicker';
import MobileMenu from '../../components/MobileMenu';
import {translate} from '../../locales/locales';
import {getOrganizationTitle} from '../../store/actions/organizationActions';
import {getOrgTransactions} from '../../store/actions/receiptActions';
import {getOrgGeneralStatistics} from '../../store/actions/statisticActions';
import {canGoBack} from '../../common/helpers';
import ReceiptsEmpty from './empty';
import './index.scss';
import {throttle} from "../../common/utils";

class ReceiptsSalesPage extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
    this.processedBy = (props.user && props.user.id) || null;
    this.mounted = true;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      search: '',
      start: null,
      end: null,
      hasMore: true,
      showMenu: false,
      loading: true,
    }
  }

  componentDidMount() {
    this.getReceipts();
    this.getSummary();
    this.props.getOrganizationTitle(this.orgID);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getReceipts = async (params, isNext) => {
    const {page, limit, start, end, loading, search} = this.state;
    await this.props.getOrgTransactions({page, limit, start, end, processed_by: this.processedBy, organization: this.orgID, search, ...params}, isNext);
    loading && this.mounted && this.setState(prevState => ({...prevState, loading: false}));
  }

  getSummary = () => {
    const {start, end} = this.state;
    this.props.getOrgGeneralStatistics(this.orgID, {start, end});
  }

  doSearch = throttle(this.getReceipts, 350);

  onSearchChange = e => {
    const {value} = e.target;
    if (value !== this.state.search) {
      this.setState(prevState => ({...prevState, search: value, page: 1, hasMore: true}), this.doSearch);
    }
  };

  onSearchCancel = () => {
    if (this.state.search !== '') {
      this.setState(prevState => ({...prevState, search: '', page: 1, hasMore: true}), () => {
        this.getReceipts();
      });
    }
  };

  getNext = totalPages => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      return this.setState(prevState => ({...prevState, hasMore: true, page: nextPage}), () => {
        this.getReceipts(null, true);
      });
    }
    this.setState(prevState => ({ ...prevState, hasMore: false }));
  }

  render() {
    const {
      orgTransactions: receipts,
      orgGeneralStatistics: stats,
      orgTitle,
      history,
      intl,
      locale,
    } = this.props;
    const {loading, page, showMenu, start, end, hasMore, search} = this.state;

    return (
      <div className="receipts-sales-page">
        <MobileSearchHeader
          title={orgTitle && orgTitle.title}
          searchValue={search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={this.onSearchCancel}
          onBack={() => canGoBack(history) ? history.goBack() : history.push('/statistics/sales')}
          searchPlaceholder={intl.formatMessage({ id: "placeholder.searchByReceiptID", defaultMessage: "Поиск по номеру чека"})}
        />

        <div className="receipts-sales-page__content">
          <div className="receipts-sales-page__top" onClick={() => this.setState({ ...this.state, showMenu: true })}>
            <div className="container">
              <SavingsBlock
                total={stats && stats.total_spent}
                savings={stats && stats.total_savings}
                currency={stats && stats.currency}
                className="receipts-sales-page__summary"
              />
              <div className="receipts-sales-page__calendar f-14 f-500" >
                {(start && end)
                  ? translate("с {start} - по {end}", "app.dateRange", { start: moment(start).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY), end: moment(end).locale(locale).format(DATE_FORMAT_DD_MMMM_YYYY)})
                  : translate("За все время", "app.allTime")
                }
              </div>
            </div>
          </div>

          <div className="receipts-sales-page__list">
            <div className="container">
              {(page === 1 && loading)
                ?  <Preloader />
                : (!receipts || (receipts && !receipts.total_count))
                  ? <ReceiptsEmpty organization={this.orgID} searched={!!search} />
                  : (
                    <InfiniteScroll
                      dataLength={Number(receipts.list.length) || 0}
                      next={() => this.getNext(receipts.total_pages)}
                      hasMore={hasMore}
                      loader={null}
                    >
                      {receipts.list.map(receipt => (
                        <ReceiptCard
                          key={receipt.id}
                          receipt={receipt}
                          organization={this.orgID}
                          to={`/organizations/${this.orgID}/receipts-sales/${receipt.id}?purchase_type=${receipt.purchase_type}`}
                          className="receipts-sales-page__item"
                        />
                      ))}
                    </InfiniteScroll>
                  )}
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={showMenu}
          contentLabel="Параметры даты"
          onRequestClose={() => this.setState({...this.state, showMenu: false})}
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
                showMenu: false
              }), () => {
                this.getReceipts();
                this.getSummary();
              });
            }}
          />
        </MobileMenu>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgTitle: state.organizationStore.orgTitle,
  orgTransactions: state.receiptStore.orgTransactions,
  orgGeneralStatistics: state.statisticStore.orgGeneralStatistics,
  locale: state.userStore.locale,
  user: state.userStore.user,
});

const mapDispatchToProps = dispatch => ({
  getOrganizationTitle: id => dispatch(getOrganizationTitle(id)),
  getOrgGeneralStatistics: (orgID, params) => dispatch(getOrgGeneralStatistics(orgID, params)),
  getOrgTransactions: (params, isNext) => dispatch(getOrgTransactions(params, isNext)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ReceiptsSalesPage));