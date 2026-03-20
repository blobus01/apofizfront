import { METADATA } from "@common/metadata";
import produce from "immer";
import {
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
  HIDE_FROM_FEED,
  HIDE_COMMENT,
  SET_POSTS_MODIFIER,
  SET_REPLY_COMMENT,
  SET_SELECTED_SUBCATEGORY,
  SET_VIEWED_POST,
  UPDATE_POST_IN_CACHE,
  BLOCK_COMMENTS_USER,
  UNBLOCK_COMMENTS_USER,
  SET_EVENT_POST_SETTINGS_INITIAL_FORM_DATA,
  SET_RESUME_DETAIL_INFO_CACHE,
  SET_SELECTED_RESUME_SUBCATEGORIES,
  UPDATE_COMMENT,
  SET_POST_DETAIL,
  SET_POST_COMMENTS_THEME,
  SET_COMMENTS,
  CLEAR_POST_COMMENTS,
} from "../actionTypes/postTypes";
import { DEFAULT_LIMIT, POSTS_VIEWS } from "@common/constants";
import { ORDERING_OPTIONS } from "@components/CategoryFilterView";
import { CLEAR_TRANSLATE_ITEMS } from "../actions/actionTypes";

const initialState = {
  postDetail: { ...METADATA.default, data: null },
  postCategories: { ...METADATA.default, data: null },
  postSubCategories: { ...METADATA.default, data: null },
  orgPostsList: { ...METADATA.default, data: null },
  translatePosts: {
    ...METADATA.default,
    currentTranslatePost: null,
    data: null,
  },
  postComments: { ...METADATA.default, data: null, hasMore: true, theme: null },
  createComment: { ...METADATA.default, success: false },
  commentLike: { ...METADATA.default, currentCommentID: null },
  deleteComment: { ...METADATA.default, currentCommentID: null },
  posts: {
    ...METADATA.default,
    data: null,
    country: null,
    city: null,
    page: 1,
    limit: DEFAULT_LIMIT,
    currentTimestamp: null,
    startTime: null,
    selectedSubcategories: [],
    orderBy: ORDERING_OPTIONS[0].value,
    categories: [],
    selectedCategory: null,
    showLayer: null,
    hasMore: true,
    showSearch: false,
    search: "",
    view: POSTS_VIEWS.FEED,
  },
  replyCurrentComment: null,
  viewedPost: null,
  eventPostSettingsInitialFormData: null,
  resumeDetailInfoCache: null,
  selectedResumeSubcategories: [],
  postsCache: {},
};

const postReducer = (state = initialState, action) =>
  produce(state, (state) => {
    switch (action.type) {
      case GET_POSTS.REQUEST:
        return {
          ...state,
          posts: { ...state.posts, ...METADATA.request, ...action.payload },
        };
      case GET_POSTS.SUCCESS:
        return {
          ...state,
          posts: {
            ...state.posts,
            ...METADATA.success,
            hasMore: action.payload.hasMore,
            data: action.payload.isNext
              ? {
                  ...action.payload.data,
                  list: [...state.posts.data.list, ...action.payload.data.list],
                }
              : action.payload.data,
          },
        };
      case GET_POSTS.FAILURE:
        return {
          ...state,
          posts: { ...state.posts, ...METADATA.error, hasMore: false },
        };
      case GET_POSTS_NON_EMPTY_CATEGORIES_SUCCESS:
        return {
          ...state,
          posts: { ...state.posts, categories: action.payload },
        };
      case SET_POSTS_MODIFIER:
        return { ...state, posts: { ...state.posts, ...action.payload } };
      case GET_CATEGORY_DETAIL.SUCCESS:
        return {
          ...state,
          posts: { ...state.posts, selectedCategory: action.payload },
        };
      case SET_SELECTED_SUBCATEGORY:
        const hasSelectedSubcategory = state.posts.selectedSubcategories.find(
          (s) => s.id === action.payload.id
        );
        return {
          ...state,
          posts: {
            ...state.posts,
            selectedSubcategories: hasSelectedSubcategory
              ? state.posts.selectedSubcategories.filter(
                  (s) => s.id !== action.payload.id
                )
              : [...state.posts.selectedSubcategories, action.payload],
          },
        };
      case SET_VIEWED_POST:
        return { ...state, viewedPost: action.payload };
        
      case UPDATE_POST_IN_CACHE: {
        const { postId, updates } = action.payload;

        // 1. Вспомогательная функция для замены данных в элементе (без сортировки)
        const updateItem = (list) =>
          list
            ? list.map((p) => (p.id === postId ? { ...p, ...updates } : p))
            : [];

        // 2. Функция для обновления и сортировки (для главной ленты)
        const updateAndSort = (list) => {
          if (!list) return [];
          const updated = updateItem(list);
          return [...updated].sort((a, b) => {
            // Важно: если даты нет, ставим 0, чтобы не было ошибок
            const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return dateB - dateA; // Свежие сверху
          });
        };

        return {
          ...state,

          // ОБНОВЛЯЕМ КЭШ (для деталей поста)
          postsCache: {
            ...state.postsCache,
            [postId]: {
              ...(state.postsCache[postId] || {}),
              ...updates,
            },
          },

          // ОБНОВЛЯЕМ ГЛАВНУЮ ЛЕНТУ (с прыжком вверх)
          posts: {
            ...state.posts,
            data: state.posts.data
              ? {
                  ...state.posts.data,
                  list: updateAndSort(state.posts.data.list),
                }
              : state.posts.data,
          },

          // ОБНОВЛЯЕМ СПИСОК ОРГАНИЗАЦИИ (внутри postStore, если есть)
          // Здесь обычно сортировка не нужна, если она управляется другим редьюсером,
          // но обновить данные нужно.
          orgPostsList: {
            ...state.orgPostsList,
            data: state.orgPostsList.data
              ? {
                  ...state.orgPostsList.data,
                  list: updateItem(state.orgPostsList.data.list),
                }
              : state.orgPostsList.data,
          },

          // ОБНОВЛЯЕМ ДЕТАЛЬНУЮ СТРАНИЦУ (если она открыта)
          postDetail: {
            ...state.postDetail,
            data:
              state.postDetail.data && state.postDetail.data.id === postId
                ? { ...state.postDetail.data, ...updates }
                : state.postDetail.data,
          },
        };
      }

      case GET_POST_DETAIL.REQUEST:
        return {
          ...state,
          postDetail: { ...state.postDetail, ...METADATA.request },
        };
      case GET_POST_DETAIL.SUCCESS:
        return {
          ...state,
          postDetail: { ...METADATA.success, data: action.payload },
        };
      case GET_POST_DETAIL.FAILURE:
        return {
          ...state,
          postDetail: {
            ...state.postDetail,
            ...METADATA.error,
            error: action.error,
            data: null,
          },
        };
      case SET_POST_DETAIL:
        return {
          ...state,
          postDetail: {
            ...state.postDetail,
            data: state.postDetail.data
              ? { ...state.postDetail.data, ...action.payload }
              : action.payload,
          },
        };
      case GET_POST_CATEGORIES.REQUEST:
        return {
          ...state,
          postCategories: { ...state.postCategories, ...METADATA.request },
        };
      case GET_POST_CATEGORIES.SUCCESS:
        return {
          ...state,
          postCategories: { ...METADATA.success, data: action.payload },
        };
      case GET_POST_CATEGORIES.FAILURE:
        return {
          ...state,
          postCategories: {
            ...state.postCategories,
            ...METADATA.error,
            error: action.error,
            data: null,
          },
        };
      case GET_POST_SUBCATEGORIES.REQUEST:
        return {
          ...state,
          postSubCategories: {
            ...state.postSubCategories,
            ...METADATA.request,
          },
        };
      case GET_POST_SUBCATEGORIES.SUCCESS:
        return {
          ...state,
          postSubCategories: { ...METADATA.success, data: action.payload },
        };
      case GET_POST_SUBCATEGORIES.FAILURE:
        return {
          ...state,
          postSubCategories: {
            ...state.postSubCategories,
            ...METADATA.error,
            error: action.error,
            data: null,
          },
        };
      case GET_ORG_POSTS_LIST.REQUEST:
        return {
          ...state,
          orgPostsList: { ...state.orgPostsList, ...METADATA.request },
        };
      case GET_ORG_POSTS_LIST.SUCCESS:
        return {
          ...state,
          orgPostsList: { ...METADATA.success, data: action.payload },
        };
      case GET_ORG_POSTS_LIST.FAILURE:
        return {
          ...state,
          orgPostsList: {
            ...state.orgPostsList,
            ...METADATA.error,
            error: action.error,
            data: null,
          },
        };
      case CHANGE_POST_SUBCATEGORIES:
        return {
          ...state,
          postSubCategories: { ...METADATA.success, data: action.data },
        };
      case GET_TRANSLATION_POST.REQUEST:
        return {
          ...state,
          translatePosts: {
            ...state.translatePosts,
            ...METADATA.request,
            currentTranslatePost: action.payload,
          },
        };
      case GET_TRANSLATION_POST.SUCCESS:
        return {
          ...state,
          translatePosts: {
            ...METADATA.success,
            currentTranslatePost: null,
            data: {
              ...state.translatePosts.data,
              [action.payload.id]: {
                translate: action.payload.translate,
                currentCode: action.payload.code,
              },
            },
          },
        };
      case GET_TRANSLATION_POST.FAILURE:
        return {
          ...state,
          translatePosts: {
            ...state.translatePosts,
            ...METADATA.error,
            currentTranslatePost: null,
            error: action.payload,
          },
        };

      case GET_POST_COMMENTS.REQUEST:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            ...METADATA.request,
            ...action.payload,
          },
        };
      case GET_POST_COMMENTS.SUCCESS:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            ...METADATA.success,
            data: action.payload,
          },
        };

      case GET_POST_COMMENTS.FAILURE:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            ...METADATA.error,
            error: action.payload,
          },
        };
      case CREATE_POST_COMMENT.REQUEST: {
        return {
          ...state,
          createComment: {
            ...state.createComment,
            success: false,
            ...METADATA.request,
          },
        };
      }
      case CREATE_POST_COMMENT.SUCCESS: {
        const exists =
          action.payload &&
          state.postComments.data.list.some(
            (comment) => comment.id === action.payload.id
          );
        return {
          ...state,
          createComment: {
            ...state.createComment,
            success: true,
            ...METADATA.success,
          },
          postComments: {
            ...state.postComments,
            data: {
              ...state.postComments.data,
              list:
                action.payload && !exists
                  ? [action.payload, ...state.postComments.data.list]
                  : state.postComments.data.list,
            },
          },
        };
      }
      case CREATE_POST_COMMENT.FAILURE: {
        return {
          ...state,
          createComment: { ...state.createComment, ...METADATA.error },
        };
      }
      case SET_COMMENTS:
        state.postComments.data = state.postComments.data
          ? { ...state.postComments.data, ...action.payload }
          : action.payload;
        return state;
      case HIDE_COMMENT:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            data: state.postComments.data && {
              ...state.postComments.data,
              list: state.postComments.data.list.filter(
                (comment) => comment.id !== action.payload
              ),
            },
          },
        };
      case UPDATE_COMMENT:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            data: state.postComments.data && {
              ...state.postComments.data,
              list: state.postComments.data.list.map((comment) => {
                if (comment.id === action.payload.commentID) {
                  return {
                    ...comment,
                    ...action.payload.data,
                  };
                }
                return comment;
              }),
            },
          },
        };
      case BLOCK_COMMENTS_USER:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            data: state.postComments.data && {
              ...state.postComments.data,
              list: state.postComments.data.list.map((comment) =>
                comment.user?.id === action.payload
                  ? { ...comment, is_blocked: true }
                  : comment
              ),
            },
          },
        };
      case UNBLOCK_COMMENTS_USER:
        return {
          ...state,
          postComments: {
            ...state.postComments,
            data: state.postComments.data && {
              ...state.postComments.data,
              list: state.postComments.data.list.map((comment) =>
                comment.user?.id === action.payload
                  ? { ...comment, is_blocked: false }
                  : comment
              ),
            },
          },
        };
      case COMMENT_LIKE.REQUEST:
        return {
          ...state,
          commentLike: {
            ...state.commentLike,
            currentCommentID: action.payload,
            ...METADATA.request,
          },
        };
      case COMMENT_LIKE.SUCCESS:
        return {
          ...state,
          commentLike: {
            ...state.commentLike,
            currentCommentID: null,
            ...METADATA.success,
          },
          postComments: {
            ...state.postComments,
            data: {
              ...state.postComments.data,
              list: state.postComments.data.list.map((comment) => {
                if (comment.id === action.payload.commentID) {
                  return { ...comment, ...action.payload.updates };
                }

                return comment;
              }),
            },
          },
        };
      case COMMENT_LIKE.FAILURE:
        return {
          ...state,
          commentLike: {
            ...state.commentLike,
            currentCommentID: null,
            ...METADATA.error,
            error: action.payload,
          },
        };
      case DELETE_COMMENT.REQUEST:
        return {
          ...state,
          deleteComment: {
            ...state.deleteComment,
            currentCommentID: action.payload,
            ...METADATA.request,
          },
        };
      case DELETE_COMMENT.SUCCESS:
        return {
          ...state,
          deleteComment: {
            ...state.deleteComment,
            currentCommentID: null,
            ...METADATA.success,
          },
          postComments: {
            ...state.postComments,
            data: {
              ...state.postComments.data,
              list: state.postComments.data.list.filter((comment) => {
                if (comment.parent && comment.parent.id === action.payload) {
                  comment.parent = null;
                  return comment;
                }

                return comment.id !== action.payload;
              }),
            },
          },
        };
      case SET_POST_COMMENTS_THEME:
        if (state.postComments.data?.wallpapers) {
          state.postComments.data.wallpapers.theme_id = action.payload;
        }
        return state;
      case DELETE_COMMENT.FAILURE:
        return {
          ...state,
          deleteComment: {
            ...state.deleteComment,
            currentCommentID: null,
            ...METADATA.error,
            error: action.payload,
          },
        };
      case SET_REPLY_COMMENT:
        return { ...state, replyCurrentComment: action.payload };
      case CLEAR_REPLY_COMMENT:
        return { ...state, replyCurrentComment: null };
      case CLEAR_CREATE_COMMENT_SUCCESS:
        return {
          ...state,
          createComment: { ...state.createComment, success: false },
        };

      case CLEAR_TRANSLATE_ITEMS:
        return {
          ...state,
          translatePosts: { ...state.translatePosts, data: {} },
        };
      case CHANGE_POSTS_VIEW:
        return { ...state, posts: { ...state.posts, view: action.payload } };
      case HIDE_FROM_FEED:
        return {
          ...state,
          posts: {
            ...state.posts,
            data: state.posts.data && {
              ...state.posts.data,
              list: state.posts.data.list.filter(
                (p) => p.id !== action.payload
              ),
            },
          },
        };

      case SET_EVENT_POST_SETTINGS_INITIAL_FORM_DATA:
        return {
          ...state,
          eventPostSettingsInitialFormData: action.payload,
        };
      case SET_RESUME_DETAIL_INFO_CACHE:
        return {
          ...state,
          resumeDetailInfoCache: action.payload,
        };
      case SET_SELECTED_RESUME_SUBCATEGORIES:
        return {
          ...state,
          selectedResumeSubcategories: action.payload,
        };
      default:
        return state;
    }
  });

export default postReducer;
