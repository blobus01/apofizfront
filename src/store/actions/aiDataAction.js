// aiDataAction.js

export const setAiData = (data) => {
  return {
    type: "AI/SET_DATA",
    payload: data,
  };
};

export const addGeneratedImage = (image) => ({
  type: "AI/ADD_IMAGE",
  payload: image,
});

export const removeGeneratedImage = (id) => ({
  type: "AI/REMOVE_IMAGE",
  payload: id,
});

export const clearAiData = () => {
  return {
    type: "AI/CLEAR_DATA",
  };
};
