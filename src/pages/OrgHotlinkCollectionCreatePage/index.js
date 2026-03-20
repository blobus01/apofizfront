import React, {Component} from 'react';
import {connect} from 'react-redux';
import {uploadFile} from '../../store/actions/commonActions';
import {createOrgHotlink} from '../../store/services/organizationServices';
import {HOTLINK_TYPES} from '../../common/constants';
import {canGoBack} from '../../common/helpers';
import HotlinkCollectionForm from '../../components/Forms/HotlinkCollectionForm';
import './index.scss';

class OrgHotlinkCollectionCreatePage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
  }

  onSubmit = async (values, formikBag) => {
    const payload = {
      organization: this.orgID,
      content: values.link,
      link_type: HOTLINK_TYPES.collection,
      collection_links: values.links.filter(urlObject => !!urlObject.url).map(urlObject => urlObject.url),
      collection_items: Object.keys(values.selectedItems).filter(key => values.selectedItems[key]),
      collection_subcategories: Object.keys(values.selectedSubcategories).filter(key => values.selectedSubcategories[key]),
      decription: values.decription
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
      <div className="org-hotlink-collection-create-page">
        <HotlinkCollectionForm
          orgID={this.orgID}
          onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${this.orgID}`)}
          onSubmit={this.onSubmit}
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

export default connect(mapStateToProps, mapDispatchToProps)(OrgHotlinkCollectionCreatePage);