import React, {Component} from 'react';
import EmployeeManageForm from '../../components/Forms/EmployeeManageForm';
import {connect} from 'react-redux';
import {getOrganizationDetail} from '../../store/actions/organizationActions';
import Preloader from '../../components/Preloader';
import RowLink from '../../components/UI/RowLink';
import {ExitIcon, InsightIcon, SaleIcon} from '../../components/UI/Icons';
import RowButton from '../../components/UI/RowButton';
import {setUserDetail} from '../../store/actions/commonActions';
import {
  createRole,
  getEmployeeDetail, removeEmployee,
  setOrganizationOwner,
  updateEmployeeRole
} from '../../store/actions/employeeActions';
import {translate} from '../../locales/locales';
import {injectIntl} from 'react-intl';
import './index.scss';

class EmployeeEditPage extends Component {
  organizationID = this.props.match.params.id;
  employeeID = this.props.match.params.employeeID;

  componentDidMount() {
    this.props.getEmployeeDetail(this.employeeID, () => this.props.history.push(`/organizations/${this.organizationID}/employees`));
    this.props.getOrganizationDetail(this.organizationID);
  }

  onRoleSelect = (role, formikBag) => {
    const { updateEmployeeRole, intl } = this.props;

    const allow = window.confirm(intl.formatMessage({ id: "dialog.changePosition", defaultMessage: "Вы действительно хотите сменить должность ?"}));
    if (allow) {
      updateEmployeeRole(this.employeeID, role.id).then(res => {
        (res && res.success)
          ? formikBag.setValues({ role: role, step: 0})
          : formikBag.setFieldValue('step', 0);
      })
    } else {
      return formikBag.setFieldValue('step', 0);
    }
  }

  onTransferOwnership = () => {
    const { employeeDetail, setOrganizationOwner, intl, history } = this.props;
    if (employeeDetail.data) {
      const allow = window.confirm(intl.formatMessage({ id: "dialog.transferOwnership", defaultMessage: "Вы действительно хотите передать права собственника ?" }));
      allow && setOrganizationOwner(this.organizationID, employeeDetail.data.user.id).then(res => {
        res && res.success && history.push(`/organizations/${this.organizationID}`);
      });
    }
  }

  render() {
    const { employeeDetail, orgDetail, createRole, removeEmployee, setUserDetail, history } = this.props;
    const { data, loading } = employeeDetail;
    const isOwner = orgDetail.data && orgDetail.data.permissions && orgDetail.data.permissions.is_owner;

    return (
      <div className="employee-edit-page">
        {loading ? <Preloader className="employee-edit-page__preloader" /> : data && (
          <EmployeeManageForm
            title={translate("Настройки сотрудника", "employee.settings")}
            invite={{
              ...data.user,
              id: data.id,
              userID: data.user.id,
              role: data.role,
            }}
            organizationID={this.organizationID}
            onBack={() => history.push(`/organizations/${this.organizationID}/employees`)}
            onRoleSelect={this.onRoleSelect}
            createRole={createRole}
            onTransferOwnership={isOwner && this.onTransferOwnership}
          >
            <React.Fragment>
              <RowLink
                to={`/organizations/${this.organizationID}/employees/${this.employeeID}/attendance`}
                label={translate("Статистика посещений", "employee.attendanceStatistics")}
                className="employee-edit-page__stats"
              >
                <InsightIcon />
              </RowLink>

              {data && (
                <RowLink
                  to={`/organizations/${this.organizationID}/receipts-by/${data.user.id}`}
                  label={translate("Все чеки", "receipts.all")}
                  onClick={() => setUserDetail(data.user)}
                  className="employee-edit-page__receipts"
                >
                  <SaleIcon />
                </RowLink>
              )}

              <RowButton
                label={translate("Уволить сотрудника", "employee.fire")}
                showArrow={false}
                onClick={() => removeEmployee(this.employeeID).then(res => res && res.success && history.push(`/organizations/${this.organizationID}/employees`))}
                className="employee-edit-page__fire-employee"
              >
                <ExitIcon />
              </RowButton>
            </React.Fragment>
          </EmployeeManageForm>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  orgDetail: state.organizationStore.orgDetail,
  employeeDetail: state.employeeStore.employeeDetail,
})

const mapDispatchToProps = dispatch => ({
  updateEmployeeRole: (employeeID, roleID) => dispatch(updateEmployeeRole(employeeID, roleID)),
  setOrganizationOwner: (orgID, userID) => dispatch(setOrganizationOwner(orgID, userID)),
  getOrganizationDetail: orgID => dispatch(getOrganizationDetail(orgID)),
  getEmployeeDetail: (employeeID, redirect) => dispatch(getEmployeeDetail(employeeID, redirect)),
  createRole: payload => dispatch(createRole(payload)),
  removeEmployee: id => dispatch(removeEmployee(id)),
  setUserDetail: user => dispatch(setUserDetail(user)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EmployeeEditPage));