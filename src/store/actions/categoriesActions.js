export const SET_CATEGORIES = "SET_CATEGORIES";
export const CLEAR_CATEGORIES = "CLEAR_CATEGORIES";

export const setCategories = (categories) => ({
    type: SET_CATEGORIES,
    payload: categories,
});

export const clearCategories = () => ({
    type: CLEAR_CATEGORIES,
});
