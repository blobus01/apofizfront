import axios from "../../axios-api";
import Pathes from "@common/pathes";
import { getMessage } from "@common/helpers";
import { getQuery } from "@common/utils";

export const createAiAssistant = async (payload) => {
  const response = await axios.post(Pathes.Organization.assistant, payload);
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getAiAssistant = async (id) => {
  const response = await axios.get(Pathes.Organization.assistantDetail(id));
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const updateAiAssistant = async (id, payload) => {
  const response = await axios.put(
    Pathes.Organization.assistantDetail(id),
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getAiQuestions = async (queryParams) => {
  const response = await axios.get(
    Pathes.Organization.assistantQuestions + getQuery(queryParams),
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const uploadFileForAnswer = async (formData, config) => {
  const response = await axios.post(
    Pathes.Organization.assistantAnswerFile,
    formData,
    config,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const createAiQuestionAnswer = async (payload) => {
  const response = await axios.post(
    Pathes.Organization.assistantAnswer,
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const updateAiQuestionAnswer = async (answerID, payload) => {
  const response = await axios.put(
    Pathes.Organization.assistantAnswerDetail(answerID),
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getAiQuestionAnswer = async (answerID) => {
  const response = await axios.get(
    Pathes.Organization.assistantAnswerDetail(answerID),
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getAiTariffs = async (assistantID, lang) => {
  const response = await axios.get(
    Pathes.Organization.assistantPlans(assistantID),
    {
      headers: {
        "accept-Language": lang,
      },
    },
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const purchaseAi = async (payload) => {
  const response = await axios.post(
    Pathes.Organization.assistantPurchase,
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getChat = async (params) => {
  const response = await axios.get(
    Pathes.Organization.assistantChat + getQuery(params),
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getChatMessages = async (chatID, params, config) => {
  const response = await axios.get(
    Pathes.Organization.assistantChatMessages(chatID) + getQuery(params),
    config,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(data.isCanceled ? "canceled" : message);
};

export const postChatMessage = async (chatID, payload) => {
  const response = await axios.post(
    Pathes.Organization.assistantChatMessages(chatID),
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const getAssistantChats = async (assistantID, params) => {
  const response = await axios.get(
    Pathes.Organization.assistantChats(assistantID) + getQuery(params),
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const readChatMessages = async (assistantID) => {
  const response = await axios.post(
    Pathes.Organization.readAssistantChatMessages(assistantID),
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const changeAssistantChatStatus = async (payload) => {
  const response = await axios.post(
    Pathes.Organization.assistantChatStatus,
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};

export const toggleAssistant = async (payload) => {
  const response = await axios.post(
    Pathes.Organization.toggleAssistant,
    payload,
  );
  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message, status };
  }

  throw new Error(message);
};
