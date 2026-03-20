import { METADATA } from "@common/metadata";
import {
  ACCEPT_ALL_FOLLOWERS,
  ACCEPT_OR_CANCEL_FOLLOWER,
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
  SUBSCRIBE_ORGANIZATION,
} from "../actions/actionTypes";
import {
  GET_ORG_FOLLOWERS,
  GET_ORG_PROMOTIONS,
  GET_ORG_SHADOW_BAN_STATUS,
  GET_ORGANIZATION_CLIENT_DETAILS,
  GET_ORGANIZATION_SUBCATEGORIES,
  SEND_REMOVE_ORG_FROM_SHADOW_BAN,
  SEND_VERIFICATION_ORGANIZATION,
  CLEAR_ORG_CLIENT_DETAILS,
  SET_CLOSE_ORG_SHADOW_BAN,
  SET_ORG_CLIENT,
  SET_ORG_TITLE,
  SET_MY_PURCHASES_ORGANIZATIONS,
  SET_MY_AFFILIATED_ORGANIZATION,
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

const initialState = {
  orgTypes: { ...METADATA.default, data: null },
  orgSubTypes: { ...METADATA.default, data: null },
  orgList: { ...METADATA.default, data: null },
  orgDetail: { ...METADATA.default, data: null },
  cardBackgrounds: { ...METADATA.default, data: null },
  orgFollowers: { ...METADATA.default, data: null },
  orgHotlinks: { ...METADATA.default, data: null },
  orgHotlinkDetails: { ...METADATA.default, data: null },
  orgPromotion: { ...METADATA.default, data: null },
  orgPromotions: { ...METADATA.default, data: null },
  orgCollectionItems: { ...METADATA.default, data: null },
  orgCollectionSubcategories: { ...METADATA.default, data: null },
  hotlinkCollectionItems: { ...METADATA.default, data: null },
  orgShadowBanStatus: { ...METADATA.default, data: null },
  removeOrgFromShadowBan: {
    ...METADATA.default,
    isOpenModal: false,
    isSuccess: false,
  },
  orgVerification: { ...METADATA.default },
  hotlinkCollectionSubcategories: null,
  userLimits: { can_add_organization: false, is_delivery_service: false },
  orgClient: null,
  orgTitle: null,
  orgUserDidTransactions: null,
  orgUserHasTransactionsAsSeller: null,
  myRentPurchasesOrganizations: null,
  myAffiliatedRentOrganizations: null,
  orgSubcategories: { ...METADATA.default, data: null },
  orgAcceptOrCancelFollower: { ...METADATA.default, currentUser: null },
  orgClientDetails: { ...METADATA.default, data: null },
  orgCache: {},
  orgCreationInitialData: null,
};

const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORG_TITLE:
      return { ...state, orgTitle: action.payload };
    case SET_MY_PURCHASES_ORGANIZATIONS:
      return { ...state, orgUserDidTransactions: action.payload };
    case SET_MY_AFFILIATED_ORGANIZATION:
      return { ...state, orgUserHasTransactionsAsSeller: action.payload };
    case SET_MY_RENT_PURCHASES_ORGANIZATIONS:
      return { ...state, myRentPurchasesOrganizations: action.payload };
    case SET_MY_AFFILIATED_RENT_ORGANIZATIONS:
      return { ...state, myAffiliatedRentOrganizations: action.payload };

    case GET_ORG_TYPES.REQUEST:
      return { ...state, orgTypes: { ...state.orgTypes, ...METADATA.request } };
    case GET_ORG_TYPES.SUCCESS:
      return {
        ...state,
        orgTypes: {
          ...state.orgTypes,
          ...METADATA.success,
          data: action.types,
        },
      };
    case GET_ORG_TYPES.FAILURE:
      return { ...state, orgTypes: { ...state.orgTypes, ...METADATA.error } };
    case GET_ORG_COLLECTION_SUBCATEGORIES.REQUEST:
      return {
        ...state,
        orgCollectionSubcategories: {
          ...state.orgCollectionSubcategories,
          ...METADATA.request,
        },
      };
    case GET_ORG_COLLECTION_SUBCATEGORIES.SUCCESS:
      return {
        ...state,
        orgCollectionSubcategories: {
          ...state.orgCollectionSubcategories,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_COLLECTION_SUBCATEGORIES.FAILURE:
      return {
        ...state,
        orgCollectionSubcategories: {
          ...state.orgCollectionSubcategories,
          ...METADATA.error,
          data: null,
        },
      };
    case GET_ORG_SUB_TYPES.REQUEST:
      return {
        ...state,
        orgSubTypes: { ...state.orgSubTypes, ...METADATA.request },
      };
    case GET_ORG_SUB_TYPES.SUCCESS:
      return {
        ...state,
        orgSubTypes: { ...METADATA.success, data: action.types },
      };
    case GET_ORG_SUB_TYPES.FAILURE:
      return {
        ...state,
        orgSubTypes: { ...state.orgSubTypes, ...METADATA.error },
      };
    case GET_ORG.REQUEST:
      return {
        ...state,
        orgDetail: { ...state.orgDetail, ...METADATA.request },
      };
    case GET_ORG.SUCCESS:
      return {
        ...state,
        orgDetail: {
          ...state.orgDetail,
          ...METADATA.success,
          data: action.detail,
        },
      };
    case GET_ORG.FAILURE:
      return {
        ...state,
        orgDetail: { ...state.orgDetail, ...METADATA.error, data: null },
      };
    case GET_ORG_LIST.REQUEST:
      return { ...state, orgList: { ...state.orgList, ...METADATA.request } };
    case GET_ORG_LIST.SUCCESS:
      return {
        ...state,
        orgList: { ...state.orgList, ...METADATA.success, data: action.list },
      };
    case GET_ORG_LIST.FAILURE:
      return { ...state, orgList: { ...state.orgList, ...METADATA.error } };
    case GET_CARD_BACKGROUNDS.REQUEST:
      return {
        ...state,
        cardBackgrounds: { ...state.cardBackgrounds, ...METADATA.request },
      };
    case GET_CARD_BACKGROUNDS.SUCCESS:
      return {
        ...state,
        cardBackgrounds: {
          ...state.cardBackgrounds,
          ...METADATA.success,
          data: action.backgrounds,
        },
      };
    case GET_CARD_BACKGROUNDS.FAILURE:
      return {
        ...state,
        cardBackgrounds: { ...state.cardBackgrounds, ...METADATA.error },
      };
    case SUBSCRIBE_ORGANIZATION:
      return {
        ...state,
        orgDetail: { ...state.orgDetail, data: action.organization },
      };
    case GET_ORG_FOLLOWERS.REQUEST:
      return {
        ...state,
        orgFollowers: { ...state.orgFollowers, ...METADATA.request },
      };
    case GET_ORG_FOLLOWERS.SUCCESS:
      return {
        ...state,
        orgFollowers: { ...METADATA.success, data: action.payload },
      };
    case GET_ORG_FOLLOWERS.FAILURE:
      return {
        ...state,
        orgFollowers: {
          ...state.orgFollowers,
          ...METADATA.error,
          error: action.error,
        },
      };
    case GET_ORG_HOTLINKS.REQUEST:
      return {
        ...state,
        orgHotlinks: { ...state.orgHotlinks, ...METADATA.request, data: null },
      };
    case GET_ORG_HOTLINKS.SUCCESS:
      return {
        ...state,
        orgHotlinks: {
          ...state.orgHotlinks,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_HOTLINKS.FAILURE:
      return {
        ...state,
        orgHotlinks: { ...state.orgHotlinks, ...METADATA.error },
      };
    case GET_ORG_HOTLINK_DETAILS.REQUEST:
      return {
        ...state,
        orgHotlinkDetails: { ...state.orgHotlinkDetails, ...METADATA.request },
      };
    case GET_ORG_HOTLINK_DETAILS.SUCCESS:
      return {
        ...state,
        orgHotlinkDetails: {
          ...state.orgHotlinkDetails,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_HOTLINK_DETAILS.FAILURE:
      return {
        ...state,
        orgHotlinkDetails: { ...state.orgHotlinkDetails, ...METADATA.error },
      };
    case SET_ORGANIZATION_DETAIL:
      return { ...state, orgDetail: { ...state.orgDetail, ...action.payload } };
    case SET_ORG_CLIENT:
      return { ...state, orgClient: action.client };
    case SET_USER_LIMITS:
      return { ...state, userLimits: action.value };
    case GET_ORG_PROMOTION.REQUEST:
      return {
        ...state,
        orgPromotion: { ...state.orgPromotion, ...METADATA.request },
      };
    case GET_ORG_PROMOTION.SUCCESS:
      return {
        ...state,
        orgPromotion: {
          ...state.orgPromotion,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_PROMOTION.FAILURE:
      return {
        ...state,
        orgPromotion: { ...state.orgPromotion, ...METADATA.error, data: null },
      };
    case GET_ORG_PROMOTIONS.REQUEST:
      return {
        ...state,
        orgPromotions: { ...state.orgPromotions, ...METADATA.request },
      };
    case GET_ORG_PROMOTIONS.SUCCESS:
      return {
        ...state,
        orgPromotions: { ...METADATA.success, data: action.payload },
      };
    case GET_ORG_PROMOTIONS.FAILURE:
      return {
        ...state,
        orgPromotions: {
          ...state.orgPromotions,
          ...METADATA.error,
          error: action.error,
        },
      };
    case GET_ORG_COLLECTION_ITEMS.REQUEST:
      return {
        ...state,
        orgCollectionItems: {
          ...state.orgCollectionItems,
          ...METADATA.request,
        },
      };
    case GET_ORG_COLLECTION_ITEMS.SUCCESS:
      return {
        ...state,
        orgCollectionItems: {
          ...state.orgCollectionItems,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_COLLECTION_ITEMS.FAILURE:
      return {
        ...state,
        orgCollectionItems: {
          ...state.orgCollectionItems,
          ...METADATA.error,
          data: null,
        },
      };
    case GET_SELECTED_HOTLINK_COLLECTION_ITEMS.REQUEST:
      return {
        ...state,
        hotlinkCollectionItems: {
          ...state.hotlinkCollectionItems,
          ...METADATA.request,
        },
      };
    case GET_SELECTED_HOTLINK_COLLECTION_ITEMS.SUCCESS:
      return {
        ...state,
        hotlinkCollectionItems: {
          ...state.hotlinkCollectionItems,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_SELECTED_HOTLINK_COLLECTION_ITEMS.FAILURE:
      return {
        ...state,
        hotlinkCollectionItems: {
          ...state.hotlinkCollectionItems,
          ...METADATA.error,
          data: null,
          error: action.error,
        },
      };
    case SET_SELECTED_HOTLINK_COLLECTION_SUBCATEGORIES:
      return { ...state, hotlinkCollectionSubcategories: action.payload };
    case GET_ORG_SHADOW_BAN_STATUS.REQUEST:
      return {
        ...state,
        orgShadowBanStatus: {
          ...state.orgShadowBanStatus,
          ...METADATA.request,
        },
      };
    case GET_ORG_SHADOW_BAN_STATUS.SUCCESS:
      return {
        ...state,
        orgShadowBanStatus: {
          ...state.orgShadowBanStatus,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORG_SHADOW_BAN_STATUS.FAILURE:
      return {
        ...state,
        orgShadowBanStatus: {
          ...state.orgShadowBanStatus,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case SEND_REMOVE_ORG_FROM_SHADOW_BAN.REQUEST:
      return {
        ...state,
        removeOrgFromShadowBan: {
          ...state.removeOrgFromShadowBan,
          ...METADATA.request,
        },
      };
    case SEND_REMOVE_ORG_FROM_SHADOW_BAN.SUCCESS:
      return {
        ...state,
        removeOrgFromShadowBan: {
          ...state.removeOrgFromShadowBan,
          ...METADATA.success,
          isOpenModal: true,
          isSuccess: true,
        },
      };
    case SEND_REMOVE_ORG_FROM_SHADOW_BAN.FAILURE:
      return {
        ...state,
        removeOrgFromShadowBan: {
          ...state.removeOrgFromShadowBan,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case SET_CLOSE_ORG_SHADOW_BAN:
      return {
        ...state,
        orgShadowBanStatus: { ...state.orgShadowBanStatus, data: null },
        removeOrgFromShadowBan: {
          ...state.removeOrgFromShadowBan,
          isOpenModal: false,
        },
      };
    case SEND_VERIFICATION_ORGANIZATION.REQUEST:
      return {
        ...state,
        orgVerification: { ...state.orgVerification, ...METADATA.request },
      };
    case SEND_VERIFICATION_ORGANIZATION.SUCCESS:
      return {
        ...state,
        orgVerification: { ...state.orgVerification, ...METADATA.success },
      };
    case SEND_VERIFICATION_ORGANIZATION.FAILURE:
      return {
        ...state,
        orgVerification: {
          ...state.orgVerification,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case GET_ORGANIZATION_SUBCATEGORIES.REQUEST:
      return {
        ...state,
        orgSubcategories: { ...state.orgSubcategories, ...METADATA.request },
      };
    case GET_ORGANIZATION_SUBCATEGORIES.SUCCESS:
      return {
        ...state,
        orgSubcategories: {
          ...state.orgSubcategories,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORGANIZATION_SUBCATEGORIES.FAILURE:
      return {
        ...state,
        orgSubcategories: {
          ...state.orgSubcategories,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case GET_ORGANIZATION_SUBCATEGORIES_BY_POST.REQUEST:
      return {
        ...state,
        orgSubcategories: { ...state.orgSubcategories, ...METADATA.request },
      };
    case GET_ORGANIZATION_SUBCATEGORIES_BY_POST.SUCCESS:
      return {
        ...state,
        orgSubcategories: {
          ...state.orgSubcategories,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORGANIZATION_SUBCATEGORIES_BY_POST.FAILURE:
      return {
        ...state,
        orgSubcategories: {
          ...state.orgSubcategories,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case ACCEPT_OR_CANCEL_FOLLOWER.REQUEST:
      return {
        ...state,
        orgAcceptOrCancelFollower: {
          ...state.orgAcceptOrCancelFollower,
          ...METADATA.request,
        },
      };
    case ACCEPT_OR_CANCEL_FOLLOWER.SUCCESS:
      return {
        ...state,
        orgAcceptOrCancelFollower: {
          ...state.orgAcceptOrCancelFollower,
          ...METADATA.success,
          currentUser: action.payload,
        },
      };
    case ACCEPT_OR_CANCEL_FOLLOWER.FAILURE:
      return {
        ...state,
        orgAcceptOrCancelFollower: {
          ...state.orgAcceptOrCancelFollower,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case ACCEPT_ALL_FOLLOWERS.REQUEST:
      return { ...state, orgAcceptAllFollowers: { ...METADATA.request } };
    case ACCEPT_ALL_FOLLOWERS.SUCCESS:
      return { ...state, orgAcceptAllFollowers: { ...METADATA.success } };
    case ACCEPT_ALL_FOLLOWERS.FAILURE:
      return {
        ...state,
        orgAcceptAllFollowers: { ...METADATA.error, error: action.payload },
      };
    case GET_ORGANIZATION_CLIENT_DETAILS.REQUEST:
      return {
        ...state,
        orgClientDetails: { ...state.orgClientDetails, ...METADATA.request },
      };
    case GET_ORGANIZATION_CLIENT_DETAILS.SUCCESS:
      return {
        ...state,
        orgClientDetails: {
          ...state.orgClientDetails,
          ...METADATA.success,
          data: action.payload,
        },
      };
    case GET_ORGANIZATION_CLIENT_DETAILS.FAILURE:
      return {
        ...state,
        orgClientDetails: {
          ...state.orgClientDetails,
          ...METADATA.error,
          error: action.payload,
        },
      };
    case SET_ORG_CLIENT_DETAILS:
      return {
        ...state,
        orgClientDetails: {
          ...state.orgClientDetails,
          data: state.orgClientDetails.data
            ? {
                ...state.orgClientDetails.data,
                ...action.payload,
              }
            : null,
        },
      };
    case CLEAR_ORG_CLIENT_DETAILS: {
      return {
        ...state,
        orgClientDetails: {
          ...state.orgClientDetails,
          ...METADATA.default,
          data: null,
        },
      };
    }
    case SET_ORGANIZATION_CATEGORY_CACHE:
      return {
        ...state,
        orgCache: {
          ...state.orgCache,
          [action.payload.orgID]: {
            ...state.orgCache[action.payload.orgID],
            [action.payload.catID]: action.payload.posts,
          },
        },
      };
    case CLEAR_ORGANIZATION_CATEGORY_CACHE:
      return { ...state, orgCache: {} };

    case SET_ORGANIZATION_CREATION_INITIAL_DATA:
      return { ...state, orgCreationInitialData: action.payload };
    case GET_SELECTED_HOTLINK_COLLECTION_ITEMS.CLEAR:
      return {
        ...state,
        hotlinkCollectionItems: { ...METADATA.default, data: null },
      };

    default:
      return state;
  }
};

export default organizationReducer;
