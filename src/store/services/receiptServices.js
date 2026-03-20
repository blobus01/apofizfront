import moment from 'moment';
import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import Notify from '../../components/Notification';
import {translate} from '../../locales/locales';
import {getMessage, parseExcelFileFromResponse} from '../../common/helpers';
import {getQuery} from '../../common/utils';

// Change item count in cart
export const changeItemCountInReceipt = (cartID, payload) => {
  return axios.put(Pathes.Carts.cart(cartID), payload)
    .then(res => {
      const {status, data} = res;
      if (status === 200) {
        return {data, success: true, status};
      }
      if (status === 400) {
        return {data, success: false, status}
      }
      throw new Error('Проверьте соединение с интернетом');
    })
    .catch(e => ({error: e.message, success: false}));
};

// Accept online transaction
export const acceptOnlineReceipt = receiptID => {
  return axios.post(Pathes.Receipts.acceptReceipt, {
    transaction_id: receiptID,
    utc_offset_minutes: moment().utcOffset()
  }).then(res => {
      const {status, data} = res;
      if (status === 200) {
        Notify.success({text: translate("Вы приняли заказ", "notify.acceptReceiptSuccess")});
        return {data, success: true};
      }
      throw new Error('Не удалось отменить чек');
    })
    .catch(e => ({error: e.message, success: false}));
};

// Accept online transaction which will be paid online
export const acceptOnlinePaymentReceipt = receiptID => {
  return axios.post(Pathes.Receipts.acceptOnlinePaymentReceipt, {
    transaction_id: receiptID,
    utc_offset_minutes: moment().utcOffset()
  }).then(res => {
    const {status, data} = res;
    if (status === 200) {
      Notify.success({text: translate("Вы приняли заказ", "notify.acceptReceiptSuccess")});
      return {data, success: true};
    }
    throw new Error('Не удалось отменить чек');
  })
    .catch(e => ({error: e.message, success: false}));
};

// Reject transaction
export const rejectOnlineReceipt = receiptID => {
  return axios.delete(Pathes.Receipts.transaction(receiptID))
    .then(res => {
      const {status, data} = res;
      if (status === 204) {
        Notify.success({ text: translate("Чек {id} успешно отменен", "notify.receiptRemoveSuccess", { id: receiptID })});
        return {data, success: true};
      }
      throw new Error('Не удалось отменить чек');
    })
    .catch(e => ({error: e.message, success: false}));
};

// Accept online booking transaction
export const acceptOnlineBookingReceipt = receiptID => {
  return axios.post(Pathes.Receipts.acceptBookingReceipt, {
    transaction_id: receiptID,
    utc_offset_minutes: moment().utcOffset()
  }).then(res => {
    const {status, data} = res;
    const message = getMessage(data)
    if (status === 200) {
      Notify.success({text: translate("Вы приняли заказ", "notify.acceptReceiptSuccess")});
      return {data, success: true};
    }
    throw new Error(message);
  })
    .catch(e => ({error: e.message, success: false}));
};

// Reject online booking transaction
export const rejectOnlineBookingReceipt = receiptID => {
  return axios.delete(Pathes.Receipts.bookingTransaction(receiptID))
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 204) {
        Notify.success({ text: translate("Чек {id} успешно отменен", "notify.receiptRemoveSuccess", { id: receiptID })});
        return {data, success: true};
      }
      throw new Error(message);
    })
    .catch(e => ({error: e.message, success: false}));
};

// Pay for rent
export const acceptPayment = receiptID => {
  return axios.post(Pathes.Receipts.acceptPayment, {
    transaction_id: receiptID,
  }).then(res => {
    const {status, data} = res;
    const message = getMessage(data)
    if (status === 200) {
      Notify.success({text: translate("Вы оплатили заказ", "notify.acceptPaymentSuccess")});
      return {data, success: true};
    }
    throw new Error(message);
  })
    .catch(e => ({error: e.message, success: false}));
};

// Reject payment for product (client)
export const rejectProductPayment = receiptID => {
  return axios.delete(Pathes.Receipts.rejectProductPayment(receiptID)).then(res => {
    const {status, data} = res;
    const message = getMessage(data)
    if (status === 204) {
      Notify.success({ text: translate("Оплата успешно отменена", "notify.rejectPaymentSuccess", { id: receiptID })});
      return {data, success: true};
    }
    throw new Error(message);
  })
    .catch(e => ({error: e.message, success: false}));
};

// Reject payment for rent (client)
export const rejectRentalPayment = receiptID => {
  return axios.delete(Pathes.Receipts.rejectRentalPayment(receiptID)).then(res => {
    const {status, data} = res;
    const message = getMessage(data)
    if (status === 204) {
      Notify.success({ text: translate("Оплата успешно отменена", "notify.rejectPaymentSuccess", { id: receiptID })});
      return {data, success: true};
    }
    throw new Error(message);
  })
    .catch(e => ({error: e.message, success: false}));
};

// Get transaction number and available discounts
export const preprocessTransaction = payload => {
  return axios.post(Pathes.Discount.preprocess, payload).then(res => {
    const {status, data} = res;
    const message = getMessage(data);
    if (status === 200) {
        return {data, success: true};
    }

    if (status === 406) {
      Notify.success(message)
    }
      throw new Error(message);
    })
    .catch(e => ({error: e.message, success: false}));
};

// Get transaction number and available discounts (for rent)
export const preprocessBookingTransaction = (rentID, payload) => {
  return axios.post(Pathes.Discount.preprocessBooking(rentID), payload).then(res => {
    const {status, data} = res;
    const message = getMessage(data);
    if (status === 200) {
      return {data, success: true};
    }

    if (status === 406) {
      Notify.success(message)
    }
    throw new Error(message);
  })
    .catch(e => ({error: e.message, success: false}));
};

export const transactionsUsers = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.transactionsUsers(orgID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
};

export const getRentTransactionsUsers = async (rentID, params) => {
  const response = await axios.get(Pathes.Receipts.rentTransactionsUsers(rentID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
};

export const transactionsReceipts = async params => {
  const response = await axios.get(Pathes.Receipts.transactions + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getTransactionsExcelFile = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.excelFile(orgID) + getQuery(params), {
    responseType: 'blob'
  });
  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    const excelFile = parseExcelFileFromResponse(response)
    return {data: excelFile, success: true, message};
  }

  throw new Error(message);
}

export const getRentTransactionsExcelFile = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.rentExcelFile(orgID) + getQuery(params), {
    responseType: 'blob'
  });
  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    const excelFile = parseExcelFileFromResponse(response)
    return {data: excelFile, success: true, message};
  }

  throw new Error(message);
}

export const getRentDetailTransactionsExcelFile = async (rentID, params) => {
  const response = await axios.get(Pathes.Receipts.rentDetailExcelFile(rentID) + getQuery(params), {
    responseType: 'blob'
  });
  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    const excelFile = parseExcelFileFromResponse(response)
    return {data: excelFile, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationRentSaleTransactions = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.rentSaleTransactions + getQuery({organization: orgID, ...params}));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getRentDetailSaleReceipts = async (rentID, params) => {
  const response = await axios.get(Pathes.Receipts.rentDetailSale(rentID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getRentDetailTransactionsUsers = async (rentID, params) => {
  const response = await axios.get(Pathes.Receipts.rentDetailTransactionsUsers(rentID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationClientReceipts = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.rentOrderTransactions + getQuery({...params, organization: orgID}));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getUserRentDetailOrdersReceipts = async (rentID, params) => {
  const response = await axios.get(Pathes.Receipts.rentDetailOrderTransactions(rentID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const initializePayment = async (paymentSystemID, payload) => {
  const response = await axios.post(Pathes.Receipts.initializePayment(paymentSystemID), payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const completeOfflineDscTransaction = async (transactionID) => {
  const response = await axios.post(Pathes.Receipts.completeOfflineDscTransaction, {
    transaction_id: transactionID
  });

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const acceptOrderPayment = async transactionID => {
  const response = await axios.post(Pathes.Receipts.acceptOrderPayment, {
    transaction_id: transactionID
  });

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}