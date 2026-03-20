import axios from '../../axios-api';
import Pathes from '../../common/pathes';
import {getMessage} from '@common/helpers';
import {getQuery} from "@common/utils";

// Organization followers in details
export const getFollowerDetails = async (orgID, userID) => {
  const response = await axios.get(Pathes.Organization.followerDetails(orgID, userID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

// Get organization client details
export const getClientDetails = async (orgID, userID) => {
  const response = await axios.get(Pathes.Organization.clientDetails(orgID, userID));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getClientBooking = async (clientID, bookingID) => {
  const response = await axios.get(Pathes.Organization.clientBooking + getQuery({
    client: clientID,
    booking: bookingID
  }));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const activateClientBooking = async transactionID => {
  const response = await axios.post(Pathes.Organization.activateClientBooking, {
    transaction: transactionID
  })

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

// Login
export const login = async userData => {
  const response = await axios.post(Pathes.Auth.login, userData)

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }
  if (status === 400) {
    return {data, success: false, message}
  }

  throw new Error(message);
}

// Account deletion
export const deleteAccount = async token => {
  const response = await axios.post(Pathes.Profile.deactivate, null, {
    headers: {Authorization: `Token ${token}`}
  })

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const checkSmsService = async () => {
  const response = await axios.get(Pathes.Profile.checkSmsService);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const checkOrganizationsWithEditRight = async () => {
  const response = await axios.get(Pathes.Profile.hasOrganizations);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getDeliveryAddresses = async () => {
  const response = await axios.get(Pathes.Profile.deliveryAddresses);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const createDeliveryAddresses = async payload => {
  const response = await axios.post(Pathes.Profile.deliveryAddresses, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 201) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getDeliveryAddress = async id => {
  const response = await axios.get(Pathes.Profile.deliveryAddress(id));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const updateDeliveryAddress = async (id, payload) => {
  const response = await axios.put(Pathes.Profile.deliveryAddress(id), payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const deleteDeliveryAddress = async id => {
  const response = await axios.delete(Pathes.Profile.deliveryAddress(id));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 204) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const makeAddressDefault = async id => {
  const response = await axios.post(Pathes.Profile.defaultAddress, {address_id: id});

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}