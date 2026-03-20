import { DEFAULT_LIMIT } from "../../common/constants";
import { METADATA } from "../../common/metadata";
import {
  ADD_ITEM_LINK_LOCALLY,
  GET_AVAILABLE_SIZES,
  GET_ITEM_LINK_SET,
  GET_NOT_CHOSEN_SIZES,
  GET_RELATED_POSTS,
  GET_SELECTED_POSTS,
  GET_SELECTION,
  GET_SIZE_COUNTS,
  GET_STOCK_DETAIL,
  REMOVE_ITEM_LINK_LOCALLY,
  SET_AVAILABLE_SIZES,
  SET_ITEM_LINKS,
  SET_ORGANIZATION,
  SORT_POSTS,
  TOGGLE_SELECTED_POST,
  UPDATE_SIZE_COUNT,
} from "../actionTypes/stockTypes";

const initialState = {
  stockDetail: {
    ...METADATA.default,
    data: null,
  },

  availableSizes: {
    ...METADATA.default,
    format: null,
    data: [],
  },

  links: {
    ...METADATA.default,
    data: [],
  },

  selectedPosts: {
    ...METADATA.default,
    data: [],
  },

  organization: {
    ...METADATA.default,
    page: 1,
    limit: DEFAULT_LIMIT,
    subcategories: null,
    posts: null,
    hasMore: true,
    isNext: false,
  },

  sizeCounts: {
    ...METADATA.default,
    data: [],
  },

  notChosenSizes: {
    ...METADATA.default,
    data: [],
  },

  selection: {
    ...METADATA.default,
    data: null,
    page: 1,
    limit: DEFAULT_LIMIT,
  },
};

const stockReducer = (state = initialState, action) => {
  let linksList = state.links.data;
  const posts = state.organization.posts;
  const selectedPosts = state.selectedPosts;

  switch (action.type) {
    case GET_STOCK_DETAIL.REQUEST:
      return {
        ...state,
        stockDetail: { ...state.stockDetail, ...METADATA.request, data: null },
      };
    case GET_STOCK_DETAIL.SUCCESS:
      return {
        ...state,
        stockDetail: { ...METADATA.success, data: action.payload },
      };
    case GET_STOCK_DETAIL.FAILURE:
      return {
        ...state,
        stockDetail: {
          ...state.stockDetail,
          ...METADATA.error,
          error: action.error,
        },
      };

    case GET_AVAILABLE_SIZES.REQUEST:
      return {
        ...state,
        availableSizes: {
          ...state.availableSizes,
          ...METADATA.request,
          data: [],
          format: null,
        },
      };
    case GET_AVAILABLE_SIZES.SUCCESS:
      return {
        ...state,
        availableSizes: {
          ...METADATA.success,
          data: action.payload.data,
          format: action.payload.format,
        },
      };
    case GET_AVAILABLE_SIZES.FAILURE:
      return {
        ...state,
        availableSizes: {
          ...state.availableSizes,
          ...METADATA.error,
          error: action.error,
        },
      };

    case GET_ITEM_LINK_SET.REQUEST:
      return { ...state, links: { ...state.links, ...METADATA.request } };
    case GET_ITEM_LINK_SET.SUCCESS:
      return { ...state, links: { ...METADATA.success, data: action.payload } };
    case GET_ITEM_LINK_SET.FAILURE:
      return { ...state, links: { ...METADATA.error, error: action.error } };
    case ADD_ITEM_LINK_LOCALLY:
      return {
        ...state,
        links: { ...state.links, data: [...state.links.data, action.payload] },
      };
    case REMOVE_ITEM_LINK_LOCALLY:
      const deletedLinkIdx = state.links.data
        ? state.links.data.findIndex((l) => l.id === action.payload)
        : null;
      return {
        ...state,
        links: {
          ...state.links,
          data: linksList
            ? [
                ...linksList?.slice(0, deletedLinkIdx),
                ...linksList.slice(deletedLinkIdx + 1),
              ]
            : null,
        },
      };
    case SET_ITEM_LINKS:
      return { ...state, links: { ...state.links, data: action.payload } };

    case GET_SELECTED_POSTS.REQUEST:
      return {
        ...state,
        selectedPosts: { ...state.selectedPosts, ...METADATA.request },
      };
    case GET_SELECTED_POSTS.SUCCESS:
      return {
        ...state,
        selectedPosts: { ...METADATA.success, data: action.payload },
      };
    case GET_SELECTED_POSTS.FAILURE:
      return {
        ...state,
        selectedPosts: { ...METADATA.error, error: action.error },
      };
    case TOGGLE_SELECTED_POST:
      return {
        ...state,
        selectedPosts: {
          ...selectedPosts,
          data: selectedPosts.data.find((id) => id === action.payload)
            ? selectedPosts.data.filter((id) => id !== action.payload)
            : [...selectedPosts.data, action.payload],
        },
      };

    case SET_AVAILABLE_SIZES:
      const format = action.payload?.length
        ? action.payload[0].format_criteria
        : null;
      return {
        ...state,
        availableSizes: {
          ...state.availableSizes,
          data: action.payload,
          format,
        },
      };

    case GET_RELATED_POSTS.REQUEST:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.request,
          ...action.payload,
        },
      };
    case GET_RELATED_POSTS.SUCCESS:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.success,
          ...action.payload,
        },
      };
    case GET_RELATED_POSTS.FAILURE:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.error,
          ...action.payload,
        },
      };
    case SET_ORGANIZATION:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...action.payload,
        },
      };
    case SORT_POSTS:
      return {
        ...state,
        organization: {
          ...state.organization,
          posts: posts
            ? { ...posts, list: [...posts.list].sort(action.payload) }
            : null,
        },
      };

    case GET_SIZE_COUNTS.REQUEST:
      return {
        ...state,
        sizeCounts: { ...state.sizeCounts, ...METADATA.request },
      };
    case GET_SIZE_COUNTS.SUCCESS:
      return {
        ...state,
        sizeCounts: { ...METADATA.success, data: action.payload },
      };
    case GET_SIZE_COUNTS.FAILURE:
      return {
        ...state,
        sizeCounts: { ...METADATA.error, error: action.error },
      };

    case GET_NOT_CHOSEN_SIZES.REQUEST:
      return {
        ...state,
        notChosenSizes: { ...state.notChosenSizes, ...METADATA.request },
      };
    case GET_NOT_CHOSEN_SIZES.SUCCESS:
      return {
        ...state,
        notChosenSizes: { ...METADATA.success, data: action.payload },
      };
    case GET_NOT_CHOSEN_SIZES.FAILURE:
      return {
        ...state,
        notChosenSizes: { ...METADATA.error, error: action.error },
      };

    case UPDATE_SIZE_COUNT.SUCCESS:
      const sizeCounts = state.sizeCounts.data;
      const currentSizeCountIdx = sizeCounts.findIndex(
        (sizeCount) => sizeCount.id === action.payload.id
      );
      let newData =
        currentSizeCountIdx !== -1
          ? [
              action.payload,
              ...sizeCounts?.slice(0, currentSizeCountIdx),
              ...sizeCounts?.slice(currentSizeCountIdx + 1),
            ]
          : [action.payload, ...sizeCounts];

      // remove count without size if count with size has been added
      if (
        action.payload.size &&
        sizeCounts.find((sizeCount) => !sizeCount.size)
      ) {
        newData = newData.filter((sizeCount) => sizeCount.size);
      }

      return { ...state, sizeCounts: { ...METADATA.success, data: newData } };

    case GET_SELECTION.REQUEST:
      return {
        ...state,
        selection: {
          ...state.selection,
          ...METADATA.request,
          ...action.payload,
        },
      };
    case GET_SELECTION.SUCCESS:
      return {
        ...state,
        selection: {
          ...state.selection,
          ...METADATA.success,
          data: state.selection.data
            ? {
                ...state.selection.data,
                list: state.selection.data.list.concat(action.payload.list),
              }
            : action.payload,
        },
      };
    case GET_SELECTION.FAILURE:
      return {
        ...state,
        selection: { ...METADATA.error, error: action.error },
      };

    default:
      return state;
  }
};

export default stockReducer;
