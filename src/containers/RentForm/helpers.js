export const removeSecondsAndMilliseconds = (isoString) => {
  return isoString?.slice(0, 16);
};
