import React, {Component} from 'react';
import {connect} from 'react-redux';
import BannerManageForm from '../../components/Forms/BannerManageForm';
import {createBanner} from '../../store/actions/bannerActions';
import {uploadFile} from '../../store/actions/commonActions';

class BannerCreatePage extends Component {
  constructor(props) {
    super(props);
    this.organization = props.match.params.id;
  }

  onSubmit = async values => {
    const uploadRes = await this.props.uploadFile(values.image);
    if (uploadRes && uploadRes.success) {
      const res = await this.props.createBanner({
        host_organization: this.organization,
        linked_organization: values.organization.id,
        image: uploadRes.id
      });

      res && res.success && this.props.history.push(`/organizations/${this.organization}/banners`);
    }
  }

  render() {
    const { history } = this.props;

    return (
      <div className="banner-create-page">
        <BannerManageForm
          onBack={() => history.push(`/organizations/${this.organization}/banners`)}
          onSubmit={this.onSubmit}
          organization={this.organization}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  createBanner: payload => dispatch(createBanner(payload)),
  uploadFile: file => dispatch(uploadFile(file)),
})

export default connect(null, mapDispatchToProps)(BannerCreatePage);