import {
  SET_ORGANIZATION_ID,
  CLEAR_ORGANIZATION_ID
} from "../actions/orgIdAction";

// читаем сохранённый id
const savedOrgId = localStorage.getItem("organizationId");

const initialState = {
  organizationId: savedOrgId ? Number(savedOrgId) : null,
};

const orgIdReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORGANIZATION_ID:
      localStorage.setItem("organizationId", action.payload);
      return {
        ...state,
        organizationId: action.payload,
      };

    case CLEAR_ORGANIZATION_ID:
      localStorage.removeItem("organizationId");
      return {
        ...state,
        organizationId: null,
      };

    default:
      return state;
  }
};

export default orgIdReducer;
