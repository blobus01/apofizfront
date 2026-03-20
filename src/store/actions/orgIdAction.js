// ACTION TYPES
export const SET_ORGANIZATION_ID = "SET_ORGANIZATION_ID";
export const CLEAR_ORGANIZATION_ID = "CLEAR_ORGANIZATION_ID";

// ACTIONS
export const setOrganizationId = (id) => ({
  type: SET_ORGANIZATION_ID,
  payload: id,
});

export const clearOrganizationId = () => ({
  type: CLEAR_ORGANIZATION_ID,
});
