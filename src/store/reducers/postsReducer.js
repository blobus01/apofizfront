import {
  // ADD_ORGANIZATION_POST,
  GET_ORGANIZATION_POSTS,
  SET_ORGANIZATION_POSTS_STATE,
  CLEAR_ORGANIZATION_POSTS,
} from "../actionTypes/organizationTypes";
import { METADATA } from "@common/metadata";
import { UPDATE_POST_IN_CACHE } from "../actionTypes/postTypes";

const initialState = {
  organization: {
    ...METADATA.default,
    page: 1,
    limit: 16,
    subcategories: null,
    feedView: true,
    posts: null,
    hasMore: true,
    isNext: false,
    activeInstance: "page",
    currentOrgId: null,
    searchPosts: [],
  },
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ORGANIZATION_POSTS.REQUEST:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.request,
          ...action.payload,
          currentOrgId: action.payload.orgID, // ← ВОТ ОНО
        },
      };
    case GET_ORGANIZATION_POSTS.SUCCESS:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.success,
          ...action.payload,
          currentOrgId: action.payload.orgID, // ← ВОТ ОНО
        },
      };
    case GET_ORGANIZATION_POSTS.FAILURE:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...METADATA.error,
          ...action.payload,
        },
      };

    case SET_ORGANIZATION_POSTS_STATE:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...action.payload,
        },
      };

    case UPDATE_POST_IN_CACHE: {
      console.log("REDUCER: updating post", action.payload.postId);

      if (!state.organization.posts?.list) return state;

      const { postId, updates } = action.payload;

      // 1. Обновляем данные поста в списке
      const updatedList = state.organization.posts.list.map((p) =>
        p.id === postId ? { ...p, ...updates } : p,
      );

      // 2. Сортируем по строгим правилам
      const sortedList = [...updatedList].sort((a, b) => {
        // А) ПРИОРИТЕТ 1: ЗАКРЕПЫ (Pinned всегда выше Unpinned)
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        // Б) ПРИОРИТЕТ 2: ДАТА ОБНОВЛЕНИЯ (Внутри своих групп - самые свежие сверху)
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();

        return dateB - dateA;
      });

      return {
        ...state,
        organization: {
          ...state.organization,
          posts: {
            ...state.organization.posts,
            list: sortedList,
          },
        },
      };
    }

    case CLEAR_ORGANIZATION_POSTS:
      return {
        ...state,
        organization: {
          ...state.organization,
          posts: null,
          page: 1,
          searchPosts: [], // Очистить поиск тоже, если нужно
        },
      };
    case "ORG_SET_ACTIVE_INSTANCE":
      return {
        ...state,
        organization: {
          ...state.organization,
          activeInstance: action.payload,
        },
      };

    case "SET_ORG_SEARCH_POSTS":
      return {
        ...state,
        organization: {
          ...state.organization,
          searchPosts: action.payload,
        },
      };

    case "REPLACE_ORGANIZATION_POSTS":
      return {
        ...state,
        organization: {
          ...state.organization,
          posts: {
            ...state.organization.posts,
            list: action.payload.posts,
            total: action.payload.total ?? action.payload.posts.length,
          },
          page: 1,
          hasMore: false,
          isNext: false,
          activeInstance: "filter",
        },
      };

    // case ADD_ORGANIZATION_POST:
    //   if (!state.organization.posts?.list) return state;

    //   return {
    //     ...state,
    //     organization: {
    //       ...state.organization,
    //       posts: {
    //         ...state.organization.posts,
    //         // Добавляем новый пост (action.payload) в начало массива (...list)
    //         list: [action.payload, ...state.organization.posts.list],
    //         // Опционально: можно увеличить счетчик total, если он используется
    //         total: (state.organization.posts.total || 0) + 1,
    //       },
    //       // Если нужно добавить его и в searchPosts
    //       searchPosts: [action.payload, ...state.organization.searchPosts],
    //     },
    //   };

    default:
      return state;
  }
};

export default postsReducer;
