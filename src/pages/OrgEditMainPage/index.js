import React from "react";
import { connect } from "react-redux";
import {
  setUserGEO,
  setViews,
  uploadFile,
} from "../../store/actions/commonActions";
import Notify from "../../components/Notification";
import OrganizationEditMainForm from "../../components/Forms/Organization/OrganizationEditMainForm";
import { getUserGEO, notifyQueryResult } from "../../common/helpers";
import { translate } from "../../locales/locales";
import {
  activateOrganization,
  deactivateOrganization,
  requestConfirmationForWholesale,
} from "../../store/services/organizationServices";
import {
  editOrganization,
  getOrganizationDetail,
  getOrganizationTypes,
  sendAllAcceptFollowers,
  setOrganizationDetail,
  setOrganizationPhones,
  setOrganizationSocials,
} from "../../store/actions/organizationActions";
import Dialog from "../../components/UI/Dialog/Dialog";
import { VIEW_TYPES } from "../../components/GlobalLayer";
import { QR_PREFIX } from "../../common/constants";
import { setOrganizationOwner } from "../../store/actions/employeeActions";
import Preloader from "../../components/Preloader";

class OrgEditMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = this.props.match.params.id;
    this.state = {
      showModal: false,
      isPrivateOrg: false,
    };
  }

  async componentDidMount() {
    const { setUserGEO, getOrganizationDetail } = this.props;

    getOrganizationDetail(this.orgID).then(
      (res) =>
        res &&
        res.success &&
        this.setState({
          isPrivateOrg: res.data.is_private,
        })
    );

    this.props.getOrganizationTypes();
    getUserGEO(setUserGEO);
  }

  onSubmit = async (values, { setSubmitting }, prevIsPrivate) => {
    const { data } = this.props.orgDetail;
    if (data) {
      const {
        title,
        description,
        openAt,
        closeAt,
        image,
        selectedTypes,
        numbers,
        socials,
        location,
        country,
        currency,
        avg_check,
        address,
        showContacts,
        showFollowers,
        isPrivate,
        isWholesale,
        aroundTheClock,
        switcher,
        selected_banner_id,
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
        avg_check,
        types: selectedTypes.map((type) => type.id),
        show_contacts: showContacts,
        is_private: isPrivate,
        is_wholesale: isWholesale,
        show_followers: showFollowers,
        image_id: data && data.image && data.image.id,
        selected_banner_id: data?.selected_banner?.id,
        switcher,
      };

      if (selected_banner_id) {
        payload.selected_banner_id = selected_banner_id;
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
        const res = await this.props.uploadFile(image.original);
        const imageID = res && res.id;
        if (!imageID) {
          Notify.info({
            text: translate(
              "Не удалось загрузить изображение",
              "hint.uploadImageError"
            ),
          });
          return;
        }
        payload.image_id = imageID;
      }

      this.props.setOrganizationPhones(
        {
          phone_numbers: numbers.map((num) => num.phone_number),
        },
        data.id
      );

      this.props.setOrganizationSocials(
        {
          networks: socials.map((soc) =>
            !soc.url.includes("http") ? `http://${soc.url}` : soc.url
          ),
        },
        data.id
      );

      if (!isPrivate && prevIsPrivate !== isPrivate) {
        this.props.sendAllAcceptFollowers(data.id);
      }

      const res = await this.props.editOrganization(
        data.id,
        payload,
        prevIsPrivate
      );
      if (res && res.error) {
        setSubmitting(false);
      }
    }
  };

  onOrganizationActivate = () => {
    window.confirm(
      "Ваша организация станет доступной для всех пользователей\n" +
        "Вы уверены ?"
    ) &&
      activateOrganization(this.orgID).then((res) => {
        res &&
          res.success &&
          this.props.history.push(`/organizations/${this.orgID}`);
      });
  };

  onOrganizationDeactivate = () => {
    window.confirm(
      "Ваша организация станет не доступной для всех пользователей включая ваших подписчиков\n" +
        "Вы уверены ?"
    ) &&
      deactivateOrganization(this.orgID).then((res) => {
        res && res.success && this.props.history.push(`/profile`);
      });
  };

  handleDialogClose = (isOK) => {
    if (isOK) {
      this.setState({
        ...this.state,
        showModal: false,
        isPrivateOrg: !this.state.isPrivateOrg,
      });
      this.state.resolve();
    } else {
      this.setState({ ...this.state, showModal: false });
      this.state.reject();
    }
    document.body.style.overflow = "unset";
  };

  onOrganizationPrivate = () => {
    return new Promise((resolve, reject) => {
      this.setState({ ...this.state, showModal: true, resolve, reject });
    });
  };

  onOrganizationTransfer = () => {
    const { setViews } = this.props;
    setViews({
      type: VIEW_TYPES.qr_scan,
      inputPlaceholder: translate(
        "Поиск по ID",
        "placeholder.searchByEmployeeID"
      ),
      onScanError: () => null,
      onScan: async (userID) => {
        if (userID && userID.includes(QR_PREFIX)) {
          setViews([]);
          this.transferOrganization(userID.replace(QR_PREFIX, ""));
        }
      },
      onInputSubmit: async (userID) => {
        if (userID) {
          setViews([]);
          this.transferOrganization(userID);
        }
      },
    });
  };

  onWholesaleRequest = async () => {
    const { orgDetail, setOrganizationDetail } = this.props;
    const res = await notifyQueryResult(
      requestConfirmationForWholesale(orgDetail.data.id)
    );
    if (res && res.success) {
      setOrganizationDetail({
        data: {
          ...orgDetail.data,
          is_wholesale_in_request: true,
        },
      });
    }
    return res;
  };

  transferOrganization = (newOwnerID) => {
    const { orgDetail, setOrganizationOwner, history, setViews } = this.props;

    setViews({
      type: VIEW_TYPES.organization_transfer,
      userID: newOwnerID,
      onSubmit() {
        return setOrganizationOwner(orgDetail.data.id, newOwnerID).then(
          (res) => {
            if (res && res.success) {
              history.push(`/organizations/${orgDetail.data.id}`);
              setViews([]);
            }
          }
        );
      },
    });
  };

  render() {
    const { history, orgTypes, orgDetail } = this.props;
    if (orgDetail.loading) {
      return <Preloader />;
    }

    if (!orgDetail.data) {
      return null;
    }

    const isPrivateOrg = orgDetail.data.is_private;

    return (
      <>
        <div
          className="organization-edit-main-page"
          style={{ paddingBottom: "50px" }}
        >
          <OrganizationEditMainForm
            orgTypes={orgTypes}
            data={orgDetail.data}
            history={history}
            onSubmit={this.onSubmit}
            onActivate={this.onOrganizationActivate}
            onDeactivate={this.onOrganizationDeactivate}
            onPrivate={this.onOrganizationPrivate}
            onWholesaleRequest={this.onWholesaleRequest}
            onTransfer={this.onOrganizationTransfer}
          />
        </div>

        {this.state.showModal && (
          <Dialog
            title={translate("Cкрытая организация", "org.hidden")}
            description={
              isPrivateOrg
                ? translate(
                    "Если вы раскрываете организацию, то все пользователи, которые сейчас в запросах на подписку, будут подписаны на вашу организацию.",
                    "org.discloseDesc"
                  )
                : translate(
                    "Если у вас скрытая организация, ваши товары и посты смогут видеть только пользователи, которых вы одобрите. Это не относится к уже подписавшимся.",
                    "org.hiddenDesc"
                  )
            }
            open={true}
            buttons={[
              {
                onClick: () => this.handleDialogClose(true),
                variant: "confirm",
                title: translate("Продолжить", "app.continue"),
              },
              {
                onClick: () => this.handleDialogClose(false),
                variant: "cancel",
                title: translate("Отмена", "app.cancellation"),
              },
            ]}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  orgDetail: state.organizationStore.orgDetail,
  orgTypes: state.organizationStore.orgTypes,
  confirmPrivateOrg: state.commonStore.confirmPrivateOrg,
});

const mapDispatchToProps = (dispatch) => ({
  getOrganizationDetail: (id) => dispatch(getOrganizationDetail(id)),
  setOrganizationDetail: (payload) => dispatch(setOrganizationDetail(payload)),
  uploadFile: (file) => dispatch(uploadFile(file)),
  getOrganizationTypes: () => dispatch(getOrganizationTypes()),
  editOrganization: (id, payload) => dispatch(editOrganization(id, payload)),
  setOrganizationPhones: (phones, id) =>
    dispatch(setOrganizationPhones(phones, id)),
  setOrganizationSocials: (socials, id) =>
    dispatch(setOrganizationSocials(socials, id)),
  setOrganizationOwner: (orgID, newOwnerID) =>
    dispatch(setOrganizationOwner(orgID, newOwnerID)),
  setUserGEO: (geo) => dispatch(setUserGEO(geo)),
  sendAllAcceptFollowers: (orgID) => dispatch(sendAllAcceptFollowers(orgID)),
  setViews: (views) => dispatch(setViews(views)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrgEditMainPage);
