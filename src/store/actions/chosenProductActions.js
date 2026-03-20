// Типы
export const SET_CHOSEN_PRODUCT = "SET_CHOSEN_PRODUCT";
export const CLEAR_CHOSEN_PRODUCT = "CLEAR_CHOSEN_PRODUCT";

// Сохранить объект
export const setChosenProduct = (product) => ({
  type: SET_CHOSEN_PRODUCT,
  payload: product,
});

// Очистить объект
export const clearChosenProduct = () => ({
  type: CLEAR_CHOSEN_PRODUCT,
});
