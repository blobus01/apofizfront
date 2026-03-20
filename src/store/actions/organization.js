import api from "@/axios-api";

// Загрузка списка организаций
export const fetchOrganizations = (page = 1, limit = 10) => async (dispatch) => {
  dispatch({ type: "ORG_LIST_LOADING" });
  try {
    const res = await api.get("/organizations/", { params: { page, limit } });
    dispatch({ type: "ORG_LIST_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "ORG_LIST_ERROR", error: err });
  }
};

// Поиск организаций
export const searchOrganizations = (query) => async (dispatch) => {
  dispatch({ type: "ORG_SEARCH_LOADING" });
  try {
    const res = await api.get("/organizations/", { params: { search: query, page: 1, limit: 21 } });
    dispatch({ type: "ORG_SEARCH_SUCCESS", payload: res.data.list });
  } catch (err) {
    dispatch({ type: "ORG_SEARCH_ERROR", error: err });
  }
};

// Закрепление / открепление организации
export const togglePinnedOrg = (orgId) => async (dispatch, getState) => {
  const { pinnedOrgs } = getState().organization;
  const isPinned = pinnedOrgs[orgId];
  try {
    if (!isPinned) await api.post(`/api/v1/organizations/${orgId}/pinn/`);
    else await api.delete(`/api/v1/organizations/${orgId}/pinn/`);

    dispatch({ type: "ORG_TOGGLE_PIN", payload: orgId });
  } catch (err) {
    console.error(err);
  }
};

// Открытие/закрытие меню организации
export const setActiveOrg = (org) => ({ type: "ORG_SET_ACTIVE", payload: org });
