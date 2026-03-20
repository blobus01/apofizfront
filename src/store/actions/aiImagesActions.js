export const addAIImage = (image) => ({
  type: "AI_IMAGES/ADD",
  payload: image,
});

export const removeAIImage = (id) => ({
  type: "AI_IMAGES/REMOVE",
  payload: id,
});

export const clearAIImages = () => ({
  type: "AI_IMAGES/CLEAR",
});
