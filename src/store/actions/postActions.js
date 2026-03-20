import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import { getQuery } from "@common/utils";
import { getMessage } from "@common/helpers";
import {
  BLOCK_COMMENTS_USER,
  CHANGE_POST_SUBCATEGORIES,
  CHANGE_POSTS_VIEW,
  CLEAR_CREATE_COMMENT_SUCCESS,
  CLEAR_REPLY_COMMENT,
  COMMENT_LIKE,
  CREATE_POST_COMMENT,
  DELETE_COMMENT,
  GET_CATEGORY_DETAIL,
  GET_ORG_POSTS_LIST,
  GET_POST_CATEGORIES,
  GET_POST_COMMENTS,
  GET_POST_DETAIL,
  GET_POST_SUBCATEGORIES,
  GET_POSTS,
  GET_POSTS_NON_EMPTY_CATEGORIES_SUCCESS,
  GET_TRANSLATION_POST,
  HIDE_COMMENT,
  HIDE_FROM_FEED,
  SET_COMMENTS,
  SET_EVENT_POST_SETTINGS_INITIAL_FORM_DATA,
  SET_POST_COMMENTS_THEME,
  SET_POST_DETAIL,
  SET_POSTS_MODIFIER,
  SET_REPLY_COMMENT,
  SET_RESUME_DETAIL_INFO_CACHE,
  SET_SELECTED_RESUME_SUBCATEGORIES,
  SET_SELECTED_SUBCATEGORY,
  SET_VIEWED_POST,
  UNBLOCK_COMMENTS_USER,
  UPDATE_COMMENT,
  UPDATE_POST_IN_CACHE,
} from "../actionTypes/postTypes";
import Notify from "../../components/Notification";
import {
  getCategoryDetail as fetchCategoryDetail,
  getNonEmptyCategories,
  getPostDetail,
  getPostsInFeed,
  postCommentCreate,
  postComments,
  sendCommentLike,
  sendDeleteComment,
} from "../services/postServices";
import { translateShopItem } from "../services/commonServices";
import { getChatMessages, postChatMessage } from "@store/services/aiServices";
// import { ADD_ORGANIZATION_POST } from "@store/actionTypes/organizationTypes";

export const getPostsRequest = (stateModifier) => ({
  type: GET_POSTS.REQUEST,
  payload: stateModifier,
});
const getPostsSuccess = (payload) => ({ type: GET_POSTS.SUCCESS, payload });
const getPostsFailure = (error) => ({ type: GET_POSTS.FAILURE, error });

const getPostRequest = () => ({ type: GET_POST_DETAIL.REQUEST });
const getPostSuccess = (postDetail) => ({
  type: GET_POST_DETAIL.SUCCESS,
  payload: postDetail,
});
const getPostFailure = (error) => ({ type: GET_POST_DETAIL.FAILURE, error });
export const setPostDetail = (postDetail) => ({
  type: SET_POST_DETAIL,
  payload: postDetail,
});

const getPostsNonEmptyCategoriesSuccess = (categories) => ({
  type: GET_POSTS_NON_EMPTY_CATEGORIES_SUCCESS,
  payload: categories,
});
export const setPostsModifier = (stateModifier) => ({
  type: SET_POSTS_MODIFIER,
  payload: stateModifier,
});

const getCategoryDetailRequest = () => ({ type: GET_CATEGORY_DETAIL.REQUEST });
const getCategoryDetailSuccess = (category) => ({
  type: GET_CATEGORY_DETAIL.SUCCESS,
  payload: category,
});
const getCategoryDetailFailure = (error) => ({
  type: GET_CATEGORY_DETAIL.FAILURE,
  error,
});

export const setSelectedSubcategory = (subcategory) => ({
  type: SET_SELECTED_SUBCATEGORY,
  payload: subcategory,
});
export const setViewedPost = (postId) => ({
  type: SET_VIEWED_POST,
  payload: postId,
});

export const updatePostInCache = (postId, updates) => ({
  type: UPDATE_POST_IN_CACHE,
  payload: { postId, updates },
});

//
const getPostCategoriesRequest = () => ({ type: GET_POST_CATEGORIES.REQUEST });
const getPostCategoriesSuccess = (payload) => ({
  type: GET_POST_CATEGORIES.SUCCESS,
  payload,
});
const getPostCategoriesFailure = (error) => ({
  type: GET_POST_CATEGORIES.FAILURE,
  error,
});

const getOrgPostsListRequest = () => ({ type: GET_ORG_POSTS_LIST.REQUEST });
const getOrgPostsListSuccess = (payload) => ({
  type: GET_ORG_POSTS_LIST.SUCCESS,
  payload,
});
const getOrgPostsListFailure = (error) => ({
  type: GET_ORG_POSTS_LIST.FAILURE,
  error,
});

const getPostSubCategoriesRequest = () => ({
  type: GET_POST_SUBCATEGORIES.REQUEST,
});
const getPostSubCategoriesSuccess = (payload) => ({
  type: GET_POST_SUBCATEGORIES.SUCCESS,
  payload,
});
const getPostSubCategoriesFailure = (error) => ({
  type: GET_POST_SUBCATEGORIES.FAILURE,
  error,
});

const getTranslatePostRequest = (id) => ({
  type: GET_TRANSLATION_POST.REQUEST,
  payload: id,
});
const getTranslatePostSuccess = (translate, id, code) => ({
  type: GET_TRANSLATION_POST.SUCCESS,
  payload: { translate, id, code },
});
const getTranslatePostFailure = (error) => ({
  type: GET_TRANSLATION_POST.FAILURE,
  payload: error,
});

export const getPostCommentsRequest = (payload) => ({
  type: GET_POST_COMMENTS.REQUEST,
  payload,
});
export const getPostCommentsSuccess = (payload) => ({
  type: GET_POST_COMMENTS.SUCCESS,
  payload,
});
export const getPostCommentsFailure = (error) => ({
  type: GET_POST_COMMENTS.FAILURE,
  payload: error,
});

const createPostCommentRequest = () => ({ type: CREATE_POST_COMMENT.REQUEST });
export const createPostCommentSuccess = (payload) => ({
  type: CREATE_POST_COMMENT.SUCCESS,
  payload,
});
const createPostCommentFailure = (error) => ({
  type: CREATE_POST_COMMENT.FAILURE,
  payload: error,
});

const commentLikeRequest = (commentID) => ({
  type: COMMENT_LIKE.REQUEST,
  payload: commentID,
});
const commentLikeSuccess = (commentID, updates) => ({
  type: COMMENT_LIKE.SUCCESS,
  payload: { commentID, updates },
});
const commentLikeFailure = (error) => ({
  type: COMMENT_LIKE.FAILURE,
  payload: error,
});

const deleteCommentRequest = (commentID) => ({
  type: DELETE_COMMENT.REQUEST,
  payload: commentID,
});
const deleteCommentSuccess = (commentID) => ({
  type: DELETE_COMMENT.SUCCESS,
  payload: commentID,
});
const deleteCommentFailure = (error) => ({
  type: DELETE_COMMENT.FAILURE,
  payload: error,
});

export const setReplyCurrentComment = (comment) => ({
  type: SET_REPLY_COMMENT,
  payload: comment,
});
export const clearReplyComment = () => ({ type: CLEAR_REPLY_COMMENT });
export const clearCreateCommentSuccess = () => ({
  type: CLEAR_CREATE_COMMENT_SUCCESS,
});

const changePostSubCategories = (data) => ({
  type: CHANGE_POST_SUBCATEGORIES,
  data,
});

export const changePostsView = (view) => ({
  type: CHANGE_POSTS_VIEW,
  payload: view,
});

export const hideFromFeed = (postID) => ({
  type: HIDE_FROM_FEED,
  payload: postID,
});

export const setComments = (payload) => ({ type: SET_COMMENTS, payload });

export const hideComment = (commentID) => ({
  type: HIDE_COMMENT,
  payload: commentID,
});

export const updateComment = (commentID, data) => ({
  type: UPDATE_COMMENT,
  payload: { commentID, data },
});

export const blockCommentsUser = (userID) => ({
  type: BLOCK_COMMENTS_USER,
  payload: userID,
});

export const unblockCommentsUser = (userID) => ({
  type: UNBLOCK_COMMENTS_USER,
  payload: userID,
});

export const setEventPostSettingsInitialFormData = (payload) => ({
  type: SET_EVENT_POST_SETTINGS_INITIAL_FORM_DATA,
  payload,
});

export const setResumeDetailInfoCache = (payload) => ({
  type: SET_RESUME_DETAIL_INFO_CACHE,
  payload,
});

export const setSelectedResumeSubcategories = (payload) => ({
  type: SET_SELECTED_RESUME_SUBCATEGORIES,
  payload,
});

export const setPostCommentsTheme = (payload) => ({
  type: SET_POST_COMMENTS_THEME,
  payload,
});

// Get posts
export const getPosts = (isNext, stateModifier = {}, extraParams = {}) => {
  return async (dispatch, getState) => {
    try {
      const { page: currentPage } = getState().postStore.posts;

      if (isNext) {
        stateModifier.page = currentPage + 1;
      }

      dispatch(getPostsRequest(stateModifier));
      const {
        country,
        city,
        limit,
        page,
        search,
        orderBy,
        startTime,
        selectedCategory,
        selectedSubcategories,
        currentTimestamp: newTimestamp,
      } = getState().postStore.posts;

      const params = {
        page,
        country,
        city,
        ordering: orderBy,
        limit,
        start_time: startTime,
        category: selectedCategory ? selectedCategory.id : null,
        subcategories: !!selectedSubcategories.length
          ? selectedSubcategories.map((item) => item.id).join(",")
          : null,
        search,
        current_timestamp_lt: newTimestamp,
      };

      const response = await getPostsInFeed({ ...params, ...extraParams });
      const hasMore = page < response.data.total_pages - 1;
      dispatch(getPostsSuccess({ data: response.data, isNext, hasMore }));
    } catch (e) {
      console.error("IN GET POSTS", e);
      dispatch(getPostsFailure(e));
    }
  };
};

export const getPost = (postID) => {
  return async (dispatch) => {
    try {
      dispatch(getPostRequest());
      const response = await getPostDetail(postID);

      if (response.success) {
        return dispatch(getPostSuccess(response.data));
      }

      throw new Error(response);
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(getPostFailure(e.message));
    }
  };
};

export const getCategoryDetail = (categoryId, country) => {
  return async (dispatch) => {
    try {
      dispatch(getCategoryDetailRequest());
      const response = await fetchCategoryDetail(categoryId, {
        country: country,
      });
      dispatch(getCategoryDetailSuccess(response.data));
    } catch (e) {
      dispatch(getCategoryDetailFailure(e));
    }
  };
};

export const getPostsNonEmptyCategories = (country) => {
  return async (dispatch) => {
    try {
      const response = await getNonEmptyCategories({ country });
      dispatch(getPostsNonEmptyCategoriesSuccess(response.data));
    } catch (e) {
      // that's all, folks!
    }
  };
};

// Get all categories list
export const getPostCategories = (params) => {
  return (dispatch) => {
    dispatch(getPostCategoriesRequest());
    return axios
      .get(Pathes.Shop.categories + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getPostCategoriesSuccess(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => {
        dispatch(getPostCategoriesFailure(e.message));
        return { success: false, message: e.message };
      });
  };
};

// Get all subcategories (including empty) in category
export const getPostSubCategories = (catID, params) => {
  return (dispatch) => {
    dispatch(getPostSubCategoriesRequest());
    return axios
      .get(Pathes.Shop.subCategories(catID) + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          dispatch(getPostSubCategoriesSuccess(data));
          return { data, success: true };
        }
        throw new Error(message);
      })
      .catch((e) => dispatch(getPostSubCategoriesFailure(e.message)));
  };
};

export const createPostSubCategory = (payload) => {
  return (dispatch, getState) => {
    return axios
      .post(Pathes.Product.subcategories, payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if ([200, 201].includes(status)) {
          const currentData = getState().postStore.postSubCategories.data;
          if (currentData) {
            dispatch(
              changePostSubCategories({
                ...currentData,
                subcategories: [...currentData.subcategories, res.data],
              }),
            );
          }
          return { data, success: true };
        }

        Notify.success({ text: "Не удалось создать категорию" });
        throw new Error(message);
      })
      .catch((e) => ({ message: e.message, success: false }));
  };
};

export const updatePostSubCategory = (subcategoryID, payload) => {
  return (dispatch, getState) => {
    return axios
      .put(Pathes.Product.subcategoryUpdate(subcategoryID), payload)
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const currentData = getState().postStore.postSubCategories.data;
          if (currentData) {
            dispatch(
              changePostSubCategories({
                ...currentData,
                subcategories: currentData.subcategories.map((item) =>
                  item.id === subcategoryID ? data : item,
                ),
              }),
            );
          }
          return { data, success: true };
        }

        Notify.success({ text: "Не удалось обновить категорию" });
        throw new Error(message);
      })
      .catch((e) => ({ message: e.message, success: false }));
  };
};

export const removePostSubCategory = (subcategoryID) => {
  return (dispatch, getState) => {
    return axios
      .delete(Pathes.Shop.subcategories(subcategoryID))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 204) {
          const currentData = getState().postStore.postSubCategories.data;
          if (currentData) {
            dispatch(
              changePostSubCategories({
                ...currentData,
                subcategories: currentData.subcategories.filter(
                  (item) => item.id !== subcategoryID,
                ),
              }),
            );
          }
          return { data, success: true };
        }

        Notify.success({ text: "Не удалось удалить категорию" });
        throw new Error(message);
      })
      .catch((e) => ({ message: e.message, success: false }));
  };
};

export const getOrgPostsList = (params, isNext) => {
  return (dispatch, getState) => {
    dispatch(getOrgPostsListRequest());
    return axios
      .get(Pathes.Shop.orgFeed + getQuery(params))
      .then((res) => {
        const { status, data } = res;
        const message = getMessage(data);
        if (status === 200) {
          const prevData = getState().postStore.orgPostsList.data;
          if (!isNext || !prevData) {
            dispatch(getOrgPostsListSuccess(data));
            return { ...data, success: true, message };
          }

          const updatedData = {
            total_count: data.total_count,
            total_pages: data.total_pages,
            list: [...prevData.list, ...data.list],
          };
          dispatch(getOrgPostsListSuccess(updatedData));
          return { ...updatedData, success: true, message };
        }

        Notify.info({ text: message });
        throw new Error(message);
      })
      .catch((e) => dispatch(getOrgPostsListFailure(e.message)));
  };
};

export const getTranslatePost = (title, description, code, id) => {
  return async (dispatch) => {
    try {
      dispatch(getTranslatePostRequest(id));
      const response = await translateShopItem(title, description, code);
      dispatch(getTranslatePostSuccess(response.data, id, code));
    } catch (e) {
      Notify.error({ text: "Ошибка в переводе" });
      dispatch(getTranslatePostFailure(e.message));
    }
  };
};

export const getComments = (
  id,
  { cancelToken, isRefresh = false, ...params },
  isNext,
  isChat = false,
  stateModifier = {},
) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getPostCommentsRequest(stateModifier));
      let { data } = isChat
        ? await getChatMessages(id, params, { cancelToken })
        : await postComments(id, params);
      const prevData = getState().postStore.postComments.data ?? {};

      if (isNext) {
        const filteredPrevData = prevData.list.filter((item) => {
          return !data.list.find((newItem) => newItem.id === item.id);
        });

        data = {
          ...prevData,
          ...data,
          list: [...filteredPrevData, ...data.list],
        };
      }

      if (isRefresh) {
        const filteredPrevData = prevData.list.filter((item) => {
          return !data.list.find((newItem) => newItem.id === item.id);
        });

        data = {
          ...prevData,
          ...data,
          list: prevData.list ? [...data.list, ...filteredPrevData] : data.list,
        };
      }

      dispatch(getPostCommentsSuccess(data));
    } catch (e) {
      if (e.message !== "canceled") {
        Notify.error({ text: "Что-то пошло не так" });
      }

      dispatch(getPostCommentsFailure(e.message));
    }
  };
};

export const createPostComment = (chatOrItemID, payload, isChat = false) => {
  return async (dispatch) => {
    try {
      dispatch(createPostCommentRequest());
      const response = isChat
        ? await postChatMessage(chatOrItemID, payload)
        : await postCommentCreate(chatOrItemID, payload);
      dispatch(createPostCommentSuccess(isChat ? null : response.data));
      dispatch(clearReplyComment());

      if (!isChat) {
        window.scroll({ top: 0 });
      }

      return response;
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(createPostCommentFailure(e.message));
    }
  };
};

export const commentLike = (commentID, isCommentLiked, commentLikeCount) => {
  return async (dispatch) => {
    try {
      dispatch(commentLikeRequest(commentID));
      await sendCommentLike(commentID, isCommentLiked);

      const commentUpdate = {
        comment_like_count: !isCommentLiked
          ? commentLikeCount + 1
          : commentLikeCount - 1,
        is_comment_liked: !isCommentLiked,
      };

      dispatch(commentLikeSuccess(commentID, commentUpdate));
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(commentLikeFailure(e.message));
    }
  };
};

export const deleteComment = (commentID, replyComment) => {
  return async (dispatch) => {
    try {
      dispatch(deleteCommentRequest(commentID));
      await sendDeleteComment(commentID);

      if (replyComment && commentID === replyComment.id) {
        dispatch(clearReplyComment());
      }

      dispatch(deleteCommentSuccess(commentID));
    } catch (e) {
      Notify.error({ text: "Что-то пошло не так" });
      dispatch(deleteCommentFailure(e.message));
    }
  };
};
