import React, { Component } from "react";
import { connect } from "react-redux";
import { uploadFile } from "../../store/actions/commonActions";
import {
  deleteOrgHotlink,
  updateOrgHotlink,
} from "../../store/services/organizationServices";
import { getOrgHotlinkDetails } from "../../store/actions/organizationActions";
import { HOTLINK_TYPES } from "../../common/constants";
import { canGoBack } from "../../common/helpers";
import Preloader from "../../components/Preloader";
import HotlinkForm from "../../components/Forms/HotlinkForm";
import HotlinkCollectionForm from "../../components/Forms/HotlinkCollectionForm";

class OrgHotlinkEditPage extends Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
    this.hotlinkID = props.match.params.hotlinkID;
  }

  componentDidMount() {
    this.props
      .getOrgHotlinkDetails(this.hotlinkID)
      .then(
        (res) =>
          res &&
          !res.success &&
          this.props.history.replace(`/organizations/${this.orgID}`),
      );
  }

  onLinkSubmit = async (values, formikBag) => {
    const payload = {
      content:
        values.type === HOTLINK_TYPES.link && !values.link.includes("http")
          ? `https://${values.link}`
          : values.link,
      image: values.file.id,
      link_type: values.type,
    };

    try {
      if (typeof values.file.id === "string") {
        const imageResponse = await this.props.uploadFile(values.file.original);
        if (imageResponse && imageResponse.success) {
          payload.image = imageResponse.id;
        }
      }

      const res = await updateOrgHotlink(this.hotlinkID, payload);
      res &&
        res.success &&
        this.props.history.push(`/organizations/${this.orgID}`);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  onCollectionSubmit = async (values, formikBag) => {
    const payload = {
      content: values.link,
      image: values.file.id,
      link_type: HOTLINK_TYPES.collection,
      collection_links: values.links
        .filter((urlObject) => !!urlObject.url)
        .map((urlObject) => urlObject.url),
      collection_items: Object.keys(values.selectedItems).filter(
        (key) => values.selectedItems[key],
      ),
      collection_subcategories: Object.keys(
        values.selectedSubcategories,
      ).filter((key) => values.selectedSubcategories[key]),
      decription: values.decription || "",
    };

    try {
      if (typeof values.file.id === "string") {
        const imageResponse = await this.props.uploadFile(values.file.original);
        if (imageResponse && imageResponse.success) {
          payload.image = imageResponse.id;
        }
      }

      const res = await updateOrgHotlink(this.hotlinkID, payload);
      res &&
        res.success &&
        this.props.history.push(`/organizations/${this.orgID}`);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  onRemove = () => {
    deleteOrgHotlink(this.hotlinkID).then(
      (res) =>
        res &&
        res.success &&
        this.props.history.push(`/organizations/${this.orgID}`),
    );
  };

  render() {
    const { orgHotlinkDetails, history } = this.props;
    const { data, loading } = orgHotlinkDetails;

    let content = <div>Network error</div>;

    if (
      data &&
      [HOTLINK_TYPES.link, HOTLINK_TYPES.contact].includes(data.link_type)
    ) {
      content = (
        <HotlinkForm
          data={data}
          onBack={() =>
            canGoBack(history)
              ? history.goBack()
              : history.push(`/organizations/${this.orgID}`)
          }
          onSubmit={this.onLinkSubmit}
          onRemove={this.onRemove}
          type={data.link_type}
        />
      );
    }

    if (data && data.link_type === HOTLINK_TYPES.collection) {
      content = (
        <HotlinkCollectionForm
          data={data}
          orgID={this.orgID}
          onBack={() =>
            canGoBack(history)
              ? history.goBack()
              : history.push(`/organizations/${this.orgID}`)
          }
          onSubmit={this.onCollectionSubmit}
          onRemove={this.onRemove}
        />
      );
    }

    return <>{loading ? <Preloader /> : content}</>;
  }
}

const mapStateToProps = (state) => ({
  orgHotlinkDetails: state.organizationStore.orgHotlinkDetails,
});

const mapDispatchToProps = (dispatch) => ({
  getOrgHotlinkDetails: (hotlinkID) =>
    dispatch(getOrgHotlinkDetails(hotlinkID)),
  uploadFile: (file) => dispatch(uploadFile(file)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrgHotlinkEditPage);
