import {DEFAULT_LIMIT} from "../../common/constants";

export const INITIAL_STATE = {
  start: null,
  end: null,
  loading: true,
  hasMore: true,
  page: 1,
  limit: DEFAULT_LIMIT,
  showIntervalMenu: false,
}