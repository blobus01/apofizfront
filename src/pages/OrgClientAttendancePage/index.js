import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import MobileTopHeader from '../../components/MobileTopHeader';
import AttendanceCalendar from '../../components/UI/AttendanceCalendar';
import UserCard from '../../components/Cards/UserCard';
import {DATE_FORMAT_MMMM_YYYY, DATE_FORMAT_YYYY_MM} from '../../common/constants';
import {canGoBack} from '../../common/helpers';
import {getReceiptsCalendar} from '../../store/actions/attendanceActions';
import ReceiptsByDateList from './receipts';
import './index.scss';

class OrgClientAttendancePage extends React.Component {
  constructor(props) {
    super(props);
    this.orgID = props.match.params.orgID;
    this.userID = props.match.params.userID;
    this.state = {
      date: new Date(),
      dateTitle: moment().locale(props.locale).format(DATE_FORMAT_MMMM_YYYY),
      selected: null,
    };
  };

  componentDidMount() {
    this.getCalendar();
  }

  onDateTitleUpdate = title => {
    this.setState(prevState => ({ ...prevState, dateTitle: title }));
  }

  getCalendar = (date, isSet) => {
    this.props.getReceiptsCalendar({
      organization: this.orgID,
      client: this.userID,
      month_year: date ? moment(date).format(DATE_FORMAT_YYYY_MM) : moment().format(DATE_FORMAT_YYYY_MM),
    }).then(res => res && res.success && isSet && this.setState({
      ...this.state,
      selected: this.getAttendanceInfo(date)[0]
    }));
  };

  getAttendanceInfo = date => {
    const {data} = this.props.receiptsCalendar;
    return data.calendar.filter(item => moment(item).isSame(date || this.state.date, 'day'));
  }

  onDateChange = date => {
    this.setState(prevState => ({ ...prevState, date, selected: this.getAttendanceInfo(date)[0] }));
  }

  onViewChange = date => {
    this.onDateTitleUpdate(moment(date).locale(this.props.locale).format(DATE_FORMAT_MMMM_YYYY));
    this.getCalendar(date);
  }

  render() {
    const {date, selected, dateTitle} = this.state;
    const {locale, receiptsCalendar} = this.props;
    const {data} = receiptsCalendar;
    const {history} = this.props;
    const client = data.client;

    return (
      <div className="org-client-attendance-page">
        <MobileTopHeader
          onBack={() => canGoBack(history) ? history.goBack() : history.push(`/organizations/${this.orgID}/client/${this.employeeID}`)}
          title={dateTitle}
        />

        <div className="org-client-attendance-page__calendar">
          <div className="container">
            <AttendanceCalendar
              value={date}
              locale={locale}
              onChange={this.onDateChange}
              onViewChange={this.onViewChange}
              calendar={data.calendar}
              disableHeader
            />
          </div>
        </div>

        {client && (
          <div className="org-client-attendance-page__user">
            <div className="container">
              <UserCard
                avatar={client.avatar}
                fullname={client.full_name}
                description={client.role}
                className="attendance-page__user"
                withBorder
              />
            </div>
          </div>
        )}

        {selected && (
          <ReceiptsByDateList
            orgID={this.orgID}
            clientID={this.userID}
            date={selected}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  receiptsCalendar: state.attendanceStore.receiptsCalendar,
  locale: state.userStore.locale,
})

const mapDispatchToProps = dispatch => ({
  getReceiptsCalendar: params => dispatch(getReceiptsCalendar(params)),
})

export default connect(mapStateToProps, mapDispatchToProps)(OrgClientAttendancePage);