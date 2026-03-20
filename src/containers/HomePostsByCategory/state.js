import { ORDERING_OPTIONS } from "../../components/CategoryFilterView";
import moment from "moment/moment";
import { METADATA } from "../../common/metadata";

export const filterActionTypes = {
  TOGGLE_SUBCATEGORY: "TOGGLE_SUBCATEGORY",
  TOGGLE_IS_OPEN: "TOGGLE_IS_OPEN",
  CHANGE_ORDERING: "CHANGE_ORDERING",
  SET_STATE: "SET_STATE",
};

export const postsActionTypes = {
  SET_FILTERS: "SET_FILTERS",
  SET_STATE: "SET_STATE",
  APPLY_FILTERS: "APPLY_FILTERS",
  SET_PARAMETERS: "SET_PARAMETERS",
  GET_POSTS: {
    REQUEST: "REQUEST",
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
  },
};

export const filtersInitialState = {
  isOpen: false,
  orderBy: ORDERING_OPTIONS[0].value,
  selectedSubcategories: [],
};

export const postsInitialState = {
  ...METADATA.default,
  posts: null,
  hasMore: true,
  view: "feed",
  parameters: {
    page: 1,
    selectedSubcategory: null,
    isNext: false,
    search: "",
    currentTimestamp: moment().toISOString(),
    limit: 18,
  },
  filters: {
    ...filtersInitialState,
  },
};

export const filtersReducer = (state, { type, payload }) => {
  console.log(payload, "payload");

  switch (type) {
    case filterActionTypes.TOGGLE_SUBCATEGORY:
      return {
        ...state,
        selectedSubcategories: !!state.selectedSubcategories.find(
          (cat) => payload.id === cat.id
        )
          ? state.selectedSubcategories.filter((item) => item.id !== payload.id)
          : [...state.selectedSubcategories, payload],
      };
    case filterActionTypes.TOGGLE_IS_OPEN:
      return { ...state, isOpen: !state.isOpen };
    case filterActionTypes.CHANGE_ORDERING:
      return { ...state, orderBy: payload };
    case filterActionTypes.SET_STATE:
      return { ...state, ...payload };
    default:
      return state;
  }
};

export const postsReducer = (state, { type, payload }) => {
  switch (type) {
    case postsActionTypes.SET_FILTERS:
      return { ...state, filters: payload };
    case postsActionTypes.SET_STATE:
      return { ...state, ...payload };
    case postsActionTypes.SET_PARAMETERS:
      return { ...state, parameters: { ...state.parameters, ...payload } };

    case postsActionTypes.GET_POSTS.REQUEST:
      return { ...state, ...METADATA.request };
    case postsActionTypes.GET_POSTS.SUCCESS:
      return { ...state, ...METADATA.success, posts: payload };
    case postsActionTypes.GET_POSTS.FAILURE:
      return { ...state, ...METADATA.error };
    default:
      return state;
  }
};
