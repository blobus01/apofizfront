import React from 'react';
import ScanView from '../../containers/ScanView';
import {AttendanceInIcon, AttendanceOutIcon, BackArrow} from '../../components/UI/Icons';
import {connect} from 'react-redux';
import {getAttendanceInfo, recordAttendance} from '../../store/actions/attendanceActions';
import {QR_PREFIX} from '../../common/constants';
import MobileTopHeader from '../../components/MobileTopHeader';
import OrganizationCard from '../../components/Cards/OrganizationCard';
import Avatar from '../../components/UI/Avatar';
import Button from '../../components/UI/Button';
import Notify from '../../components/Notification';
import './index.scss';

class ScanPage extends React.Component {
  constructor(props) {
    super(props);
    this.scannedID = null;
    this.state = {
      selectedOrg: null,
      data: null,
      orgCount: 0,
      step: 0
    }
  }

  onOrgSelect = org => {
    this.setState({ ...this.state, selectedOrg: org, step: 2 })
  }

  onSubmit = org => {
    const { data, orgCount } = this.state;
    if (org && data) {
      this.props.recordAttendance({
        user: data.user.id,
        organization: org.id
      }).then(res => {
        if (res && res.success) {
          orgCount < 2 ? this.setState({ ...this.state, step: 0 }) : this.setState({ ...this.state, step: 1 })
        } else {
          Notify.success({ text: 'У вас нет прав в этой организации'})
        }
      });
    }
  }

  render() {
    const { step, data, selectedOrg, orgCount } = this.state;
    const { getAttendanceInfo, history } = this.props;

    return (
      <div className="scan-page">
        {step === 0 && (
          <ScanView
            onScan={async userID => {
              if (userID && userID.includes(QR_PREFIX)) {
                if (this.scannedID !== userID) {
                  this.scannedID = userID;
                  const res = await getAttendanceInfo(userID.replace(QR_PREFIX, ''));
                  if (res && res.success) {
                    const orgCount = res.data.organizations.length;
                    if (orgCount > 0) {
                      orgCount === 1
                        ? this.setState({ ...this.state, orgCount, data: res.data, step: 2, selectedOrg: res.data.organizations[0] })
                        : this.setState({ ...this.state, orgCount, data: res.data, step: 1 })
                    } else {
                      Notify.success({ text: 'Сотрудник не зарегистрирован с таким ID' });
                    }
                  }
                  this.scannedID = null;
                }
              }
            }}
            onInputSubmit={async val => {
              if (val) {
                const res = await getAttendanceInfo(val);
                if (res && res.success) {
                  const orgCount = res.data.organizations.length;
                  if (orgCount > 0) {
                    orgCount === 1
                      ? this.setState({ ...this.state, orgCount, data: res.data, step: 2, selectedOrg: res.data.organizations[0] })
                      : this.setState({ ...this.state, orgCount, data: res.data, step: 1 })
                  } else {
                    Notify.success({ text: 'Сотрудник не зарегистрирован с таким ID' });
                  }
                }
              }
            }}
            onError={() => null}
          >
            <button
              type="button"
              onClick={() => history.push('/profile')}
              className="discount-proceed-form__rounded-btn"
            >
              <BackArrow />
            </button>
          </ScanView>
        )}


        {step === 1 && (
          <div className="scan-page__organizations">
            <MobileTopHeader
              title="Выбор организации"
              onBack={() => this.setState({ ...this.state, step: 0 })}
            />
            <div className="container">
              <div className="scan-page__organizations-content">
                {data && data.organizations.map(org => (
                  <OrganizationCard
                    key={org.id}
                    id={org.id}
                    title={org.title}
                    image={org.image && org.image.medium}
                    description={org.role}
                    onClick={() => this.onOrgSelect(org)}
                    className="scan-page__organizations-card"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <React.Fragment>
            <MobileTopHeader
              onBack={() => orgCount < 2 ? this.setState({ ...this.state, step: 0 }) : this.setState({ ...this.state, step: 1 })}
              title="Пропуск"
            />

            <div className="container">
              <div className="attendance-scan-page__user">
                <div className="attendance-scan-page__avatar-wrap">
                  <Avatar
                    src={data.user.avatar && data.user.avatar.large}
                    alt={data.user.full_name}
                    className="attendance-scan-page__avatar"
                  />
                </div>

                <div className="attendance-scan-page__user-content">
                  <p className="attendance-scan-page__user-id f-14 f-600">ID {data.user.id}</p>
                  <h1 className="attendance-scan-page__user-name f-17 f-500">{data.user.full_name}</h1>
                  <p className="attendance-scan-page__user-role f-16 f-500">{selectedOrg.role}</p>
                </div>

                <div className="attendance-scan-page__icon">
                  {selectedOrg.attendance && selectedOrg.attendance.is_active ? <AttendanceOutIcon /> : <AttendanceInIcon />}</div>
                <div className="attendance-scan-page__text f-16 f-500">
                  {
                    selectedOrg.attendance && selectedOrg.attendance.is_active
                      ? 'Пользователь запрашивает выход'
                      : 'Пользователь запрашивает доступ'
                  }
                </div>

                <div className="attendance-scan-page__buttons">
                  <Button
                    label="Запретить"
                    type="button"
                    onClick={() => orgCount < 2 ? this.setState({ ...this.state, step: 0 }) : this.setState({ ...this.state, step: 1 })}
                    className="attendance-scan-page__button-cancel"
                  />

                  <Button
                    label="Разрешить"
                    type="button"
                    onClick={() => this.onSubmit(selectedOrg)}
                    className="attendance-scan-page__button-accept"
                  />
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  getAttendanceInfo: user => dispatch(getAttendanceInfo(user)),
  recordAttendance: payload => dispatch(recordAttendance(payload)),
})

export default connect(null, mapDispatchToProps)(ScanPage);