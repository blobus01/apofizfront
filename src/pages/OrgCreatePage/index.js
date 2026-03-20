import React from "react";
import { connect } from "react-redux";
import { setUserGEO, uploadFile } from "../../store/actions/commonActions";
import OrganizationForm from "../../components/Forms/Organization/OrganizationCreateForm";
import Notify from "../../components/Notification";
import { ERROR_MESSAGES } from "../../common/messages";
import {
  createOrganization,
  getOrganizationTypes,
  setOrganizationCreationInitialData,
} from "../../store/actions/organizationActions";
import { getUserGEO } from "../../common/helpers";

class OrgCreatePage extends React.Component {
  componentDidMount() {
    const { getOrganizationTypes, setUserGEO } = this.props;
    getOrganizationTypes();
    getUserGEO(setUserGEO);
  }

  componentWillUnmount() {
    this.props.setOrganizationCreationInitialData(null);
  }

  onSubmit = async (values, { setSubmitting }) => {
    const {
      title,
      description,
      openAt,
      closeAt,
      image,
      selectedTypes,
      numbers,
      socials,
      fixedDiscounts,
      accDiscounts,
      cashbackDiscounts,
      location,
      country,
      currency,
      address,
      aroundTheClock,
    } = values;

    const payload = {
      title,
      description,
      opens_at: aroundTheClock ? "00:00" : openAt,
      closes_at: aroundTheClock ? "00:00" : closeAt,
      address,
      longitude: (location && location.lng) || null,
      latitude: (location && location.lat) || null,
      currency: currency && currency.currency.code,
      types: selectedTypes.map((type) => type.id),
      numbers: numbers.map((num) => num.phone_number),
      accounts: socials.map((soc) =>
        !soc.url.includes("http") ? `http://${soc.url}` : soc.url
      ),
    };
    if (values.banner) {
      // If we have temp banners, collect their image IDs
      if (values.tempBanners && values.tempBanners.length > 0) {
        payload.banners_image_ids = values.tempBanners
          .map((banner) => banner.originalImage && banner.originalImage.id)
          .filter((id) => id); // Filter out any undefined IDs
      }

      // Set the selected banner file ID
      if (values.banner.originalImage && values.banner.originalImage.id) {
        payload.selected_banner_file_id = values.banner.originalImage.id;
      } else if (values.selected_banner_id) {
        payload.selected_banner_id = values.selected_banner_id;
      }
    }

    if (country) {
      if (country.type === "countries") {
        payload.country = country.code;
        payload.city = null;
      } else if (country.type === "cities") {
        payload.country = country.country_code;
        payload.city = country.id;
      }
    }

    if (image) {
      if (typeof image === "number") {
        payload.image_id = image;
      } else {
        const res = await this.props.uploadFile(image.original);
        const imageID = res && res.id;
        if (!imageID) {
          Notify.info({ text: ERROR_MESSAGES.image_upload_fail });
          return;
        }
        payload.image_id = imageID;
      }
    } else {
      return;
    }

    const cards = [];
    fixedDiscounts.map((card) =>
      cards.push({
        type: card.type,
        percent: parseInt(card.percent),
        limit: null,
      })
    );

    accDiscounts.map((card) =>
      cards.push({
        type: card.type,
        percent: parseInt(card.percent),
        limit: parseInt(card.limit),
      })
    );

    cashbackDiscounts.map((card) =>
      cards.push({
        type: card.type,
        percent: parseInt(card.percent),
        limit: parseInt(card.limit),
      })
    );

    payload.cards = cards;
    const res = await this.props.createOrganization(payload);
    if (res && res.id) {
      this.props.history.push(`/organizations/${res.id}`);
    } else {
      setSubmitting(false);
    }
  };

  render() {
    const { history, orgTypes, orgCreationInitialData } = this.props;

    return (
      <div className="org-create-page">
        <OrganizationForm
          orgTypes={orgTypes}
          initialValues={orgCreationInitialData ?? {}}
          history={history}
          onSubmit={this.onSubmit}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgTypes: state.organizationStore.orgTypes,
  orgCreationInitialData: state.organizationStore.orgCreationInitialData,
});

const mapDispatchToProps = (dispatch) => ({
  uploadFile: (file) => dispatch(uploadFile(file)),
  getOrganizationTypes: () => dispatch(getOrganizationTypes()),
  createOrganization: (payload) => dispatch(createOrganization(payload)),
  setUserGEO: (geo) => dispatch(setUserGEO(geo)),
  setOrganizationCreationInitialData: (data) =>
    dispatch(setOrganizationCreationInitialData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrgCreatePage);
