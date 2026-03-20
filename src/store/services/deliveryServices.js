import axios from '../../axios-api';
import Pathes from '../../common/pathes';

// Accept order for delivery
export const acceptOrderForDelivery = deliveryInfoID => {
  return axios.get(Pathes.Delivery.acceptOrder(deliveryInfoID))
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Не удалось оформить доставку')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Reject order for delivery after order is taken for delivery
export const rejectOrderForDelivery = deliveryInfoID => {
  return axios.get(Pathes.Delivery.rejectOrder(deliveryInfoID))
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Не удалось отменить доставку')
    })
    .catch(e => ({error: e.message, success: false}));
}

// Delivered
export const setOrderAsDelivered = deliveryInfoID => {
  return axios.get(Pathes.Delivery.orderDelivered(deliveryInfoID))
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error('Ошибка');
    })
    .catch(e => ({error: e.message, success: false}));
}