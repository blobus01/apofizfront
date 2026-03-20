// --- Helpers ---
const STORAGE_KEY = "globalArrayState";

// Загружаем массив из localStorage
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Сохраняем массив в localStorage
const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- Initial State ---
const initialState = {
  items: loadState(),
};

// --- Action Types ---
export const SET_ARRAY = "SET_ARRAY";
export const ADD_TO_ARRAY = "ADD_TO_ARRAY";
export const REMOVE_FROM_ARRAY = "REMOVE_FROM_ARRAY";
export const CLEAR_ARRAY = "CLEAR_ARRAY";

// --- Reducer ---
export function arrayReducer(state = initialState, action) {
  let updated;

  switch (action.type) {
    case SET_ARRAY:
      updated = action.payload;
      saveState(updated);
      return { items: updated };

    case ADD_TO_ARRAY:
      updated = [...state.items, action.payload];
      saveState(updated);
      return { items: updated };

    case REMOVE_FROM_ARRAY:
      updated = state.items.filter((item) => item !== action.payload);
      saveState(updated);
      return { items: updated };

    case CLEAR_ARRAY:
      updated = [];
      saveState(updated);
      return { items: updated };

    default:
      return state;
  }
}
