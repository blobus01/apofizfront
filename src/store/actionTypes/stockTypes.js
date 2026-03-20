import { createActionTypes } from '../../common/helpers';

export const GET_STOCK_DETAIL = createActionTypes('GET_STOCK_DETAIL');
export const DELETE_STOCK_DETAIL = createActionTypes('DELETE_STOCK_DETAIL');

export const GET_CRITERIA = createActionTypes('GET_CRITERIA');
export const GET_FORMAT = createActionTypes('GET_FORMAT');
export const GET_FORMAT_SIZES = createActionTypes('GET_FORMAT_SIZES');
export const ADD_AVAILABLE_SIZES = createActionTypes('ADD_AVAILABLE_SIZES');

export const GET_AVAILABLE_SIZES = createActionTypes('AVAILABLE_SIZES');
export const SET_AVAILABLE_SIZES = 'SET_AVAILABLE_SIZES';

export const GET_STOCK_SETS_COUNT = createActionTypes('GET_STOCK_SETS_COUNT');

export const GET_ITEM_LINK_SET = createActionTypes('GET_ITEM_LINK_SET');
export const GET_ITEM_BY_LINK = createActionTypes('GET_ITEM_BY_LINK');
export const SET_ITEM_LINKS = 'SET_ITEM_LINK_SET';
export const ADD_PRODUCT_LINKS = createActionTypes('ADD_PRODUCT_LINKS');
export const ADD_ITEM_LINK_LOCALLY = 'ADD_ITEM_LINK_LOCALLY';
export const REMOVE_ITEM_LINK_LOCALLY = 'REMOVE_ITEM_LINK_LOCALLY';
export const ADD_SHOP_LINK_ITEMS_SET = createActionTypes('ADD_SHOP_LINK_ITEMS_SET');

export const ADD_RELATED_POSTS = createActionTypes('ADD_RELATED_POSTS');

// related products
export const GET_RELATED_POSTS = createActionTypes('GET_RELATED_PRODUCTS');
export const GET_SELECTED_POSTS = createActionTypes('GET_SELECTED_POSTS');
export const TOGGLE_SELECTED_POST = 'TOGGLE_SELECTED_POST'
export const SET_ORGANIZATION = 'SET_ORGANIZATION';
export const SORT_POSTS = 'SORT_POSTS';
export const SET_ORGANIZATION_CATEGORY_CACHE = 'SET_ORGANIZATION_CATEGORY_CACHE';

// size count
export const GET_SIZE_COUNTS = createActionTypes('GET_SIZE_COUNTS');
export const UPDATE_SIZE_COUNT = createActionTypes('UPDATE_SIZE_COUNT');
export const DELETE_SIZE_COUNT = createActionTypes('DELETE_SIZE_COUNT');
export const GET_NOT_CHOSEN_SIZES = createActionTypes('GET_NOT_CHOSEN_SIZES');

// selection
export const GET_SELECTION = createActionTypes('GET_SELECTION');
