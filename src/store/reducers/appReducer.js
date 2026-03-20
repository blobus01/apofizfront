const initialState = {
  locale: localStorage.getItem("locale") || "ru",
};

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_APP_LANGUAGE":
      return {
        ...state,
        locale: action.payload,
      };
    default:
      return state;
  }
}
