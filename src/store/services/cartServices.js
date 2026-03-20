import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import Notify from '../../components/Notification';
import { translate } from '../../locales/locales';
import { getMessage } from "../../common/helpers";
import { getQuery } from "../../common/utils";

// Delete cart
export const deleteCart = id => {
  return axios.delete(Pathes.Carts.cart(id))
    .then(res => {
      const {status} = res;
      if (status === 200 || status === 204) {
        Notify.success({text: 'Корзина удалена успешно'});
        return {data: id, success: true}
      }
      throw new Error('Не удалось удалить')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Change item count in cart
export const changeCartItemCount = payload => {
  return axios.post(Pathes.Carts.countChange, payload)
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      if (status === 400) {
        throw new Error(translate('Товара нет в наличии', 'post.notAvailable'))
      }
      throw new Error(translate('Не удалось обновить данные корзины', 'cart.failedToBuy'))
    })
    .catch(e => {
      console.log("🚀 ~ file: cartServices.js ~ line 34 ~ changeCartItemCount ~ e", e)
      return {error: e.message, success: false}
    });
}

// Delivery request of cart items
export const deliverCourierRequest = (id, payload) => {
  return axios.post(Pathes.Carts.delivery(id), payload)
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Не удалось оформить заказ')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Self pickup of cart items
export const deliverPickupRequest = cartID => {
  return axios.post(Pathes.Carts.pickup(cartID))
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Не удалось оформить заказ')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Delivery set show pays and set for delivery
export const setShowPaysForDelivery = (cartID, payload) => {
  return axios.post(Pathes.Carts.whoPays(cartID), payload)
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Не удалось оформить доставку')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Online payment with delivery of cart items
export const onlinePaymentRequest = (cartID, payload, queryParams) => {
  return axios.post(Pathes.Carts.onlinePayment(cartID) + getQuery(queryParams), payload)
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}));
}