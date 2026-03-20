import { SET_CHOSEN_PRODUCT, CLEAR_CHOSEN_PRODUCT } from "../actions/chosenProductActions";

const initialState = {
    product: null
};

export const chosenProductReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CHOSEN_PRODUCT:
            return {
                ...state,
                product: action.payload
            };

        case CLEAR_CHOSEN_PRODUCT:
            return {
                ...state,
                product: null
            };

        default:
            return state;
    }
};
