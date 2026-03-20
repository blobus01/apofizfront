import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import {getMessage} from "../../common/helpers";


export const createRent = payload => {
  return axios.post(Pathes.Shop.rentals, payload).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200 || status === 201) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}

export const updateRent = (id, payload) => {
  return axios.put(Pathes.Rent.detail(id), payload).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200 || status === 201) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}

export const addRentalPeriod = (id, payload) => {
  return axios.post(Pathes.Rent.addRentalPeriod(id), payload).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200 || status === 201) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}

export const deleteRentSettings = id => {
  return axios.delete(Pathes.Stock.delete(id)).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}

export const bookRent = (id, payload) => {
  return axios.post(Pathes.Rent.book(id), payload).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}

export const bookRentOffline = (id, payload) => {
  return axios.post(Pathes.Rent.bookOffline(id), payload).then(
    res => {
      const {status, data} = res;
      const message = getMessage(data);
      if (status === 200) {
        return {data, success: true, message};
      }
      throw new Error(message)
    }).catch(e => {
    return {message: e.message, success: false }
  });
}