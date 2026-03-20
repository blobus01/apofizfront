import React from 'react';
import {injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReceiptCard from '../../components/Cards/ReceiptCard';
import Preloader from '../../components/Preloader';
import {DEFAULT_LIMIT} from '../../common/constants';
import {getTransactions} from '../../store/actions/receiptActions';
import './index.scss';

class ReceiptsByDateList extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = props.orgID;
    this.clientID = props.clientID;
    this.state = {
      page: 1,
      limit: DEFAULT_LIMIT,
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.date !== this.props.date) {
      this.setState(prevState => ({...prevState, page: 1}))
      this.getReceipts();
    }
  }

  componentDidMount() {
    this.getReceipts();
  }

  getReceipts = async (params) => {
    const {page, limit} = this.state;
    const {date} = this.props;
    await this.props.getTransactions({page, start: date, end: date, organization: this.orgID, client: this.clientID, limit, ...params});
  }

  getNext = () => {
    const nextPage = this.state.page + 1;
    return this.setState(prevState => ({...prevState, page: nextPage}), () => {
      this.getReceipts({page: nextPage})
    });
  }

  render() {
    const {transactions} = this.props;
    const {data: receipts, loading, hasMore} = transactions;
    const {page} = this.state;

    return (
      <div className="receipts-by-date-list">
        <div className="container">
          {(page === 1 && loading)
            ? <Preloader />
            : !!(receipts && receipts.total_count) && (
            <InfiniteScroll
              dataLength={Number(receipts.list.length) || 0}
              next={() => this.getNext()}
              hasMore={hasMore}
              loader={null}
            >
              {receipts.list.map(receipt => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  organization={this.orgID}
                  to={`/organizations/${this.orgID}/receipts-sales/${receipt.id}?purchase_type=${receipt.purchase_type}`}
                  className="receipts-by-date-list__item"
                />
              ))}
            </InfiniteScroll>
            )
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  transactions: state.receiptStore.transactions,
  locale: state.userStore.locale,
  user: state.userStore.user,
});

const mapDispatchToProps = dispatch => ({
  getTransactions: params => dispatch(getTransactions(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ReceiptsByDateList));