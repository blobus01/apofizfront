const initialState = {
  images: [],
};

export default function manualImagesReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_MANUAL_IMAGES":
      return { ...state, images: action.payload };
    case "CLEAR_MANUAL_IMAGES":
      return { ...state, images: [] };
    default:
      return state;
  }
}
