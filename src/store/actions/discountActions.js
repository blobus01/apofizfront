import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import Notify from '../../components/Notification';
import {getMessage} from '../../common/helpers';
import {SET_PRE_ORGANIZATION} from './actionTypes';
import {translate} from '../../locales/locales';

export const preprocessDiscount = client => {
  return (dispatch, getStore) => {
    const organization = getStore().discountStore.preOrganization && getStore().discountStore.preOrganization.id;
    if (organization && client) {
      return axios.post(Pathes.Discount.preprocess, { client, organization }).then(
        res => {
          const {status, data} = res;
          const message = getMessage(data);
          if (status === 200) {
            return { data, success: true }
          }

          if (data && data.errors && data.errors.client) {
            Notify.info({ text: translate("Пользователь не найден", "notify.userNotFound") })
          }
          throw new Error(message)
        }).catch(e => ({ error: e.message }));
    }
  }
}

export const setPreOrganization = organization => {
  return dispatch => dispatch({ type: SET_PRE_ORGANIZATION, organization });
}

export const completeDscTransaction = (payload, notifyResult=true) => {
  return () => {
    return axios.post(Pathes.Discount.completeTransaction, payload).then(
        res => {
          const {status, data} = res;
          const message = getMessage(data);
          if (status === 200) {
            if (notifyResult) {
              if (!!payload.discount_percent) {
                Notify.success({ text: translate("Скидка на {percent}% успешно проведена", "notify.discountProceedWith", { percent: payload.discount_percent })});
              } else {
                Notify.success({ text: translate("Скидка успешно проведена", "notify.discountProceed")});
              }
            }

            return { data, success: true }
          }

          Notify.info({ text: message })
          throw new Error(message)
        }).catch(e => ({ error: e.message }));
    }
}

export const completeCashBoxTransaction = payload => {
  return () => {
    return axios.post(Pathes.Discount.completeCashBoxTransaction, payload).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          return { data, success: true }
        }

        Notify.info({ text: message })
        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}

export const completeRentDscTransaction = payload => {
  return () => {
    return axios.post(Pathes.Discount.completeRentTransaction, payload).then(
      res => {
        const {status, data} = res;
        const message = getMessage(data);
        if (status === 200) {
          if (!!payload.discount_percent) {
            Notify.success({ text: translate("Скидка на {percent}% успешно проведена", "notify.discountProceedWith", { percent: payload.discount_percent })});
          } else {
            Notify.success({ text: translate("Скидка успешно проведена", "notify.discountProceed")});
          }

          return { data, success: true }
        }

        Notify.info({ text: message })
        throw new Error(message)
      }).catch(e => ({ error: e.message }));
  }
}