import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createRole} from '../../store/actions/employeeActions';
import RoleManageForm from '../../components/Forms/RoleManageForm';
import Notify from '../../components/Notification';
import {translate} from '../../locales/locales';
import {getOrganizationTitle} from '../../store/actions/organizationActions';

class RolesAddPage extends Component {
  constructor(props) {
    super(props);
    this.organizationID = this.props.match.params.id;
  }

  componentDidMount() {
    this.props.getOrganizationTitle(this.organizationID);
  }

  onSubmit = async values => {
    const res = await this.props.createRole({
      organization: this.organizationID,
      ...values
    })

    if (res && res.success) {
      Notify.success({ text: translate("Новая должность успешно создана", "notify.newRoleAddSuccess")});
      this.props.history.push(`/organizations/${this.organizationID}/roles`);
    }
  }

  render() {
    const {orgTitle, history} = this.props;

    return (
      <RoleManageForm
        onBack={() => history.push(`/organizations/${this.organizationID}/roles`)}
        showDelivery={orgTitle && orgTitle.is_delivery_service}
        onSubmit={this.onSubmit}
      />
    );
  }
}

const mapStateToProps = state => ({
  orgTitle: state.organizationStore.orgTitle,
})

const mapDispatchToProps = dispatch => ({
  createRole: payload => dispatch(createRole(payload)),
  getOrganizationTitle: orgID => dispatch(getOrganizationTitle(orgID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RolesAddPage);