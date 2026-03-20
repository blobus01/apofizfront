import * as React from "react";
import VerifyForm from "../../components/Forms/VerifyForm";
import AuthForm from "../../components/Forms/AuthForm";
import { connect } from "react-redux";
import LoginForm from "../../components/Forms/LoginForm";
import Notify from "../../components/Notification";
import { translate } from "../../locales/locales";
import {
  forgotPassword,
  getUserLocation,
  resendCode,
  setPassword,
  verifyCode,
} from "../../store/actions/userActions";
import { Layer } from "../../components/Layer";
import OptionsSendVerifyCode from "../../components/OptionsSendVerifyCode";
import { setTypeResendCode } from "../../store/actions/commonActions";
import { RESEND_TYPES } from "../../common/constants";
import qs from "qs";
import "./index.scss";

class ForgotPage extends React.Component {
  constructor(props) {
    super(props);
    this.phoneURLParam = qs
      .parse(props.location.search.replace("?", ""))
      .phone?.trim();
    this.phoneURLParam =
      this.phoneURLParam && this.phoneURLParam[0] !== "+"
        ? `+${this.phoneURLParam}`
        : this.phoneURLParam;

    this.state = {
      step: this.phoneURLParam ? 1 : 0,
      phone: this.phoneURLParam ?? undefined,
      isShowOptionsSendVerifyCode: false,
    };
  }

  componentDidMount() {
    this.props.getUserLocation();
  }

  componentWillUnmount() {
    this.props.setTypeResendCode(null);
  }

  setStep = (step, phone) => this.setState({ ...this.state, phone, step });

  onPhoneSubmit = async ({ phoneNumber }) => {
    const phone = `+${phoneNumber}`;
    const res = await this.props.forgotPassword(phone);
    res && !res.error && this.setStep(1, phone);
  };

  onVerify = async ({ code }) => {
    if (this.state.phone) {
      const res = await this.props.verifyCode(this.state.phone, code.join(""));
      if (res && res.token) {
        return this.setStep(2);
      }
    }
  };

  onResendCode = () => {
    this.state.phone &&
      this.props.resendCode(this.state.phone, RESEND_TYPES.registration);
  };

  onPasswordSubmit = async ({ password }, { setFieldError }) => {
    const res = await this.props.setPassword(password);
    if (res && res.success) {
      console.log("login", res);
      Notify.success({
        text: translate(
          "Вы успешно сменили пароль",
          "notify.passwordChangeSuccess",
        ),
      });
      return this.props.history.push("/login");
    }

    if (res && res.error) {
      return setFieldError("password", res.error);
    }
  };

  onChangeSentTo = (sent) => {
    this.props.setTypeResendCode(sent);
  };

  sentToMessage = () => {
    const typeResendCode = this.props.typeResendCode;

    if (typeResendCode && typeResendCode.type === "whatsapp_auth_type") {
      return (
        <>
          Отправлен на WhatsApp{" "}
          <span className="d-block">{typeResendCode.to}</span>
        </>
      );
    } else if (typeResendCode && typeResendCode.type === "email_auth_type") {
      return (
        <>
          Отправлено на Вашу почту{" "}
          <span className="d-block">{typeResendCode.to}</span>
        </>
      );
    } else {
      return (
        <>
          Отправлено SMS на<span className="d-block">{this.state.phone}</span>
        </>
      );
    }
  };

  render() {
    const { userLocation, history } = this.props;
    return (
      <>
        <div className="forgot-page">
          {this.state.step === 0 && (
            <AuthForm
              onSubmit={this.onPhoneSubmit}
              userLocation={userLocation}
              setStep={() => history.goBack()}
              title={translate(
                "Введите номер телефона",
                "auth.enterPhoneNumber",
              )}
            />
          )}
          {this.state.step === 1 && (
            <VerifyForm
              onSubmit={this.onVerify}
              showOptionsSendVerifyCode={() =>
                this.setState({
                  ...this.state,
                  isShowOptionsSendVerifyCode: true,
                })
              }
              onResend={this.onResendCode}
              onBack={() =>
                this.phoneURLParam ? history.goBack() : this.setStep(0)
              }
              phone={this.state.phone}
              sentToMessage={this.sentToMessage}
              sent={this.state.sent}
            />
          )}
          {this.state.step === 2 && (
            <LoginForm
              onSubmit={this.onPasswordSubmit}
              setStep={() => this.setStep(1)}
              title={translate(
                "Создать новый пароль",
                "auth.createNewPassword",
              )}
              type="new_password"
            />
          )}
        </div>

        <Layer isOpen={this.state.isShowOptionsSendVerifyCode}>
          <OptionsSendVerifyCode
            phone={this.state.phone}
            onBack={() =>
              this.setState({
                ...this.state,
                isShowOptionsSendVerifyCode: false,
              })
            }
            onChangeSentTo={this.onChangeSentTo}
          />
        </Layer>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  userLocation: state.userStore.userLocation,
  typeResendCode: state.commonStore.typeResendCode,
});

const mapDispatchToProps = (dispatch) => ({
  getUserLocation: () => dispatch(getUserLocation()),
  resendCode: (phoneNumber, type) => dispatch(resendCode(phoneNumber, type)),
  verifyCode: (phoneNumber, code) => dispatch(verifyCode(phoneNumber, code)),
  setPassword: (password) => dispatch(setPassword(password)),
  forgotPassword: (phone) => dispatch(forgotPassword(phone)),
  setTypeResendCode: (sent) => dispatch(setTypeResendCode(sent)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPage);
