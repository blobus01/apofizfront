import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setAuthChangeCode, setTypeResendCode} from '../../store/actions/commonActions';
import OptionsSendVerifyCode from "../../components/OptionsSendVerifyCode";
import {Layer} from "../../components/Layer";
import VerifyForm from '../../components/Forms/VerifyForm';
import AuthForm from '../../components/Forms/AuthForm';
import {RESEND_TYPES} from '../../common/constants';
import {translate} from '../../locales/locales';
import {
  changeAuthNumber,
  getUserLocation, resendCode,
  sendCodeToNewNumber,
  validateOldNumber,
  verifyCode
} from '../../store/actions/userActions';
import {checkSmsService} from "../../store/services/userServices";
import './index.scss';
import Notify from "../../components/Notification";

class EditAuthNumberPage extends Component {
  componentDidMount() {
    const { code } = this.props.match.params;
    if (code !== this.props.authChangeCode) {
      return this.props.history.push('/profile/edit')
    }

    this.onChangeSentTo(RESEND_TYPES.registration)
    this.props.getUserLocation();
    this.props.validateOldNumber();
  }

  componentWillUnmount() {
    this.props.setAuthChangeCode(null);
  }

  constructor(props) {
    super(props);
    this.state = {
      phone: null,
      step: 0,
      isShowOptionsSendVerifyCode: false,
    }
  }

  setStep = (step, phone) => this.setState({ ...this.state, phone, step });

  onFirstVerify = async ({ code }) => {
    const { user, verifyCode } = this.props;
    if (user && user.phone_number) {
      const res = await verifyCode(user.phone_number, code.join(''));
      if (res && res.token) {
        return this.setStep(1)
      }
    }
  }

  onPhoneSubmit = async ({ phoneNumber }) => {
    try {
      const isSmsServiceAvailable = (await checkSmsService())?.data?.sms_service
      const phone = `+${phoneNumber}`;
      if (isSmsServiceAvailable) {
        const res = await this.props.sendCodeToNewNumber(phone);
        if (res && res.success) {
          return this.setStep(2, phone);
        }
      } else {
        return this.setState({...this.state, phone}, () => {
          this.onLastVerify({code: null})
        })
      }
    } catch (e) {
      console.error(e)
      Notify.error({
        text: translate('Что-то пошло не так', 'app.fail')
      })
    }
  }

  onLastVerify = async ({ code }) => {
    const { user, changeAuthNumber, history } = this.props;
    if (user && user.phone_number && this.state.phone) {
      const res = await changeAuthNumber({
        old_phone_number: user.phone_number,
        new_phone_number: this.state.phone,
        code: code?.join('')
      });

      if (res && res.success) {
        return history.push('/profile/edit');
      }
    }
  }

  onResendCode = () => {
    this.state.phone && this.props.resendCode(this.state.phone, RESEND_TYPES.changeAuth);
  }

  onChangeSentTo = (sent) => {
    this.props.setTypeResendCode(sent);
  }

  sentToMessage = () => {
    const typeResendCode = this.props.typeResendCode;

    if (typeResendCode && typeResendCode.type === 'whatsapp_auth_type') {
      return <>Отправлен на WhatsApp <span className="d-block">{typeResendCode.to}</span></>;
    } else if (typeResendCode && typeResendCode.type === 'email_auth_type') {
      return <>Отправлено на Вашу почту <span className="d-block">{typeResendCode.to}</span></>;
    } else {
      return <>Отправлено SMS на<span className="d-block">{this.state.phone || (this.props.user && this.props.user.phone_number)}</span></>;
    }
  }

  render() {
    const { history, user, userLocation } = this.props;

    return (
      <>
        <div className="edit-auth-number-page">
          <div className="container">
            {this.state.step === 0 && (
              <VerifyForm
                onSubmit={this.onFirstVerify}
                onBack={() => history.push('/profile/edit')}
                phone={user.phone_number || '----------'}
                email={user.email || '---------'}
                showPhone={user.phone_number}
                sentToMessage={this.sentToMessage}
                showOptionsSendVerifyCode={() => this.setState({...this.state, isShowOptionsSendVerifyCode: true})}
              />
            )}

            {this.state.step === 1 && (
              <AuthForm
                title={translate("Введите новый номер телефона", "auth.enterNewPhone")}
                setStep={() => this.setStep(0)}
                onSubmit={this.onPhoneSubmit}
                userLocation={userLocation}
              />
            )}

            {this.state.step === 2 && (
              <VerifyForm
                onSubmit={this.onLastVerify}
                onBack={() => this.setStep(1)}
                phone={this.state.phone || '----------'}
                showPhone={true}
                sentToMessage={this.sentToMessage}
                showOptionsSendVerifyCode={() => this.setState({...this.state, isShowOptionsSendVerifyCode: true})}
              />
            )}
          </div>
        </div>

        <Layer
          isOpen={this.state.isShowOptionsSendVerifyCode}
        >
          <OptionsSendVerifyCode
            phone={user.phone_number}
            onBack={() => this.setState({...this.state, isShowOptionsSendVerifyCode: false})}
            onChangeSentTo={this.onChangeSentTo}
            onResendCodeOnPhoneNumber={(...args) => {
              this.setState({...this.state, isShowOptionsSendVerifyCode: false})
              this.onChangeSentTo(RESEND_TYPES.registration)
              if (this.state.step === 0) {
                return this.props.validateOldNumber(...args)
              } else {
                return this.onResendCode(...args)
              }
            }}
            typeAuth={RESEND_TYPES.changeAuth}
          />
      </Layer>
    </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.userStore.user,
  authChangeCode: state.commonStore.authChangeCode,
  userLocation: state.userStore.userLocation,
  typeResendCode: state.commonStore.typeResendCode,
});

const mapDispatchToProps = dispatch => ({
  setAuthChangeCode: code => dispatch(setAuthChangeCode(code)),
  getUserLocation: () => dispatch(getUserLocation()),
  validateOldNumber: () => dispatch(validateOldNumber()),
  verifyCode: (phoneNumber, code) => dispatch(verifyCode(phoneNumber, code)),
  sendCodeToNewNumber: phoneNumber => dispatch(sendCodeToNewNumber(phoneNumber)),
  changeAuthNumber: payload => dispatch(changeAuthNumber(payload)),
  resendCode: (phoneNumber, type) => dispatch(resendCode(phoneNumber, type)),
  setTypeResendCode: sent => dispatch(setTypeResendCode(sent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditAuthNumberPage);