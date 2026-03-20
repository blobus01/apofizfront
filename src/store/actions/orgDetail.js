export const SET_ORG_DETAIL = "SET_ORG_DETAIL";
export const CLEAR_ORG_DETAIL = "CLEAR_ORG_DETAIL";

export const setOrgDetail = (payload) => {
  localStorage.setItem("org_detail", JSON.stringify(payload));

  return {
    type: SET_ORG_DETAIL,
    payload,
  };
};

export const clearOrgDetail = () => {
  localStorage.removeItem("org_detail");

  return {
    type: CLEAR_ORG_DETAIL,
  };
};
