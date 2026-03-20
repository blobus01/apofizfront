import React, {useEffect, useState} from 'react';
import MobileTopHeader from "../../components/MobileTopHeader";
import {translate} from "../../locales/locales";
import {TransferOrgIcon} from "../../components/UI/Icons";
import LoadingButton from "../../components/UI/LoadingButton";
import {useDispatch} from "react-redux";
import {getEmployeeInfo} from "../../store/actions/employeeActions";
import Preloader from "../../components/Preloader";
import Notify from "../../components/Notification";

import './index.scss'

const OrganizationTransferView = ({onBack, userID, onSubmit}) => {
  const dispatch = useDispatch()
  const [state, setState] = useState({
    loading: false,
    userInfo: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(getEmployeeInfo(userID, true)).then(res => {
      if (res && res.success) {
        setState(prevState => ({...prevState, userInfo: res.data}))
      } else {
        Notify.error({
          text: translate('Что-то пошло не так', 'app.fail')
        })
      }
      setState(prevState => ({...prevState, loading: false}))
    })
  }, [dispatch, userID])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onSubmit()
    setIsSubmitting(false)
  }

  const {userInfo} = state

  return (
    <div className="organization-transfer-view">
      <MobileTopHeader
        onBack={onBack}
        title={translate('Передать организацию', 'org.transferOrg')}
        style={{
          marginBottom: 20
        }}
      />
      <div className="container">
        {state.loading && <Preloader />}
        {userInfo && (
          <>
            <div className="organization-transfer-view__receiver">
              <img
                src={userInfo.avatar.large}
                alt="receiver"
                className="organization-transfer-view__receiver-avatar"
              />
              <div className="organization-transfer-view__receiver-info">
                <p className="f-14" style={{color: '#818C99'}}>ID {userInfo.id}</p>
                <p className="f-17 f-500 tl">{userInfo.full_name}</p>
              </div>
            </div>

            <TransferOrgIcon style={{display: 'block', margin: '0 auto 16px', textAlign: 'center'}}/>
            <p className="f-16 f-500" style={{textAlign: "center", marginBottom: 16}}>
              {translate('Передать организацию', 'org.transferOrg')} ?
            </p>
            <div className="organization-transfer-view__btns-container">
              <LoadingButton className="organization-transfer-view__btn accept-button" loading={isSubmitting} loaderPosition="absolute" loaderColor="#fff" onClick={handleSubmit}>
                {translate('Передать', 'app.transfer')}
              </LoadingButton>
              <LoadingButton className="organization-transfer-view__btn organization-transfer-view__btn--reject"
                             onClick={onBack}>
                {translate("Отклонить", "app.reject")}
              </LoadingButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationTransferView;