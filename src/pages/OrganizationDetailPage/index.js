import React from "react";
import { connect } from "react-redux";
import OrganizationModule from "../../containers/OrganizationModule";
import {
  getCardBackgrounds,
  getOrganizationDetail,
} from "../../store/actions/organizationActions";
import Preloader from "../../components/Preloader";
import { setGlobalMenu } from "../../store/actions/commonActions";
import PageHelmet from "@components/PageHelmet";

class OrganizationDetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = this.props.match.params.id;
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const { user, getOrganizationDetail, getCardBackgrounds } = this.props;
    user && getCardBackgrounds();
    getOrganizationDetail(this.orgID).finally(() =>
      this.setState({ loading: false })
    );
  }

  componentWillUnmount() {
    this.props.setGlobalMenu(null);
  }

  render() {
    const { loading } = this.state;
    const { orgDetail, history } = this.props;

    return (
      <div className="organization-detail-page">
        {orgDetail.data && (
          <PageHelmet
            title={orgDetail.data?.title}
            description={orgDetail.data.description?.substring(0, 200)}
            image={orgDetail.data.image?.file}
            url={`/organizations/${this.orgID}`}
          />
        )}
        {loading ? (
          <Preloader className="organization-detail-page__preloader" />
        ) : orgDetail.data ? (
          <OrganizationModule orgDetail={orgDetail} history={history} />
        ) : (
          <div>Could not load organization data</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  orgDetail: state.organizationStore.orgDetail,
});

const mapDispatchToProps = (dispatch) => ({
  getOrganizationDetail: (id) => dispatch(getOrganizationDetail(id)),
  getCardBackgrounds: () => dispatch(getCardBackgrounds()),
  setGlobalMenu: (value) => dispatch(setGlobalMenu(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationDetailPage);