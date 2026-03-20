import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getRoleDetail, removeRole, updateRole} from '../../store/actions/employeeActions';
import RoleManageForm from '../../components/Forms/RoleManageForm';
import Preloader from '../../components/Preloader';
import {getOrganizationTitle} from '../../store/actions/organizationActions';

class RolesEditPage extends Component {
  organizationID = this.props.match.params.id;
  roleID = this.props.match.params.roleID;

  componentDidMount() {
    this.props.getRoleDetail(this.roleID);
    this.props.getOrganizationTitle(this.organizationID);
  }

  onSubmit = async (values, { setSubmitting }) => {
    const res = await this.props.updateRole(this.roleID, values);
    if (res && res.success) {
      return this.props.history.push(`/organizations/${this.organizationID}/roles`);
    }

    setSubmitting(false);
  }

  onRemove = async () => {
    const res = await this.props.removeRole(this.roleID);
    if (res && res.success) {
      this.props.history.push(`/organizations/${this.organizationID}/roles`);
    }
  }

  render() {
    const {orgTitle, roleDetail} = this.props;
    const { data, loading } = roleDetail;
    return loading ? <Preloader style={{ height: '80vh'}} /> : (
      <RoleManageForm
        data={data}
        showDelivery={orgTitle && orgTitle.is_delivery_service}
        onSubmit={this.onSubmit}
        onBack={() => this.props.history.push(`/organizations/${this.organizationID}/roles`)}
        onRemove={this.onRemove}
      />
    );
  }
}

const mapStateToProps = state => ({
  roleDetail: state.employeeStore.roleDetail,
  orgTitle: state.organizationStore.orgTitle,
})

const mapDispatchToProps = dispatch => ({
  getRoleDetail: roleID => dispatch(getRoleDetail(roleID)),
  getOrganizationTitle: orgID => dispatch(getOrganizationTitle(orgID)),
  updateRole: (roleID, data) => dispatch(updateRole(roleID, data)),
  removeRole: roleID => dispatch(removeRole(roleID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RolesEditPage);