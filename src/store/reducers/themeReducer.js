import { SET_DARK_THEME } from "../actions/themeDark";

const initialState = {
  darkTheme: JSON.parse(localStorage.getItem("darkTheme")) || false,
};

export default function themeReducer(state = initialState, action) {
  switch (action.type) {
    case SET_DARK_THEME:
      localStorage.setItem("darkTheme", JSON.stringify(action.payload));
      return {
        ...state,
        darkTheme: action.payload,
      };

    default:
      return state;
  }
}
