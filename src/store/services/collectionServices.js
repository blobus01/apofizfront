import Pathes from "../../common/pathes";
import {getMessage} from "../../common/helpers";
import axiosApi from "../../axios-api";
import {getQuery} from "../../common/utils";

export const getCollections = queryParams => {
  return axiosApi.get(Pathes.Collections.collections + getQuery(queryParams))
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}))
}

export const getCollection = id => {
  return axiosApi.get(Pathes.Collections.collectionDetailUpdate(id))
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}))
}

export const createCollection = async params => {
  return axiosApi.post(Pathes.Collections.collections, params)
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}));
}

export const updateCollection = async (id, data) => {
  return axiosApi.put(Pathes.Collections.collectionDetailUpdate(id), data)
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}))
}

export const deleteCollection = async id => {
  return axiosApi.delete(Pathes.Collections.collectionDetailUpdate(id))
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 204) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}))
}

export const addToCollection = async (collectionID, postID) => {
  return axiosApi.post(Pathes.Collections.collectionDetail(collectionID), {
    items: postID,
    is_bookmarked: true
  })
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}));
}

export const removeFromCollection = async (collectionID, postID) => {
  return axiosApi.post(Pathes.Collections.collectionDetail(collectionID), {
    items: postID,
    is_bookmarked: false
  })
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({error: e.message, success: false}));
}

export const getCollectionItems =  async (id, queryParams) => {
  return axiosApi.get(Pathes.Collections.collectionDetail(id) + getQuery(queryParams))
    .then(res => {
      const {status, data} = res;
      const message = getMessage(data)
      if (status === 200) {
        return {data, success: true}
      }
      throw new Error(message)
    })
    .catch(e => ({message: e.message, success: false}))
}