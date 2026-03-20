import axios from "../../axios-api";
import Pathes from "../../common/pathes";
import { getMessage } from "../../common/helpers";
import Notify from "../../components/Notification";
import { getQuery } from "../../common/utils";
import { translate } from "../../locales/locales";

export const getPostDetail = async (id, refOrgID) => {
  try {
    let refOrganization = null;

    const postResponse = await axios.get(Pathes.Shop.postDetail(id));
    if (postResponse) {
      const { status, data } = postResponse;
      const message = getMessage(data);
      if (status === 200) {
        if (refOrgID && data.organization.id !== Number(refOrgID)) {
          const res = await axios.get(Pathes.Organization.orgTitle(refOrgID));
          if (res.status === 200) {
            refOrganization = {
              ...res.data,
              currency: postResponse.data.organization.currency,
            };
          }
        }
        return {
          success: true,
          message,
          data: {
            ...data,
            refOrganization,
          },
        };
      }
      return { message, success: false };
    }
    return { message: "Something went wrong", success: false };
  } catch (e) {
    return { message: "Something went wrong", success: false };
  }
};

export const createPost = (payload) => {
  return axios
    .post(Pathes.Shop.posts, payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200 || status === 201) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => {
      return { message: e.message, success: false };
    });
};

export const updatePost = (id, payload) => {
  return axios
    .put(Pathes.Shop.postDetail(id), payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => {
      return { message: e.message, success: false };
    });
};

export const deletePost = (id) => {
  return axios
    .delete(Pathes.Shop.postDetail(id))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 204) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => {
      return { message: e.message, success: false };
    });
};

export const togglePostLike = (item, is_liked) => {
  return axios
    .post(Pathes.Shop.likes, { item, is_liked })
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { value: is_liked, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const togglePostBookmark = (item, is_bookmarked) => {
  return axios
    .post(Pathes.Shop.bookmarks, { item, is_bookmarked })
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { value: is_bookmarked, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const deletePostsFromBookmarks = (items) => {
  return axios
    .post(Pathes.Shop.deleteBookmarks, { items })
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 204) {
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ error: e.message, success: false }));
};

export const togglePostPublishStatus = (payload) => {
  return axios
    .post(Pathes.Shop.publishStatus, payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true };
      }

      Notify.error({
        text: translate(
          "Не удалось обновить статус",
          "notify.updateStatusFailure"
        ),
      });
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const getSavedPosts = (params) => {
  return axios
    .get(Pathes.Shop.bookmarks + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const getLikedPosts = (params) => {
  return axios
    .get(Pathes.Shop.liked + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const getPostsInFeed = (params, excludedParams) => {
  return axios
    .get(Pathes.Shop.feed + getQuery(params, excludedParams))
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
    .catch((e) => ({ message: e.message, success: false }));
};

export const getNonEmptyCategories = (params) => {
  return axios
    .get(Pathes.Shop.nonEmptyCategories + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const getCategoryDetail = (categoryID, params) => {
  return axios
    .get(Pathes.Shop.categoryDetail(categoryID) + getQuery(params))
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 200) {
        return { data, success: true, message };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

// Get items of subscribed organizations
export const getSubscribedPosts = (params) => {
  return axios
    .get(Pathes.Shop.subscribedPosts + getQuery(params))
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
    .catch((e) => ({ message: e.message, success: false }));
};

// Complain about item
export const complainAboutPost = (payload) => {
  return axios
    .post(Pathes.Shop.postComplain, payload)
    .then((res) => {
      const { status, data } = res;
      const message = getMessage(data);
      if (status === 201) {
        Notify.success({ text: "Запрос отправлен" });
        return { data, success: true };
      }
      if (status === 400) {
        Notify.success({ text: "Вы уже отправили жалобу" });
        return { data, success: true };
      }
      throw new Error(message);
    })
    .catch((e) => ({ message: e.message, success: false }));
};

export const postComments = async (postID, params) => {
  const response = await axios.get(
    Pathes.Comments.postComments(postID) + getQuery(params)
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 200) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const postCommentCreate = async (postID, payload) => {
  const response = await axios.post(
    Pathes.Comments.postComments(postID),
    payload
  );

  const { status, data } = response;
  const message = getMessage(data);

  if (status === 201) {
    return { data, success: true, message };
  }

  throw new Error(message);
};

export const sendCommentLike = async (commentID, isLiked) => {
  const response = await axios.post(Pathes.Comments.commentLike, {
    comment: commentID,
    is_liked: !isLiked,
  });

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 200) {
    return { success: true, message };
  }

  throw new Error(message);
};

export const sendDeleteComment = async (commentID) => {
  const response = await axios.delete(Pathes.Comments.deleteComment(commentID));

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 200) {
    return { success: true, message };
  }

  throw new Error(message);
};

export const reportComment = async (commentID, reason) => {
  const response = await axios.post(Pathes.Comments.report, {
    comment: commentID,
    reason,
  });

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 201) {
    return { success: true, message };
  }

  throw new Error(message);
};

export const updateComment = async (commentID, payload) => {
  const response = await axios.put(
    Pathes.Comments.deleteComment(commentID),
    payload
  );

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 200) {
    return { success: true, message };
  }

  throw new Error(message);
};

export const toggleComments = async (postID, isDisabled) => {
  const response = await axios.post(Pathes.Comments.toggle, {
    item: postID,
    is_disabled: isDisabled,
  });

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 200) {
    return { success: true, message };
  }

  throw new Error(message);
};

/**
 * @param {Object=} payload
 * @param {('default'|'predefined')} payload.theme_type
 * @param {number | null} payload.theme_id
 */
export const changeCommentsTheme = async (payload) => {
  const response = await axios.post(Pathes.Comments.changeTheme, payload);

  const { status, data } = response;

  const message = getMessage(data);

  if (status === 200) {
    return { success: true, message };
  }

  throw new Error(message);
};
