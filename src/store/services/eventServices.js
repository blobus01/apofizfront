import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import {getMessage, parseExcelFileFromResponse} from "../../common/helpers";
import {getQuery} from "../../common/utils";

export const createEvent = async payload => {
  const response = await axios.post(Pathes.Events.tickets, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 201) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventCategories = async () => {
  const response = await axios.get(Pathes.Events.categories);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const setEventPeriod = async (eventID, payload) => {
  const response = await axios.post(Pathes.Events.period(eventID), payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventTicketSaleOrganizations = async params => {
  const response = await axios.get(Pathes.Events.saleOrganizations + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationEvents = async params => {
  const response = await axios.get(Pathes.Events.organizationEvents + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const checkUserOfEvent =  async payload => {
  const response = await axios.post(Pathes.Events.checkUserOfEvent, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getClientTicketsOfEvent = async params => {
  const response = await axios.get(Pathes.Events.ticketsOfEvent + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const activateTicket = async payload => {
  const response = await axios.post(Pathes.Events.activateTicket, payload);

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getClients = async (eventID, params) => {
  const response = await axios.get(Pathes.Events.clients(eventID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventReceipts = async (eventID, params) => {
  const response = await axios.get(Pathes.Events.eventReceipts(eventID) + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventBuyers = async (eventID, orgID, params) => {
  const response = await axios.get(Pathes.Events.ticketBuyers(eventID) + getQuery({...params, organization: orgID}));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventTicketPurchaseOrganizations = async params => {
  const response = await axios.get(Pathes.Events.purchaseOrganizations + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationPurchasedEvents = async params => {
  const response = await axios.get(Pathes.Events.purchasedEvents + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationEventReceipts = async params => {
  const response = await axios.get(Pathes.Events.organizationEventReceipts + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getBoughtTickets = async params => {
  const response = await axios.get(Pathes.Events.boughtTickets + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventTransaction = async params => {
  const response = await axios.get(Pathes.Events.eventTransaction + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getOrganizationPurchaseEventReceipts = async params => {
  const response = await axios.get(Pathes.Events.organizationPurchaseEventReceipts + getQuery(params));

  const {status, data} = response;
  const message = getMessage(data);

  if (status === 200) {
    return {data, success: true, message};
  }

  throw new Error(message);
}

export const getEventSalesExcel = async (eventID, params) => {
  const response = await axios.get(Pathes.Receipts.eventSalesExcelFile(eventID) + getQuery(params), {
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

export const getOrganizationEventSalesExcel = async (orgID, params) => {
  const response = await axios.get(Pathes.Receipts.organizationEventSalesExcelFile(orgID) + getQuery(params), {
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
