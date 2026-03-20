import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import OptionSendVerifyCode from "../OptionSendVerifyCode";
import {BackArrow, CommentsSmsIcon, MailFilledIcon, WhatsAppIcon} from "../UI/Icons";
import {getUserEmailByPhoneNumber} from "../../store/actions/commonActions";
import {resendCode} from "../../store/actions/userActions";
import Preloader from "../Preloader";
import './index.scss';
import {RESEND_TYPES} from "../../common/constants";

const OptionsSendVerifyCode = ({phone, onBack, onChangeSentTo, onResendCodeOnPhoneNumber, typeAuth}) => {
  const dispatch = useDispatch();
  const { data: email, loading } = useSelector(state => state.commonStore.emailForConfirmation);

  useEffect(() => {
    dispatch(getUserEmailByPhoneNumber(phone));
  }, [dispatch, phone]);

  const onResendCode = (phone, type, email) => {
    onChangeSentTo({type, to: email || phone});
    dispatch(resendCode(phone, type));
    onBack();
  };

  return (
    <div className="container options-send-verify-code">
      <div className="options-send-verify-code__top">
        <button type="button" onClick={onBack} className="options-send-verify-code__back"><BackArrow/></button>
      </div>
      <h4 className="options-send-verify-code__title">Не получили код</h4>

      {loading
        ? <Preloader/>
        : <div className="options-send-verify-code__content">
          <OptionSendVerifyCode
            icon={<WhatsAppIcon/>}
            label="Получить код на WhatsApp"
            onClick={() => onResendCode(phone, RESEND_TYPES.changeAuthWhatsApp)}
          />
          <OptionSendVerifyCode
            icon={<CommentsSmsIcon/>}
            label="Отправить SMS повторно"
            onClick={() => onResendCodeOnPhoneNumber ?
              onResendCodeOnPhoneNumber(phone, typeAuth ? typeAuth : RESEND_TYPES.registration) :
              onResendCode(phone, typeAuth ? typeAuth : RESEND_TYPES.registration)
            }
          />
          {email &&
            <OptionSendVerifyCode
              icon={<MailFilledIcon/>}
              label="Отправить на почту"
              onClick={() => onResendCode(phone, RESEND_TYPES.changeAuthEmail, email)}
            />
          }
        </div>
      }
    </div>
  );
};

export default OptionsSendVerifyCode;