import React from "react";
import qs from "qs";
import * as moment from "moment";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import { getUserStatisticTotals } from "../../store/actions/statisticActions";
import { getOrganizationTitle } from "../../store/actions/organizationActions";
import { getReceipts } from "../../store/actions/receiptActions";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import InfiniteScroll from "react-infinite-scroll-component";
import SavingsBlock from "../../components/UI/SavingsBlock";
import {
  DATE_FORMAT_DD_MMMM_YYYY,
  DEFAULT_LIMIT,
} from "../../common/constants";
import MenuDatePicker from "../../components/MenuDatePicker";
import MobileMenu from "../../components/MobileMenu";
import ReceiptsEmpty from "./empty";
import { translate } from "../../locales/locales";
import ReceiptListSkeleton from "../../components/ReceiptListSkeleton";
import "./index.scss";

class ReceiptsPage extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.orgID = qs.parse(props.location.search.replace("?", "")).org || null;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      search: "",
      hasMore: true,
      showMenu: false,
      start: null,
      end: null,
      loading: true,
    };
  }

  componentDidMount() {
    if (this.orgID) {
      this.props.getOrganizationTitle(this.orgID);
      this.getSummary();
      this.getReceipts();
    } else {
      this.props.history.push("/home");
    }
  }

  getReceipts = async (params, isNext) => {
    const { page, limit, start, end, search, loading } = this.state;
    await this.props.getReceipts(
      { page, limit, start, end, search, organization: this.orgID, ...params },
      isNext
    );
    loading &&
      this.mounted &&
      this.setState((prevState) => ({ ...prevState, loading: false }));
  };

  getSummary = () => {
    const { start, end } = this.state;
    this.props.getUserStatisticTotals({ start, end, organization: this.orgID });
  };

  onSearchChange = (e) => {
    const { value } = e.target;
    if (value !== this.state.search) {
      this.setState(
        (prevState) => ({
          ...prevState,
          search: value,
          page: 1,
          hasMore: true,
        }),
        () => {
          this.getReceipts();
        }
      );
    }
  };

  onSearchCancel = () => {
    if (this.state.search !== "") {
      this.setState(
        (prevState) => ({ ...prevState, search: "", page: 1, hasMore: true }),
        () => {
          this.getReceipts();
        }
      );
    }
  };

  getNext = (totalPages) => {
    if (this.state.page < totalPages) {
      const nextPage = this.state.page + 1;
      return this.setState(
        (prevState) => ({ ...prevState, hasMore: true, page: nextPage }),
        () => {
          this.getReceipts(null, true);
        }
      );
    }
    this.setState((prevState) => ({ ...prevState, hasMore: false }));
  };

  render() {
    const { page, showMenu, start, end, loading, search } = this.state;
    const {
      receipts: data,
      userStatisticTotals: stats,
      history,
      intl,
      locale,
      orgTitle,
      location,
    } = this.props;
    const { r } = qs.parse(location.search.replace("?", ""));

    return (
      <div className="receipts-page">
        <MobileSearchHeader
          onBack={() =>
            !!r
              ? history.push(`/organizations/${this.orgID}`)
              : history.goBack("/statistics")
          }
          title={orgTitle && orgTitle.title}
          searchValue={search}
          onSearchChange={this.onSearchChange}
          onSearchCancel={this.onSearchCancel}
          searchPlaceholder={intl.formatMessage({
            id: "placeholder.searchByReceiptID",
            defaultMessage: "Поиск по номеру чека",
          })}
          radius={true}
        />

        <div className="receipts-page__content containerMaxц">
          <div
            className="receipts-page__top"
            onClick={() => this.setState({ ...this.state, showMenu: true })}
          >
            <div className="container">
              <SavingsBlock
                total={stats?.total_spent?.toLocaleString("en-US")}
                savings={stats && stats.total_savings?.toLocaleString("en-US")}
                currency={stats && stats.currency}
                className="receipts-page__summary"
              />
              <div className="receipts-page__calendar f-14 f-500">
                {start && end
                  ? translate("с {start} - по {end}", "app.dateRange", {
                      start: moment(start)
                        .locale(locale)
                        .format(DATE_FORMAT_DD_MMMM_YYYY),
                      end: moment(end)
                        .locale(locale)
                        .format(DATE_FORMAT_DD_MMMM_YYYY),
                    })
                  : translate("За все время", "app.allTime")}
              </div>
            </div>
          </div>

          <div className="receipts-page__list">
            <div className="container containerMax">
              {page === 1 && loading ? (
                <ReceiptListSkeleton />
              ) : !data || (data && !data.total_count) ? (
                <ReceiptsEmpty organization={this.orgID} searched={!!search} />
              ) : (
                <InfiniteScroll
                  dataLength={Number(data.list.length) || 0}
                  next={() => this.getNext(data.total_pages)}
                  hasMore={this.state.hasMore}
                  loader={null}
                >
                  {data.list.map((receipt) => (
                    <ReceiptCard
                      key={receipt.id}
                      receipt={receipt}
                      organization={this.orgID}
                      className="receipts-page__item"
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
          onRequestClose={() =>
            this.setState({ ...this.state, showMenu: false })
          }
        >
          <MenuDatePicker
            start={start}
            end={end}
            locale={locale}
            onChange={(range) => {
              this.setState(
                (prevState) => ({
                  ...prevState,
                  ...range,
                  page: 1,
                  hasMore: true,
                  showMenu: false,
                }),
                () => {
                  this.getReceipts();
                  this.getSummary();
                }
              );
            }}
          />
        </MobileMenu>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  locale: state.userStore.locale,
  receipts: state.receiptStore.receipts,
  orgTitle: state.organizationStore.orgTitle,
  userStatisticTotals: state.statisticStore.userStatisticTotals,
});

const mapDispatchToProps = (dispatch) => ({
  getReceipts: (params, isNext) => dispatch(getReceipts(params, isNext)),
  getUserStatisticTotals: (params) => dispatch(getUserStatisticTotals(params)),
  getOrganizationTitle: (id) => dispatch(getOrganizationTitle(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ReceiptsPage));
