import React from 'react';
import {InputTextField} from '../../components/UI/InputTextField';
import {getPhoneNumbers, setPhoneNumbers} from '../../store/actions/profileActions';
import {connect} from 'react-redux';
import {translate} from '../../locales/locales';
import ContactsForm from "../../components/Forms/ContactsForm";


class EditContactsPage extends React.Component {
  componentDidMount() {
    this.props.getPhoneNumbers();
  }

  onSubmit = ({numbers}) => {
    this.props.setPhoneNumbers(numbers
      .filter(num => num.phone_number)
      .map(num => num.phone_number))
      .then(res => res.success && this.props.history.push('/profile/edit'));
  }

  render() {
    const {user, history} = this.props;
    const {data} = this.props.phoneNumbers;
    return (
      <ContactsForm
        numbers={data}
        onSubmit={this.onSubmit}
        onBack={() => history.goBack()}
      >
        <InputTextField
          name="main"
          label={translate("Номер авторизации", "app.authNumber")}
          value={(user && user.phone_number) || ''}
          onCopy
          disabled
        />
      </ContactsForm>
    )
  }
}

const mapStateToProps = state => ({
  phoneNumbers: state.profileStore.phoneNumbers
})

const mapDispatchToProps = dispatch => ({
  getPhoneNumbers: () => dispatch(getPhoneNumbers()),
  setPhoneNumbers: phones => dispatch(setPhoneNumbers(phones))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditContactsPage);