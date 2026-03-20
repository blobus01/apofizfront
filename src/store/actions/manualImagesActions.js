export const setManualImages = (images) => ({
  type: "SET_MANUAL_IMAGES",
  payload: images,
});

export const clearManualImages = () => ({
  type: "CLEAR_MANUAL_IMAGES",
});