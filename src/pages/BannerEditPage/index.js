import React, {Component} from 'react';
import {connect} from 'react-redux';
import BannerManageForm from '../../components/Forms/BannerManageForm';
import {deleteBanner, getBannerDetail, updateBanner} from '../../store/actions/bannerActions';
import {uploadFile} from '../../store/actions/commonActions';

class BannerEditPage extends Component {
  constructor(props) {
    super(props);
    this.organization = props.match.params.id;
    this.bannerID = props.match.params.bannerID
  }

  componentDidMount() {
    this.props.getBannerDetail(this.bannerID);
  }

  onSubmit = async values => {
    const { data } = this.props.bannerDetail;
    let imageID = data && data.image && data.image.id;

    if (values.image) {
      const uploadRes = await this.props.uploadFile(values.image);
      if (uploadRes && uploadRes.success) {
        imageID = uploadRes.id;
      }
    }

    const res = await this.props.updateBanner(this.bannerID, {
      linked_organization: values.organization.id,
      image: imageID
    })
    res && res.success && this.props.history.push(`/organizations/${this.organization}/banners`);
  }

  onDelete = async () => {
    const res = await this.props.deleteBanner(this.bannerID);
    res && res.success && this.props.history.push(`/organizations/${this.organization}/banners`)
  }

  render() {
    const { bannerDetail, history } = this.props;
    return (
      <div className="banner-edit-page">
        <BannerManageForm
          onBack={() => history.push(`/organizations/${this.organization}/banners`)}
          onDelete={this.onDelete}
          onSubmit={this.onSubmit}
          organization={this.organization}
          details={bannerDetail}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  bannerDetail: state.bannerStore.bannerDetail,
});

const mapDispatchToProps = dispatch => ({
  getBannerDetail: bannerID => dispatch(getBannerDetail(bannerID)),
  updateBanner: (id, payload) => dispatch(updateBanner(id, payload)),
  deleteBanner: bannerID => dispatch(deleteBanner(bannerID)),
  uploadFile: file => dispatch(uploadFile(file)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BannerEditPage);