import axios from "../../axios-api";
import { getMessage } from "../../common/helpers";
import Pathes from "../../common/pathes";
import { getQuery } from "../../common/utils";
import Notify from "../../components/Notification";
import {
  ADD_AVAILABLE_SIZES,
  ADD_ITEM_LINK_LOCALLY,
  ADD_RELATED_POSTS,
  ADD_PRODUCT_LINKS,
  GET_AVAILABLE_SIZES,
  GET_CRITERIA,
  GET_FORMAT,
  GET_FORMAT_SIZES,
  GET_ITEM_BY_LINK,
  GET_ITEM_LINK_SET,
  GET_NOT_CHOSEN_SIZES,
  GET_RELATED_POSTS,
  GET_SIZE_COUNTS,
  GET_STOCK_DETAIL,
  REMOVE_ITEM_LINK_LOCALLY,
  SET_AVAILABLE_SIZES,
  SET_ITEM_LINKS,
  SET_ORGANIZATION_CATEGORY_CACHE,
  UPDATE_SIZE_COUNT,
  DELETE_STOCK_DETAIL,
  DELETE_SIZE_COUNT,
  GET_SELECTED_POSTS,
  SET_ORGANIZATION,
  SORT_POSTS,
  GET_SELECTION,
  TOGGLE_SELECTED_POST,
} from "../actionTypes/stockTypes";

const getStockDetailRequest = () => ({ type: GET_STOCK_DETAIL.REQUEST });
const getStockDetailSuccess = (payload) => ({
  type: GET_STOCK_DETAIL.SUCCESS,
  payload,
});
const getStockDetailFailure = (error) => ({
  type: GET_STOCK_DETAIL.FAILURE,
  error,
});

const deleteStockDetailRequest = () => ({ type: DELETE_STOCK_DETAIL.REQUEST });
const deleteStockDetailSuccess = (payload) => ({
  type: DELETE_STOCK_DETAIL.SUCCESS,
  payload,
});
const deleteStockDetailFailure = (error) => ({
  type: DELETE_STOCK_DETAIL.FAILURE,
  error,
});

const getCriteriaRequest = () => ({ type: GET_CRITERIA.REQUEST });
const getCriteriaSuccess = (payload) => ({
  type: GET_CRITERIA.SUCCESS,
  payload,
});
const getCriteriaFailure = (error) => ({ type: GET_CRITERIA.FAILURE, error });

const getFormatRequest = () => ({ type: GET_FORMAT.REQUEST });
const getFormatSuccess = (payload) => ({ type: GET_FORMAT.SUCCESS, payload });
const getFormatError = (error) => ({ type: GET_FORMAT.FAILURE, error });

const getFormatSizesRequest = () => ({ type: GET_FORMAT_SIZES.REQUEST });
const getFormatSizesSuccess = (payload) => ({
  type: GET_FORMAT_SIZES.SUCCESS,
  payload,
});
const getFormatSizesError = (error) => ({
  type: GET_FORMAT_SIZES.FAILURE,
  error,
});

const getAvailableSizesRequest = () => ({ type: GET_AVAILABLE_SIZES.REQUEST });
const getAvailableSizesSuccess = (payload) => ({
  type: GET_AVAILABLE_SIZES.SUCCESS,
  payload,
});
const getAvailableSizesFailure = (error) => ({
  type: GET_AVAILABLE_SIZES.FAILURE,
  error,
});
export const setAvailableSizes = (payload) => ({
  type: SET_AVAILABLE_SIZES,
  payload,
});

const addAvailableSizesRequest = () => ({ type: ADD_AVAILABLE_SIZES.REQUEST });
const addAvailableSizesSuccess = (payload) => ({
  type: ADD_AVAILABLE_SIZES.SUCCESS,
  payload,
});
const addAvailableSizesFailure = (error) => ({
  type: ADD_AVAILABLE_SIZES.FAILURE,
  error,
});

const getItemLinkSetRequest = () => ({ type: GET_ITEM_LINK_SET.REQUEST });
const getItemLinkSetSuccess = (payload) => ({
  type: GET_ITEM_LINK_SET.SUCCESS,
  payload,
});
const getItemLinkSetFailure = (error) => ({
  type: GET_ITEM_LINK_SET.FAILURE,
  error,
});

export const addItemLinkLocally = (payload) => ({
  type: ADD_ITEM_LINK_LOCALLY,
  payload,
});
export const removeItemLinkLocally = (payload) => ({
  type: REMOVE_ITEM_LINK_LOCALLY,
  payload,
});

const getItemByLinkRequest = () => ({ type: GET_ITEM_BY_LINK.REQUEST });
const getItemByLinkSuccess = (payload) => ({
  type: GET_ITEM_BY_LINK.SUCCESS,
  payload,
});
const getItemByLinkFailure = (error) => ({
  type: GET_ITEM_BY_LINK.FAILURE,
  error,
});

export const setItemLinks = (payload) => ({ type: SET_ITEM_LINKS, payload });

const addShopLinkItemsSetRequest = () => ({ type: ADD_PRODUCT_LINKS.REQUEST });
const addShopLinkItemsSetSuccess = (payload) => ({
  type: ADD_PRODUCT_LINKS.SUCCESS,
  payload,
});
const addShopLinkItemsSetFailure = (error) => ({
  type: ADD_PRODUCT_LINKS.FAILURE,
  error,
});

// related products

const getRelatedPostsRequest = (payload) => ({
  type: GET_RELATED_POSTS.REQUEST,
  payload,
});
const getRelatedPostsSuccess = (payload) => ({
  type: GET_RELATED_POSTS.SUCCESS,
  payload,
});
const getRelatedPostsFailure = (error) => ({
  type: GET_RELATED_POSTS.FAILURE,
  error,
});

const getSelectedPostsRequest = (payload) => ({
  type: GET_SELECTED_POSTS.REQUEST,
  payload,
});
const getSelectedPostsSuccess = (payload) => ({
  type: GET_SELECTED_POSTS.SUCCESS,
  payload,
});
const getSelectedPostsFailure = (error) => ({
  type: GET_SELECTED_POSTS.FAILURE,
  error,
});

export const toggleSelectedPost = (payload) => ({
  type: TOGGLE_SELECTED_POST,
  payload,
});

const addRelatedPostsRequest = () => ({ type: ADD_RELATED_POSTS.REQUEST });
const addRelatedPostsSuccess = (payload) => ({
  type: ADD_RELATED_POSTS.SUCCESS,
  payload,
});
const addRelatedPostsFailure = (error) => ({
  type: ADD_RELATED_POSTS.FAILURE,
  error,
});
export const setOrganization = (payload) => ({
  type: SET_ORGANIZATION,
  payload,
});
export const sortPosts = (payload) => ({ type: SORT_POSTS, payload });

export const setOrganizationCategoryCache = (payload) => ({
  type: SET_ORGANIZATION_CATEGORY_CACHE,
  payload,
});

// size count
const getSizeCountsRequest = () => ({ type: GET_SIZE_COUNTS.REQUEST });
const getSizeCountsSuccess = (payload) => ({
  type: GET_SIZE_COUNTS.SUCCESS,
  payload,
});
const getSizeCountsFailure = (error) => ({
  type: GET_SIZE_COUNTS.FAILURE,
  error,
});

const getNotChosenSizesRequest = () => ({ type: GET_NOT_CHOSEN_SIZES.REQUEST });
const getNotChosenSizesSuccess = (payload) => ({
  type: GET_NOT_CHOSEN_SIZES.SUCCESS,
  payload,
});
const getNotChosenSizesFailure = (error) => ({
  type: GET_NOT_CHOSEN_SIZES.FAILURE,
  error,
});

const updateSizeCountRequest = () => ({ type: UPDATE_SIZE_COUNT.REQUEST });
const updateSizeCountSuccess = (payload) => ({
  type: UPDATE_SIZE_COUNT.SUCCESS,
  payload,
});
const updateSizeCountFailure = (error) => ({
  type: UPDATE_SIZE_COUNT.FAILURE,
  error,
});

const deleteSizeCountRequest = () => ({ type: DELETE_SIZE_COUNT.REQUEST });
const deleteSizeCountSuccess = (payload) => ({
  type: DELETE_SIZE_COUNT.SUCCESS,
  payload,
});
const deleteSizeCountFailure = (error) => ({
  type: DELETE_SIZE_COUNT.FAILURE,
  error,
});

// selection
const getSelectionRequest = (payload) => ({
  type: GET_SELECTION.REQUEST,
  payload,
});
const getSelectionSuccess = (payload) => ({
  type: GET_SELECTION.SUCCESS,
  payload,
});
const getSelectionFailure = (error) => ({ type: GET_SELECTION.FAILURE, error });

export const getStockDetail = (productID) => {
  return (dispatch) => {
    dispatch(getStockDetailRequest());
    return axios
      .get(Pathes.Stock.get(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getStockDetailSuccess(data));

          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => {
        getStockDetailFailure(e.message);
        return e;
      });
  };
};

export const deleteStockDetail = (productID) => {
  return (dispatch) => {
    dispatch(deleteStockDetailRequest());
    return axios
      .delete(Pathes.Stock.delete(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(deleteStockDetailSuccess(data));

          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => {
        deleteStockDetailFailure(e.message);
        return e;
      });
  };
};

export const getCriteria = (subcategoryID) => {
  return (dispatch) => {
    dispatch(getCriteriaRequest());
    return axios
      .get(Pathes.Stock.criteria_by_subcategory(subcategoryID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getCriteriaSuccess(data));
          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => {
        getCriteriaFailure(e.message);
        return e;
      });
  };
};

export const getFormat = (criteriaID) => {
  return (dispatch) => {
    dispatch(getFormatRequest());
    return axios
      .get(Pathes.Stock.format(criteriaID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getFormatSuccess(data));
          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => getFormatError(e));
  };
};

export const getFormatSizes = (formatID) => {
  return (dispatch) => {
    dispatch(getFormatSizesRequest());
    return axios
      .get(Pathes.Stock.formatSizes(formatID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getFormatSizesSuccess(data));
          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => getFormatSizesError(e));
  };
};

export const getAvailableSizes = (productID) => {
  return (dispatch) => {
    dispatch(getAvailableSizesRequest());
    return axios
      .get(Pathes.Stock.availableSizes(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const format = data.length > 0 ? data[0].format_criteria : null;

          const payload = {
            format,
            data,
          };

          dispatch(getAvailableSizesSuccess(payload));
          return { data, success: true, message };
        }
        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => getAvailableSizesFailure(e));
  };
};

export const addAvailableSizes = (productID, paylaod) => {
  return (dispatch) => {
    dispatch(addAvailableSizesRequest());
    return axios
      .post(Pathes.Stock.availableSizes(productID), paylaod)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(addAvailableSizesSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        dispatch(addAvailableSizesFailure(e.message));
      });
  };
};

export const getItemLinkSet = (productID) => {
  return (dispatch) => {
    dispatch(getItemLinkSetRequest());
    return axios
      .get(Pathes.Stock.getLinkSet(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(getItemLinkSetSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getItemLinkSetFailure(e.message));
        return e;
      });
  };
};

export const getItemByLink = (link) => {
  return (dispatch) => {
    dispatch(getItemByLinkRequest());
    return axios
      .post(Pathes.Stock.getItemByLink, { link })
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(getItemByLinkSuccess(data));
          return { success: true, data, message };
        }
        throw new Error(message);
      })
      .catch((e) => getItemByLinkFailure(e.message));
  };
};

export const addShopItemsLinks = (productID, payload) => {
  return (dispatch) => {
    dispatch(addShopLinkItemsSetRequest());
    return axios
      .post(Pathes.Stock.addLinks(productID), payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(addShopLinkItemsSetSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        addShopLinkItemsSetFailure(e);
        return e;
      });
  };
};

// related products
export const getRelatedPostsList = (productID, params) => {
  return axios
    .get(Pathes.Stock.getRelatedPosts(productID) + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return {
          data,
          success: true,
          message,
          hasMore: !!res.data.list.length,
        };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message }));
};

export const searchOrganizationItems = (organizationID, params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(getRelatedPostsRequest({ isNext: false }));

      const result = await axios.get(`/shop/organization_items/`, {
        params: {
          organization: organizationID,
          search: params.search,
          page: params.page || 1,
          limit: 21,
        },
      });

      dispatch(
        getRelatedPostsSuccess({
          hasMore: result.data.hasMore,
          posts: result.data,
        }),
      );
    } catch (error) {
      dispatch(getRelatedPostsFailure({ error: error.message }));
    }
  };
};

export const getRelatedPosts = (productID, stateModifier = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getRelatedPostsRequest(stateModifier));

      const stockState = getState().stockStore.organization;

      const {
        page = stockState.page,
        limit = stockState.limit,
        subcategories = stockState.subcategories,
        ordering = stockState.ordering,
      } = { ...stockState, ...stateModifier };

      const params = {
        page,
        limit,
        ...(subcategories && { subcategory: subcategories }),
        ...(ordering && { ordering }),
        search: stockState.search,
      };

      const result = await getRelatedPostsList(productID, params);

      if (result.success) {
        dispatch(
          getRelatedPostsSuccess({
            hasMore: result.hasMore,
            posts:
              !stockState.posts || !stockState.isNext
                ? result.data
                : {
                    ...result.data,
                    list: [...stockState.posts.list, ...result.data.list],
                  },
          }),
        );

        if (!stockState.isNext) {
          dispatch(
            setOrganizationCategoryCache({
              productID,
              catID: subcategories || "all",
              ordering: ordering || "default",
              posts: result.data,
            }),
          );
        }

        return result;
      } else {
        dispatch(
          getRelatedPostsFailure({
            hasMore: false,
            error: result.error,
          }),
        );
      }
    } catch (error) {
      dispatch(getRelatedPostsFailure({ error: error.message }));
    }
  };
};

export const getSelectedPosts = (productID) => {
  return (dispatch) => {
    dispatch(getSelectedPostsRequest());
    return axios
      .get(Pathes.Stock.getSelectedPosts(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          const mappedData = data.map((post) => post.id);
          dispatch(getSelectedPostsSuccess(mappedData));
          return { data: mappedData, success: true, message };
        }

        if (status === 404) {
          dispatch(getSelectedPostsSuccess([]));
          return { data: [], success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        dispatch(getSelectedPostsFailure(e.message));
        return e;
      });
  };
};

export const addRelatedPosts = (productID, payload) => {
  return (dispatch) => {
    dispatch(addRelatedPostsRequest());
    return axios
      .post(Pathes.Stock.addRelatedPosts(productID), payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(addRelatedPostsSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        addRelatedPostsFailure(e);
      });
  };
};

// size count
export const getSizeCounts = (productID) => {
  return (dispatch) => {
    dispatch(getSizeCountsRequest());
    return axios
      .get(Pathes.Stock.sizeCounts(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(getSizeCountsSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getSizeCountsFailure(e.message));
        return e;
      });
  };
};

export const getNotChosenSizes = (productID) => {
  return (dispatch) => {
    dispatch(getNotChosenSizesRequest());
    return axios
      .get(Pathes.Stock.notChosenSizes(productID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(getNotChosenSizesSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getNotChosenSizesFailure(e.message));
        return e;
      });
  };
};

export const updateSizeCount = (productID, payload, notDispatch = false) => {
  return (dispatch) => {
    if (!notDispatch) {
      dispatch(updateSizeCountRequest());
    }
    return axios
      .post(Pathes.Stock.sizeCounts(productID), payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          if (!notDispatch) {
            dispatch(updateSizeCountSuccess(data));
          }
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        if (!notDispatch) {
          dispatch(updateSizeCountFailure(e));
        }
      });
  };
};

export const deleteSizeCount = (sizeCountID) => {
  return (dispatch) => {
    dispatch(deleteSizeCountRequest());
    return axios
      .delete(Pathes.Stock.deleteSizeCount(sizeCountID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(deleteSizeCountSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        dispatch(deleteSizeCountFailure(e));
      });
  };
};

// selection
export const getSelection = (productID, stateModifier = {}) => {
  return (dispatch, getState) => {
    dispatch(getSelectionRequest(stateModifier));

    const limit = getState().stockStore.selection.limit;
    const page = getState().stockStore.selection.page;

    return axios
      .get(
        Pathes.Stock.postsSelection(productID) +
          getQuery({
            limit,
            page,
          }),
      )
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);

        if (status === 200) {
          dispatch(getSelectionSuccess(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getSelectionFailure(e.message));
        return e;
      });
  };
};
