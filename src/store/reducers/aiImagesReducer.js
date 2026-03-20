const initialState = {
  images: [], // тут будут ТОЛЬКО картинки
  preview: null,
};

export default function aiImagesReducer(state = initialState, action) {
  switch (action.type) {
    case "AI_IMAGES/ADD":
      return {
        ...state,
        images: [...state.images, action.payload],
      };

    case "AI_IMAGES/REMOVE":
      return {
        ...state,
        images: state.images.filter((img) => img.id !== action.payload),
      };

    case "AI_IMAGES/CLEAR":
      return {
        ...state,
        images: [],
      };

    default:
      return state;
  }
}
