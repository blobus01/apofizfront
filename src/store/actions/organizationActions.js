import axios from "../../axios-api";
import { push } from "react-router-redux";
import Pathes from "../../common/pathes";
import Notify from "../../components/Notification";
import qs from "qs";
import { getMessage } from "../../common/helpers";
import { getQuery } from "../../common/utils";
import {
  ACCEPT_ALL_FOLLOWERS,
  ACCEPT_OR_CANCEL_FOLLOWER,
  CREATE_ORG,
  GET_CARD_BACKGROUNDS,
  GET_ORG,
  GET_ORG_COLLECTION_ITEMS,
  GET_ORG_COLLECTION_SUBCATEGORIES,
  GET_ORG_HOTLINK_DETAILS,
  GET_ORG_HOTLINKS,
  GET_ORG_LIST,
  GET_ORG_PROMOTION,
  GET_ORG_SUB_TYPES,
  GET_ORG_TYPES,
  GET_SELECTED_HOTLINK_COLLECTION_ITEMS,
  SET_ORGANIZATION_DETAIL,
} from "./actionTypes";
import {
  GET_ORG_FOLLOWERS,
  GET_ORG_PROMOTIONS,
  GET_ORG_SHADOW_BAN_STATUS,
  GET_ORGANIZATION_CLIENT_DETAILS,
  GET_ORGANIZATION_POSTS,
  GET_ORGANIZATION_SUBCATEGORIES,
  SEND_REMOVE_ORG_FROM_SHADOW_BAN,
  SEND_VERIFICATION_ORGANIZATION,
  CLEAR_ORG_CLIENT_DETAILS,
  SET_CLOSE_ORG_SHADOW_BAN,
  SET_ORG_CLIENT,
  SET_ORG_TITLE,
  SET_MY_PURCHASES_ORGANIZATIONS,
  SET_MY_AFFILIATED_ORGANIZATION,
  SET_ORGANIZATION_POSTS_STATE,
  SET_SELECTED_HOTLINK_COLLECTION_SUBCATEGORIES,
  SET_USER_LIMITS,
  SET_ORGANIZATION_CATEGORY_CACHE,
  CLEAR_ORGANIZATION_CATEGORY_CACHE,
  GET_ORGANIZATION_SUBCATEGORIES_BY_POST,
  SET_MY_RENT_PURCHASES_ORGANIZATIONS,
  SET_MY_AFFILIATED_RENT_ORGANIZATIONS,
  SET_ORGANIZATION_CREATION_INITIAL_DATA,
  SET_ORG_CLIENT_DETAILS,
} from "../actionTypes/organizationTypes";
import { translate } from "../../locales/locales";
import {
  acceptAllFollowers,
  acceptRequestFollower,
  cancelRequestFollower,
  getOrgPostsList,
  getOrgStatusDetail,
  getOrgSubcategories,
  requestFromShadowBan,
  sendVerificationOrganization,
} from "../services/organizationServices";
import { clearConvertedItem } from "./commonActions";
import { getClientDetails, getFollowerDetails } from "../services/userServices";

const createOrgRequest = () => ({ type: CREATE_ORG.REQUEST });
const createOrgSuccess = (org) => ({ type: CREATE_ORG.SUCCESS, org });
const createOrgFailure = (error) => ({ type: CREATE_ORG.FAILURE, error });

const getOrgListRequest = () => ({ type: GET_ORG_LIST.REQUEST });
const getOrgListSuccess = (list) => ({ type: GET_ORG_LIST.SUCCESS, list });
const getOrgListFailure = (error) => ({ type: GET_ORG_LIST.FAILURE, error });

const getOrgRequest = () => ({ type: GET_ORG.REQUEST });
const getOrgSuccess = (detail) => ({ type: GET_ORG.SUCCESS, detail });
const getOrgFailure = (error) => ({ type: GET_ORG.FAILURE, error });

const getOrgTypesRequest = () => ({ type: GET_ORG_TYPES.REQUEST });
const getOrgTypesSuccess = (types) => ({ type: GET_ORG_TYPES.SUCCESS, types });
const getOrgTypesFailure = (error) => ({ type: GET_ORG_TYPES.FAILURE, error });

const getOrgSubTypesRequest = () => ({ type: GET_ORG_SUB_TYPES.REQUEST });
const getOrgSubTypesSuccess = (types) => ({
  type: GET_ORG_SUB_TYPES.SUCCESS,
  types,
});
const getOrgSubTypesFailure = (error) => ({
  type: GET_ORG_SUB_TYPES.FAILURE,
  error,
});

const getCardBackgroundsRequest = () => ({
  type: GET_CARD_BACKGROUNDS.REQUEST,
});
const getCardBackgroundsSuccess = (backgrounds) => ({
  type: GET_CARD_BACKGROUNDS.SUCCESS,
  backgrounds,
});
const getCardBackgroundsFailure = (error) => ({
  type: GET_CARD_BACKGROUNDS.FAILURE,
  error,
});

const getOrgFollowersRequest = () => ({ type: GET_ORG_FOLLOWERS.REQUEST });
const getOrgFollowersSuccess = (payload) => ({
  type: GET_ORG_FOLLOWERS.SUCCESS,
  payload,
});
const getOrgFollowersFailure = (error) => ({
  type: GET_ORG_FOLLOWERS.FAILURE,
  error,
});

const getOrgHotlinksRequest = () => ({ type: GET_ORG_HOTLINKS.REQUEST });
const getOrgHotlinksSuccess = (payload) => ({
  type: GET_ORG_HOTLINKS.SUCCESS,
  payload,
});
const getOrgHotlinksFailure = (error) => ({
  type: GET_ORG_HOTLINKS.FAILURE,
  error,
});

const getOrgHotlinkDetailsRequest = () => ({
  type: GET_ORG_HOTLINK_DETAILS.REQUEST,
});
const getOrgHotlinkDetailsSuccess = (payload) => ({
  type: GET_ORG_HOTLINK_DETAILS.SUCCESS,
  payload,
});
const getOrgHotlinkDetailsFailure = (error) => ({
  type: GET_ORG_HOTLINK_DETAILS.FAILURE,
  error,
});

const getOrgPromotionRequest = () => ({ type: GET_ORG_PROMOTION.REQUEST });
const getOrgPromotionSuccess = (payload) => ({
  type: GET_ORG_PROMOTION.SUCCESS,
  payload,
});
const getOrgPromotionFailure = (error) => ({
  type: GET_ORG_PROMOTION.FAILURE,
  error,
});

const getOrgCollectionItemsRequest = () => ({
  type: GET_ORG_COLLECTION_ITEMS.REQUEST,
});
const getOrgCollectionItemsSuccess = (payload) => ({
  type: GET_ORG_COLLECTION_ITEMS.SUCCESS,
  payload,
});
const getOrgCollectionItemsFailure = (error) => ({
  type: GET_ORG_COLLECTION_ITEMS.FAILURE,
  error,
});

const getOrgCollectionSubcategoriesRequest = () => ({
  type: GET_ORG_COLLECTION_SUBCATEGORIES.REQUEST,
});
const getOrgCollectionSubcategoriesSuccess = (payload) => ({
  type: GET_ORG_COLLECTION_SUBCATEGORIES.SUCCESS,
  payload,
});
const getOrgCollectionSubcategoriesFailure = (error) => ({
  type: GET_ORG_COLLECTION_SUBCATEGORIES.FAILURE,
  error,
});

const getSelectedHotlinkCollectionItemsRequest = () => ({
  type: GET_SELECTED_HOTLINK_COLLECTION_ITEMS.REQUEST,
});
const getSelectedHotlinkCollectionItemsSuccess = (payload) => ({
  type: GET_SELECTED_HOTLINK_COLLECTION_ITEMS.SUCCESS,
  payload,
});
const getSelectedHotlinkCollectionItemsFailure = (error) => ({
  type: GET_SELECTED_HOTLINK_COLLECTION_ITEMS.FAILURE,
  error,
});
export const clearHotlinkCollectionItems = () => ({
  type: GET_SELECTED_HOTLINK_COLLECTION_ITEMS.CLEAR,
});

const getOrgPromotionsRequest = () => ({ type: GET_ORG_PROMOTIONS.REQUEST });
const getOrgPromotionsSuccess = (payload) => ({
  type: GET_ORG_PROMOTIONS.SUCCESS,
  payload,
});
const getOrgPromotionsFailure = (error) => ({
  type: GET_ORG_PROMOTIONS.FAILURE,
  error,
});

const getOrgShadowBanStatusRequest = () => ({
  type: GET_ORG_SHADOW_BAN_STATUS.REQUEST,
});
const getOrgShadowBanStatusSuccess = (orgBan) => ({
  type: GET_ORG_SHADOW_BAN_STATUS.SUCCESS,
  payload: orgBan,
});
const getOrgShadowBanStatusFailure = (error) => ({
  type: GET_ORG_SHADOW_BAN_STATUS.FAILURE,
  payload: error,
});

const sendRemoveOrgFromShadowBanRequest = () => ({
  type: SEND_REMOVE_ORG_FROM_SHADOW_BAN.REQUEST,
});
const sendRemoveOrgFromShadowBanSuccess = () => ({
  type: SEND_REMOVE_ORG_FROM_SHADOW_BAN.SUCCESS,
});
const sendRemoveOrgFromShadowBanFailure = (error) => ({
  type: SEND_REMOVE_ORG_FROM_SHADOW_BAN.FAILURE,
  payload: error,
});

const sendVerificationOrganizationRequest = () => ({
  type: SEND_VERIFICATION_ORGANIZATION.REQUEST,
});
const sendVerificationOrganizationSuccess = () => ({
  type: SEND_VERIFICATION_ORGANIZATION.SUCCESS,
});
const sendVerificationOrganizationFailure = (error) => ({
  type: SEND_VERIFICATION_ORGANIZATION.FAILURE,
  payload: error,
});

const getOrganizationPostsRequest = (payload) => ({
  type: GET_ORGANIZATION_POSTS.REQUEST,
  payload,
});
const getOrganizationPostsSuccess = (payload) => ({
  type: GET_ORGANIZATION_POSTS.SUCCESS,
  payload,
});
const getOrganizationPostsFailure = (payload) => ({
  type: GET_ORGANIZATION_POSTS.FAILURE,
  payload,
});
export const setOrganizationPostsState = (payload) => ({
  type: SET_ORGANIZATION_POSTS_STATE,
  payload,
});
export const setOrganizationCategoryCache = (payload) => ({
  type: SET_ORGANIZATION_CATEGORY_CACHE,
  payload,
});
export const clearOrganizationCategoryCache = () => ({
  type: CLEAR_ORGANIZATION_CATEGORY_CACHE,
});

const getOrganizationSubcategoriesRequest = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES.REQUEST,
  payload,
});
const getOrganizationSubcategoriesSuccess = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES.SUCCESS,
  payload,
});
const getOrganizationSubcategoriesFailure = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES.FAILURE,
  payload,
});

const getOrganizationSubcategoriesByPostRequest = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES_BY_POST.REQUEST,
  payload,
});
const getOrganizationSubcategoriesByPostSuccess = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES_BY_POST.SUCCESS,
  payload,
});
const getOrganizationSubcategoriesByPostFailure = (payload) => ({
  type: GET_ORGANIZATION_SUBCATEGORIES_BY_POST.FAILURE,
  payload,
});

const acceptOrCancelFollowerRequest = () => ({
  type: ACCEPT_OR_CANCEL_FOLLOWER.REQUEST,
});
const acceptOrCancelFollowerSuccess = (userID) => ({
  type: ACCEPT_OR_CANCEL_FOLLOWER.SUCCESS,
  payload: userID,
});
const acceptOrCancelFollowerFailure = (error) => ({
  type: ACCEPT_OR_CANCEL_FOLLOWER.FAILURE,
  payload: error,
});

const sendAcceptAllFollowersRequest = () => ({
  type: ACCEPT_ALL_FOLLOWERS.REQUEST,
});
const sendAcceptAllFollowersSuccess = () => ({
  type: ACCEPT_ALL_FOLLOWERS.SUCCESS,
});
const sendAcceptAllFollowersFailure = (error) => ({
  type: ACCEPT_ALL_FOLLOWERS.FAILURE,
  payload: error,
});

const getOrganizationClientDetailsRequest = () => ({
  type: GET_ORGANIZATION_CLIENT_DETAILS.REQUEST,
});
const getOrganizationClientDetailsSuccess = (clientDetail) => ({
  type: GET_ORGANIZATION_CLIENT_DETAILS.SUCCESS,
  payload: clientDetail,
});
const getOrganizationClientDetailsFailure = (error) => ({
  type: GET_ORGANIZATION_CLIENT_DETAILS.FAILURE,
  payload: error,
});

export const setOrganizationDetail = (payload) => ({
  type: SET_ORGANIZATION_DETAIL,
  payload,
});

export const setCloseOrgShadowBan = () => ({ type: SET_CLOSE_ORG_SHADOW_BAN });
export const setOrgClientDetails = (payload) => ({
  type: SET_ORG_CLIENT_DETAILS,
  payload,
});
export const clearOrgClientDetails = () => ({ type: CLEAR_ORG_CLIENT_DETAILS });

const setSelectedHotlinkCollectionSubcategories = (payload) => ({
  type: SET_SELECTED_HOTLINK_COLLECTION_SUBCATEGORIES,
  payload,
});

const setUserLimits = (value) => ({ type: SET_USER_LIMITS, value });

export const setOrganizationCreationInitialData = (payload) => ({
  type: SET_ORGANIZATION_CREATION_INITIAL_DATA,
  payload,
});

export const getOrganizationsList = (params, isNext) => {
  return (dispatch, getState) => {
    const filteredParams = { ...params };
    delete filteredParams.hasMore;

    const query = `?${qs.stringify(filteredParams, {
      strictNullHandling: true,
      skipNulls: true,
    })}`;
    dispatch(getOrgListRequest());
    return axios
      .get(Pathes.Organization.list + query)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().organizationStore.orgList.data;
          if (!isNext || !prevData) {
            dispatch(getOrgListSuccess(data));
            return { ...data, success: true, message };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgListSuccess(updatedData));
          return { ...updatedData, success: true, message };
        }

        Notify.info({ text: message });
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgListFailure(e.message)));
  };
};

export const getOrganizationDetail = (id) => {
  return (dispatch) => {
    dispatch(getOrgRequest());
    return axios
      .get(Pathes.Organization.get(id))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgSuccess(data));
          return { data, success: true, message };
        }
        dispatch(push("/profile"));
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgFailure(e.message)));
  };
};

export const createOrganization = (data) => {
  return (dispatch) => {
    dispatch(createOrgRequest());
    return axios
      .post(Pathes.Organization.create, data)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 201) {
          dispatch(createOrgSuccess(data));
          Notify.success({
            text: translate(
              "Организация успешно создана",
              "notify.organizationCreateSuccess"
            ),
          });
          return { ...data, success: true, message };
        }

        Notify.info({
          text: translate(
            "Не удалось создать организацию",
            "notify.organizationCreateError"
          ),
        });
        throw new Error(message);
      })
      .catch((e) => dispatch(createOrgFailure(e.message)));
  };
};

export const setOrganizationPhones = (data, id) => {
  return () => {
    return axios
      .post(Pathes.Organization.setPhones(id), data)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          return { ...data, success: true, message };
        }

        Notify.info({ text: message });
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const setOrganizationSocials = (data, id) => {
  return () => {
    return axios
      .post(Pathes.Organization.setSocials(id), data)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const getOrganizationTypes = () => {
  return (dispatch) => {
    dispatch(getOrgTypesRequest());
    return axios
      .get(Pathes.Organization.types)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgTypesSuccess(data));
          return { ...data, success: true, message };
        }

        Notify.info({ text: message });
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgTypesFailure(e.message)));
  };
};

export const getOrganizationSubTypes = (params) => {
  return (dispatch) => {
    dispatch(getOrgSubTypesRequest());
    return axios
      .get(Pathes.Organization.subTypes + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgSubTypesSuccess(data));
          return { ...data, success: true, message };
        }

        Notify.info({ text: message });
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgSubTypesFailure(e.message)));
  };
};

export const editOrganization = (id, payload) => {
  return (dispatch) => {
    return axios
      .put(Pathes.Organization.edit(id), payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({
            text: translate(
              "Вы успешно обновили данные организации",
              "notify.organizationEditSuccess"
            ),
          });
          dispatch(push(`/organizations/${id}`));
          dispatch(getOrgSuccess(data));
          dispatch(clearConvertedItem(id, "org"));
          return { ...data, success: true, message };
        }

        Notify.error({ text: message });
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const createOrganizationDiscount = (payload) => {
  return () => {
    return axios
      .post(Pathes.Organization.createDiscount, payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 201) {
          Notify.success({
            text: translate(
              "Вы успешно создали карты организации",
              "notify.discountsCreateSuccess"
            ),
          });
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const bulkUpdateOrgDiscounts = (payload) => {
  return () => {
    return axios
      .post(Pathes.Organization.bulkUpdateDiscounts, payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({
            text: translate(
              "Вы успешно обновили карты организации",
              "notify.discountsEditSuccess"
            ),
          });
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const bulkDeleteOrgDiscounts = (payload) => {
  return () => {
    return axios
      .post(Pathes.Organization.bulkDeleteDiscounts, payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          Notify.success({
            text: translate(
              "Вы успешно удалили карты организации",
              "notify.discountsRemoveSuccess"
            ),
          });
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const editDiscountImage = (cardID, image_id, orgID) => {
  return (dispatch) => {
    return axios
      .put(Pathes.Organization.discountImage(cardID), { image_id })
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          orgID && dispatch(getOrganizationDetail(orgID));
          Notify.success({
            text: translate(
              "Фон успешно изменён",
              "notify.backgroundChangeSuccess"
            ),
          });
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => ({ error: e.message }));
  };
};

export const getCardBackgrounds = () => {
  return (dispatch) => {
    dispatch(getCardBackgroundsRequest());
    return axios
      .get(Pathes.Organization.cardBackgrounds)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getCardBackgroundsSuccess(data));
          return { ...data, success: true, message };
        }

        throw new Error(message);
      })
      .catch((e) => getCardBackgroundsFailure(e.message));
  };
};

export const getOrgFollowers = (orgID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgFollowersRequest());
    return axios
      .get(
        Pathes.Organization.followers(orgID) +
          getQuery(params, ["subscribersCount"])
      )
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().organizationStore.orgFollowers.data;
          if (!isNext || !prevData) {
            dispatch(getOrgFollowersSuccess(data));
            return { ...data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgFollowersSuccess(updatedData));
          return { ...updatedData, success: true };
        }
        if (status === 403) {
          dispatch(getOrgFollowersFailure(message));
          return { success: false, status, message };
        }

        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgFollowersFailure(e.message)));
  };
};

// Get list of promos
export const getOrgPromotions = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgPromotionsRequest());
    return axios
      .get(Pathes.Organization.promotions + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().organizationStore.orgPromotions.data;
          if (!isNext || !prevData) {
            dispatch(getOrgPromotionsSuccess(data));
            return { ...data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgPromotionsSuccess(updatedData));
          return { ...updatedData, success: true };
        }

        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgPromotionsFailure(e.message)));
  };
};

// --------------------------- //
const setMyPurchasesOrganizations = (payload) => ({
  type: SET_MY_PURCHASES_ORGANIZATIONS,
  payload,
});
const setMyAffiliatedOrganizations = (payload) => ({
  type: SET_MY_AFFILIATED_ORGANIZATION,
  payload,
});

const setMyRentPurchasesOrganizations = (payload) => ({
  type: SET_MY_RENT_PURCHASES_ORGANIZATIONS,
  payload,
});
const setMyAffiliatedRentOrganizations = (payload) => ({
  type: SET_MY_AFFILIATED_RENT_ORGANIZATIONS,
  payload,
});

const setOrgTitle = (payload) => ({ type: SET_ORG_TITLE, payload });

// Get organizations where user did transactions
export const getMyPurchasesOrganizations = (params, isNext) => {
  return (dispatch, getState) => {
    return axios
      .get(Pathes.Statistics.orderStatistics + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().organizationStore.orgUserDidTransactions;
          if (!isNext || !prevData) {
            dispatch(setMyPurchasesOrganizations(data));
            return { data, success: true, message };
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(setMyPurchasesOrganizations(updatedData));
          return { data: updatedData, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message, status: false }));
  };
};

// Get Organizations where user has transactions as seller or owner
export const getMyAffiliatedOrganizations = (params, isNext) => {
  return (dispatch, getState) => {
    return axios
      .get(Pathes.Statistics.saleStatistics + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData =
            getState().organizationStore.orgUserHasTransactionsAsSeller;
          if (!isNext || !prevData) {
            dispatch(setMyAffiliatedOrganizations(data));
            return { data, success: true, message };
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(setMyAffiliatedOrganizations(updatedData));
          return { data: updatedData, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message, status: false }));
  };
};

// Get organizations where user did rent transactions
export const getMyRentPurchasesOrganizations = (params, isNext) => {
  return (dispatch, getState) => {
    return axios
      .get(Pathes.Statistics.rentOrderStatistics + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData =
            getState().organizationStore.myRentPurchasesOrganizations;
          if (!isNext || !prevData) {
            dispatch(setMyRentPurchasesOrganizations(data));
            return { data, success: true, message };
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(setMyRentPurchasesOrganizations(updatedData));
          return { data: updatedData, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message, status: false }));
  };
};

// Get Organizations where user has rent transactions as seller or owner
export const getMyAffiliatedRentOrganizations = (params, isNext) => {
  return (dispatch, getState) => {
    return axios
      .get(Pathes.Statistics.rentSaleStatistics + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData =
            getState().organizationStore.myAffiliatedRentOrganizations;
          if (!isNext || !prevData) {
            dispatch(setMyAffiliatedRentOrganizations(data));
            return { data, success: true, message };
          }
          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(setMyAffiliatedRentOrganizations(updatedData));
          return { data: updatedData, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => ({ error: e.message, success: false }));
  };
};

// Get Organization Title By Id
export const getOrganizationTitle = (orgID) => {
  return (dispatch) => {
    return axios
      .get(Pathes.Organization.orgTitle(orgID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setOrgTitle(data));
          return { data, success: true, message };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(setOrgTitle(null));
        return { error: e.message, success: false };
      });
  };
};

// Check if user can create organization
export const checkUserLimits = () => {
  return (dispatch) => {
    return axios
      .get(Pathes.Organization.orgUserLimits)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setUserLimits(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch(() =>
        dispatch(
          setUserLimits({
            can_add_organization: false,
            is_delivery_service: false,
          })
        )
      );
  };
};

// Local action
export const setOrgClient = (client) => {
  return (dispatch) => dispatch({ type: SET_ORG_CLIENT, client });
};

// Get organization hotlinks
export const getOrgHotlinks = (params) => {
  return (dispatch) => {
    dispatch(getOrgHotlinksRequest());
    return axios
      .get(Pathes.Organization.hotlinks + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgHotlinksSuccess(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgHotlinksFailure(e)));
  };
};

// Get organization hotlink details
export const getOrgHotlinkDetails = (hotlinkID) => {
  return (dispatch) => {
    dispatch(getOrgHotlinkDetailsRequest());
    return axios
      .get(Pathes.Organization.hotlinkDetail(hotlinkID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgHotlinkDetailsSuccess(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgHotlinkDetailsFailure(e)));
  };
};

// Retrieve organization promo
export const getOrgPromotion = (orgID) => {
  return (dispatch) => {
    dispatch(getOrgPromotionRequest());
    return axios
      .get(Pathes.Organization.promotion(orgID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgPromotionSuccess(data));
          return { data, success: true, status };
        }
        if (status === 404) {
          dispatch(getOrgPromotionSuccess(null));
          return { data, success: false, status };
        }
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgPromotionFailure(e)));
  };
};

// Get list of subcategories in hotlink collections
export const getHotlinkCollectionSubcategories = (orgId) => {
  return (dispatch) => {
    dispatch(getOrgRequest());
    return axios
      .get(Pathes.Organization.get(orgId))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrgSuccess(data));
          return { data, success: true, message };
        }
        dispatch(push("/profile"));
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgFailure(e.message)));
  };
};

// Get list of shop items for organization
export const getOrgCollectionItems = (orgID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgCollectionItemsRequest());
    return axios
      .get(Pathes.Organization.collectionItems(orgID) + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        if (status === 200) {
          const prevData = getState().organizationStore.orgCollectionItems.data;
          if (!isNext || !prevData) {
            dispatch(getOrgCollectionItemsSuccess(data));
            return { data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgCollectionItemsSuccess(updatedData));
          return { data: updatedData, success: true };
        }

        throw new Error("Error fetch");
      })
      .catch((e) => dispatch(getOrgCollectionItemsFailure(e.message)));
  };
};

// Get list of subcategories for organization
export const getOrgCollectionSubcategories = (orgID, params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgCollectionSubcategoriesRequest());
    return axios
      .get(
        Pathes.Organization.collectionSubcategories(orgID) + getQuery(params)
      )
      .then((res) => {
        const { status, data } = res;
        if (status === 200) {
          const prevData =
            getState().organizationStore.orgCollectionSubcategories.data;
          if (!isNext || !prevData) {
            dispatch(getOrgCollectionSubcategoriesSuccess(data));
            return { data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgCollectionSubcategoriesSuccess(updatedData));
          return { data: updatedData, success: true };
        }

        throw new Error("Error fetch");
      })
      .catch((e) => dispatch(getOrgCollectionSubcategoriesFailure(e.message)));
  };
};

// Get selected subcategories in hotlink collection
export const getSelectedHotlinkCollectionSubcategories = (hotlinkID) => {
  return (dispatch) => {
    dispatch(setSelectedHotlinkCollectionSubcategories(null));
    return axios
      .get(Pathes.Organization.selectedCollectionSubcategories(hotlinkID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(setSelectedHotlinkCollectionSubcategories(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch(() => dispatch(setSelectedHotlinkCollectionSubcategories(null)));
  };
};

// Get shop items from hotlink collection
export const getSelectedHotlinkCollectionItems = (
  hotlinkID,
  params,
  isNext
) => {
  return (dispatch, getState) => {
    dispatch(getSelectedHotlinkCollectionItemsRequest());
    return axios
      .get(Pathes.Shop.selectedCollectionItems(hotlinkID) + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData =
            getState().organizationStore.hotlinkCollectionItems.data;
          if (!isNext || !prevData) {
            dispatch(getSelectedHotlinkCollectionItemsSuccess(data));
            return { data, success: true };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getSelectedHotlinkCollectionItemsSuccess(updatedData));
          return { data: updatedData, success: true };
        }

        throw new Error(message);
      })
      .catch((e) =>
        dispatch(getSelectedHotlinkCollectionItemsFailure(e.message))
      );
  };
};

export const getOrgShadowBanStatus = (orgID) => {
  return async (dispatch) => {
    try {
      dispatch(getOrgShadowBanStatusRequest());
      const response = await getOrgStatusDetail(orgID);
      dispatch(getOrgShadowBanStatusSuccess(response.data));
    } catch (e) {
      dispatch(getOrgShadowBanStatusFailure(e.message));
    }
  };
};

export const sendRemoveOrgFromShadowBan = (orgID) => {
  return async (dispatch) => {
    try {
      dispatch(sendRemoveOrgFromShadowBanRequest());
      await requestFromShadowBan(orgID);
      dispatch(sendRemoveOrgFromShadowBanSuccess());
    } catch (e) {
      dispatch(sendRemoveOrgFromShadowBanFailure(e.message));
    }
  };
};

export const sendRequestVerificationOrganization = (orgID, payload) => {
  return async (dispatch) => {
    try {
      dispatch(sendVerificationOrganizationRequest());
      await sendVerificationOrganization(orgID, payload);
      await dispatch(getOrganizationDetail(orgID));
      dispatch(sendVerificationOrganizationSuccess());
      Notify.success({
        text: translate(
          "Запрос на верификацию успешно отправлен",
          "notify.orgVerifiedSuccess"
        ),
      });
    } catch (e) {
      dispatch(sendVerificationOrganizationFailure(e.message));
    }
  };
};

export const getOrganizationPosts = (orgID, stateModifier = {}) => {
  return async (dispatch, getState) => {
    try {
      dispatch(
        getOrganizationPostsRequest({
          orgID, // ← ВАЖНО
          ...stateModifier,
        })
      );

      const postsState = getState().postsStore.organization;

      const params = {
        page: postsState.page,
        limit: postsState.limit,
        subcategories: postsState.subcategories,
        organization: orgID,
      };

      const result = await getOrgPostsList(params);

      if (result.success) {
        dispatch(
          getOrganizationPostsSuccess({
            orgID,
            hasMore: result.hasMore,
            posts:
              !postsState.posts || !postsState.isNext
                ? result.data
                : {
                    ...result.data,
                    list: [...postsState.posts.list, ...result.data.list],
                  },
          })
        );

        if (!postsState.isNext) {
          dispatch(
            setOrganizationCategoryCache({
              orgID,
              catID: postsState.subcategories || "all",
              posts: result.data,
            })
          );
        }
      } else {
        dispatch(
          getOrganizationPostsFailure({
            orgID,
            hasMore: false,
            error: result.error,
          })
        );
      }
    } catch (error) {
      dispatch(getOrganizationPostsFailure({ error: error.message }));
    }
  };
};

export const getOrganizationSubcategories = (orgID) => {
  return async (dispatch) => {
    try {
      dispatch(getOrganizationSubcategoriesRequest());

      const result = await getOrgSubcategories(orgID);

      if (result.success) {
        dispatch(getOrganizationSubcategoriesSuccess(result.data));
      } else {
        dispatch(getOrganizationSubcategoriesFailure(result.error));
      }
    } catch (e) {
      dispatch(getOrganizationSubcategoriesFailure(e.message));
    }
  };
};

export const getOrganizationSubcategoriesByPost = (postID) => {
  return (dispatch) => {
    dispatch(getOrganizationSubcategoriesByPostRequest());
    return axios
      .get(Pathes.Organization.getByPost(postID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getOrganizationSubcategoriesByPostSuccess(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => {
        Notify.error({ text: e.message });
        dispatch(getOrganizationSubcategoriesByPostFailure(null));
        return e;
      });
  };
};

export const sendRequestAcceptFollower = (orgID, userID) => {
  return async (dispatch) => {
    try {
      dispatch(acceptOrCancelFollowerRequest());
      await acceptRequestFollower(orgID, userID);
      dispatch(acceptOrCancelFollowerSuccess(userID));
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(acceptOrCancelFollowerFailure(e.message));
    }
  };
};

export const sendCancelRequestFollower = (orgID, userID) => {
  return async (dispatch) => {
    try {
      dispatch(acceptOrCancelFollowerRequest());
      await cancelRequestFollower(orgID, userID);
      dispatch(acceptOrCancelFollowerSuccess(userID));
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(acceptOrCancelFollowerFailure(e.message));
    }
  };
};

export const sendAllAcceptFollowers = (orgID) => {
  return async (dispatch) => {
    try {
      dispatch(sendAcceptAllFollowersRequest());
      await acceptAllFollowers(orgID);
      dispatch(sendAcceptAllFollowersSuccess());
    } catch (e) {
      Notify.error({
        text: "Что-то пошло не так с одобрением всех подписчиков",
      });
      dispatch(sendAcceptAllFollowersFailure(e.message));
    }
  };
};

export const getOrganizationFollowerDetails = (orgID, userID) => {
  return async (dispatch) => {
    try {
      dispatch(getOrganizationClientDetailsRequest());
      const { data } = await getFollowerDetails(orgID, userID);
      dispatch(getOrganizationClientDetailsSuccess(data));
    } catch (e) {
      Notify.error({ text: e.message });
      dispatch(getOrganizationClientDetailsFailure(e.message));
    }
  };
};

export const getOrganizationClientDetails = (orgID, userID) => {
  return async (dispatch) => {
    try {
      dispatch(getOrganizationClientDetailsRequest());
      const { data } = await getClientDetails(orgID, userID);
      dispatch(getOrganizationClientDetailsSuccess(data));
    } catch (e) {
      Notify.error({ text: e.message });
      dispatch(getOrganizationClientDetailsFailure(e.message));
    }
  };
};
