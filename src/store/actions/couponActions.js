export const setSelectedCoupon = (coupon) => ({
    type: "SET_SELECTED_COUPON",
    payload: coupon,
});

export const clearSelectedCoupon = () => ({
    type: "CLEAR_SELECTED_COUPON",
});
