import { SET_CATEGORIES, CLEAR_CATEGORIES } from "../actions/categoriesActions";

// читаем состояние из localStorage при загрузке
let savedCategories = [];

try {
  const raw = localStorage.getItem("categories");
  savedCategories = raw ? JSON.parse(raw) : [];
} catch (e) {
  console.warn("Invalid categories in localStorage, clearing...");
  localStorage.removeItem("categories");
  savedCategories = [];
}

const initialState = {
  list: savedCategories,
};

export const categoriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORIES: {
      const newState = {
        ...state,
        list: action.payload,
      };

      // сохраняем в localStorage
      localStorage.setItem("categories", JSON.stringify(newState.list));

      return newState;
    }

    case CLEAR_CATEGORIES: {
      const newState = {
        ...state,
        list: [],
      };

      localStorage.removeItem("categories");

      return newState;
    }

    default:
      return state;
  }
};
