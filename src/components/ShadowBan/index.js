import React, {useEffect} from 'react';
import {BackArrow} from "../UI/Icons";
import "./index.scss";
import {translate} from "../../locales/locales";
import {
  getOrgShadowBanStatus,
  sendRemoveOrgFromShadowBan,
  setCloseOrgShadowBan,
} from "../../store/actions/organizationActions";
import {SubsIcon} from "../Cards/NotificationCard/icons";
import useDialog from "../UI/Dialog/useDialog";
import {useDispatch, useSelector} from "react-redux";
import {Layer} from "../Layer";

const ShadowBan = ({orgId, onBack, isOpen}) => {
  const {alert} = useDialog();
  const dispatch = useDispatch();
  const {loading, isOpenModal, isSuccess} = useSelector(state => state.organizationStore.removeOrgFromShadowBan);
  const orgShadowBanStatus = useSelector(state => state.organizationStore.orgShadowBanStatus);

  useEffect(() => {
    if (isOpen) {
      dispatch(getOrgShadowBanStatus(orgId));
    }
  }, [dispatch, orgId, isOpen]);

  useEffect(() => {
    if (orgShadowBanStatus.data) {
      const array = orgShadowBanStatus.data.body.split('\n');
      const index = array.length - 1;

      array.splice(index, 1, `<span class="f-500">${array[index]}</span>`);
      document.querySelector('.shadow-ban__info').innerHTML = array.join('\n');
    }
  }, [orgShadowBanStatus]);

  useEffect(() => {
    const showModal = async () => {
      try {
        await alert({
          title: translate('Ваш запрос отправлен', 'org.yourRequestSent'),
        });
      } catch (e) {
        // do nothing
      }
    };

    if (isOpenModal) {
      showModal();
    }
  }, [dispatch, alert, isOpenModal]);

  const onCloseShadowBan = () => {
    dispatch(setCloseOrgShadowBan());
    onBack();
  };

  const onSendRequest = () => {
    dispatch(sendRemoveOrgFromShadowBan(orgId));
  };

  return (
    <Layer isOpen={isOpen}>
      {orgShadowBanStatus.data && (
        <div className="container">
          <div className="shadow-ban">
            <div className="shadow-ban__top">
              <button type="button" className="shadow-ban__back" onClick={onCloseShadowBan}><BackArrow/></button>
              <h3 className="f-16 f-700 shadow-ban__title">{orgShadowBanStatus.data['name']}</h3>
            </div>
            <p className="f-13 shadow-ban__info"/>
            {isSuccess || orgShadowBanStatus.data['is_under_review'] ? (
              <p className="shadow-ban__sent f-700">
                {translate('Запрос отправлен', 'org.requestSent')}
                <SubsIcon className="shadow-ban__icon-subs" fill="#34A853"/>
              </p>
            ) : (
              <button
                type="button"
                className="shadow-ban__btn"
                onClick={onSendRequest}
                disabled={loading}
              >
                {translate('Исправить статус', 'org.fixStatus')}
              </button>
            )}
          </div>
        </div>
      )}
    </Layer>
  );
};

export default ShadowBan;