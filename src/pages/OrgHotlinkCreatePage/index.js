import React, {Component} from 'react';
import {connect} from 'react-redux';
import HotlinkForm from '../../components/Forms/HotlinkForm';
import {uploadFile} from '../../store/actions/commonActions';
import {createOrgHotlink} from '../../store/services/organizationServices';
import {HOTLINK_TYPES} from '../../common/constants';
import {canGoBack} from '../../common/helpers';
import './index.scss';

class OrgHotlinkCreatePage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
    this.linkType = HOTLINK_TYPES.link;
    if (props.match.path.includes(HOTLINK_TYPES.contact)) {
      this.linkType = HOTLINK_TYPES.contact;
    }
  }

  componentDidMount() {
    const {orgDetail, history} = this.props;
    if (!orgDetail || (orgDetail && orgDetail.id !== Number(this.orgID))) {
      history.replace(`/organizations/${this.orgID}`);
    }
  }

  onSubmit = async (values, formikBag) => {
    const payload = {
      organization: this.orgID,
      content: (this.linkType === HOTLINK_TYPES.link && !values.link.includes('http')) ? `https://${values.link}` : values.link,
      link_type: this.linkType,
    }
    try {
      const res = await this.props.uploadFile(values.file.original);
      if (res && res.success) {
        payload.image = res.id;
        return createOrgHotlink(payload).then(res => res && res.success && this.props.history.push(`/organizations/${this.orgID}`));
      }
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  }

  render() {
    const {history} = this.props;
    return (
      <div className="org-hotlink-create-page">
        <HotlinkForm
          onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${this.orgID}`)}
          onSubmit={this.onSubmit}
          type={this.linkType}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgDetail: state.organizationStore.orgDetail.data,
})

const mapDispatchToProps = dispatch => ({
  uploadFile: file => dispatch(uploadFile(file)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OrgHotlinkCreatePage);