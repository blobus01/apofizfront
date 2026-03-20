import { SET_ORG_DETAIL, CLEAR_ORG_DETAIL } from "../actions/orgDetail";

const getInitialOrgDetail = () => {
  try {
    const raw = localStorage.getItem("org_detail");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  detail: getInitialOrgDetail(),
};

const orgDetailPerm = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORG_DETAIL:
      return {
        ...state,
        detail: action.payload,
      };

    case CLEAR_ORG_DETAIL:
      return {
        ...state,
        detail: null,
      };

    default:
      return state;
  }
};

export default orgDetailPerm;
