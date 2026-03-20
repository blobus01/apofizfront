const initialState = {
  aiData: {
    generatedImages: [],
  },
};

export default function aiDataReducer(state = initialState, action) {
  switch (action.type) {
    case "AI/SET_DATA":
      return {
        ...state,
        aiData: {
          ...state.aiData,
          ...action.payload,
        },
      };
      
    case "AI/ADD_IMAGE":
      return {
        ...state,
        aiData: {
          ...state.aiData,
          generatedImages: [
            ...(state.aiData.generatedImages || []),
            action.payload, // объект картинки
          ],
        },
      };

    case "AI/REMOVE_IMAGE":
      return {
        ...state,
        aiData: {
          ...state.aiData,
          generatedImages: state.aiData.generatedImages.filter(
            (img) => img.id !== action.payload
          ),
        },
      };

    case "AI/CLEAR_DATA":
      return {
        ...state,
        aiData: {},
      };

    default:
      return state;
  }
}
