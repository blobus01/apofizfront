import React, {Component} from 'react';
import {connect} from 'react-redux';
import PromotionForm from '../../components/Forms/PromotionForm';
import {getOrganizationTitle, getOrgPromotion} from '../../store/actions/organizationActions';
import {uploadFile} from '../../store/actions/commonActions';
import {createOrgPromotion, deleteOrgPromotion, updateOrgPromotion} from '../../store/services/organizationServices';
import Preloader from '../../components/Preloader';
import './index.scss';

class OrgPromotionPage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
  }

  componentDidMount() {
    this.props.getOrganizationTitle(this.orgID);
    this.props.getOrgPromotion(this.orgID).then(res =>
      res && !res.status && this.props.history.push(`/organizations/${this.orgID}`));
  }

  onSubmit = async (values, formikBag) => {
    const hasPromotion = !!values.id;
    const payload = {
      total_cashback: Number(values.total),
      cashback: Number(values.cashback),
    }

    if (!hasPromotion) {
      payload.organization = this.orgID;
    }

    try {
      if (values.file && values.file.id && typeof values.file.id === 'number') {
        payload.image = values.file.id;
      } else {
        const res = await this.props.uploadFile(values.file.original);
        if (res && res.success) {
          payload.image = res.id;
        }
      }

      return hasPromotion
        ? updateOrgPromotion(this.orgID, payload).then(res => res && res.success && this.props.history.push(`/organizations/${this.orgID}`))
        : createOrgPromotion(payload).then(res => res && res.success && this.props.history.push(`/organizations/${this.orgID}`));
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  }

  onRemove = () => {
    deleteOrgPromotion(this.orgID).then(res => res && res.success && this.props.history.push(`/organizations/${this.orgID}`))
  }

  render() {
    const {history, orgPromotion, orgTitle} = this.props;
    const {loading, data} = orgPromotion;

    return (
      <div className="promotion-create-page">
        {loading ? <Preloader /> : (
          <PromotionForm
            data={data}
            organization={orgTitle}
            onBack={() => history.push(`/organizations/${this.orgID}`)}
            onSubmit={this.onSubmit}
            onRemove={this.onRemove}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgTitle: state.organizationStore.orgTitle,
  orgPromotion: state.organizationStore.orgPromotion,
});

const mapDispatchToProps = dispatch => ({
  uploadFile: file => dispatch(uploadFile(file)),
  getOrgPromotion: orgID => dispatch(getOrgPromotion(orgID)),
  getOrganizationTitle: orgID => dispatch(getOrganizationTitle(orgID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrgPromotionPage);