const initialState = {
  list: [],
  pinnedOrgs: {},
  searchResults: [],
  loading: false,
  loadingSearch: false,
  hasMore: true,
  page: 1,
  activeOrg: null,
};

export default function organizationReducer(state = initialState, action) {
  switch (action.type) {
    case "ORG_LIST_LOADING":
      return { ...state, loading: true };
    case "ORG_LIST_SUCCESS":
      return {
        ...state,
        loading: false,
        list: [...state.list, ...action.payload.list],
        hasMore: state.page < action.payload.total_pages,
      };
    case "ORG_LIST_ERROR":
      return { ...state, loading: false };
    case "ORG_SEARCH_LOADING":
      return { ...state, loadingSearch: true };
    case "ORG_SEARCH_SUCCESS":
      return { ...state, loadingSearch: false, searchResults: action.payload };
    case "ORG_SEARCH_ERROR":
      return { ...state, loadingSearch: false };
    case "ORG_TOGGLE_PIN":
      const orgId = action.payload;
      const isPinned = !state.pinnedOrgs[orgId];
      return {
        ...state,
        pinnedOrgs: { ...state.pinnedOrgs, [orgId]: isPinned },
        list: state.list.map((o) =>
          o.id === orgId ? { ...o, pinned: isPinned } : o
        ),
        searchResults: state.searchResults.map((o) =>
          o.id === orgId ? { ...o, pinned: isPinned } : o
        ),
      };
    case "ORG_SET_ACTIVE":
      return { ...state, activeOrg: action.payload };
    default:
      return state;
  }
}
