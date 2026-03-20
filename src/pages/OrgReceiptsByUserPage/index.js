import React from "react";
import { connect } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import MobileSearchHeader from "../../components/MobileSearchHeader";
import Preloader from "../../components/Preloader";
import ReceiptCard from "../../components/Cards/ReceiptCard";
import EmptyBox from "../../components/EmptyBox";
import { DEFAULT_LIMIT } from "../../common/constants";
import { setUserDetail } from "../../store/actions/commonActions";
import { getOrgTransactions } from "../../store/actions/receiptActions";
import MenuDatePicker from "../../components/MenuDatePicker";
import MobileMenu from "../../components/MobileMenu";
import { translate } from "../../locales/locales";
import CertainPeriodStatistics from "../../components/CertainPeriodStatistics";
import OrgGeneralStatistics from "../../containers/OrgGeneralStatistics";
import "./index.scss";

class OrgReceiptsByUserPage extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.orgID = props.match.params.id;
    this.userID = props.match.params.userID;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
      start: null,
      end: null,
      hasMore: true,
      loading: true,
      showMenu: false,
    };
  }

  componentDidMount() {
    this.getReceipts();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.setUserDetail(null);
  }

  getReceipts = async (params, isNext) => {
    const { page, limit, start, end, loading } = this.state;
    await this.props.getOrgTransactions(
      {
        page,
        limit,
        start,
        end,
        processed_by: this.userID,
        organization: this.orgID,
        ...params,
      },
      isNext
    );
    loading &&
      this.mounted &&
      this.setState((prevState) => ({ ...prevState, loading: false }));
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
    const { loading, showMenu, start, end } = this.state;
    const { orgTransactions: data, userDetail, locale, history } = this.props;

    return (
      <div className="org-receipts-user-page">
        <MobileSearchHeader
          onBack={() => history.goBack()}
          title={
            userDetail
              ? userDetail.full_name
              : translate("Пользователь", "app.user")
          }
          className="org-receipts-user-page__search-header"
        />

        <div className="org-receipts-user-page__content">
          <OrgGeneralStatistics
            orgID={this.orgID}
            requestParams={{
              start,
              end,
              processed_by: this.userID,
            }}
            render={({ stats }) => (
              <CertainPeriodStatistics
                stats={stats}
                onClick={() => this.setState({ ...this.state, showMenu: true })}
                start={start}
                end={end}
              />
            )}
          />

          <div className="org-receipts-user-page__list">
            <div className="container">
              {loading ? (
                <Preloader />
              ) : !data || (data && !data.total_count) ? (
                <EmptyBox
                  title={translate(
                    "Проведенных скидок нет",
                    "org.noDiscountProvided"
                  )}
                />
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
                      to={`/organizations/${this.orgID}/receipts/${receipt.id}?purchase_type=${receipt.purchase_type}`}
                      className="org-receipts-user-page__item"
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
            start={this.state.start}
            end={this.state.end}
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
  orgTransactions: state.receiptStore.orgTransactions,
  locale: state.userStore.locale,
  userDetail: state.commonStore.userDetail,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgTransactions: (params, isNext) =>
    dispatch(getOrgTransactions(params, isNext)),
  setUserDetail: (user) => dispatch(setUserDetail(user)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrgReceiptsByUserPage);
