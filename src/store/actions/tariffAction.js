export const setTariffStatus = (data) => ({
  type: "SET_TARIFF_STATUS",
  payload: data,
});

export const clearTariffStatus = () => ({
  type: "CLEAR_TARIFF_STATUS",
});
