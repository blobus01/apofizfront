import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getOrganizationTitle} from '../../store/actions/organizationActions';
import {getReceiptDetail} from '../../store/actions/receiptActions';
import MobileTopHeader from '../../components/MobileTopHeader';
import ReceiptDetail from '../../components/ReceiptDetail';
import Preloader from '../../components/Preloader';
import {RECEIPT_FOR} from '../../common/constants';
import {injectIntl} from 'react-intl';
import {translate} from '../../locales/locales';
import './index.scss';

class ReceiptDetailModule extends Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.receiptID = this.props.receiptID;
    this.orgID = this.props.orgID;
    this.state = {
      loading: true,
    }
  }

  componentDidMount() {
    this.orgID && this.props.getOrganizationTitle(this.orgID);
    this.props.getReceiptDetail(this.receiptID)
      .finally(() => this.mounted && this.state.loading && this.setState(prevState => ({...prevState, loading: false})));
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    
    const {receiptDetail, history} = this.props;

    return (
      <div className="receipt-detail-module">
        <MobileTopHeader
          onBack={() => history.goBack()}
          title={receiptDetail && translate(`Чек ${receiptDetail.id}`, "receipts.billNumber", {
            id: receiptDetail.id
          })}
          className="receipt-detail-module__header"
        />
        <div className="receipt-detail-module__content">
          <div className="container">
            {this.state.loading
              ? <Preloader />
              : receiptDetail
                ? (
                  <ReceiptDetail
                    organization={receiptDetail.organization}
                    processedBy={receiptDetail}
                    type={RECEIPT_FOR.client}
                    receipt={receiptDetail}
                  />
                ) : <div>No receipt</div>
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  receiptDetail: state.receiptStore.receiptDetail,
  orgTitle: state.organizationStore.orgTitle,
})

const mapDispatchToProps = dispatch => ({
  getReceiptDetail: receiptID => dispatch(getReceiptDetail(receiptID)),
  getOrganizationTitle: orgID => dispatch(getOrganizationTitle(orgID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ReceiptDetailModule));