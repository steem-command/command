export const isAlphanumeric = chars => {
  return (
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(
      chars
    ) > -1
  );
};

export const isBadgeWorthy = chars => {
  return chars.match(/^[a-z0-9]+$/i) !== null;
};

export const notEmptyObject = data => {
  if (!data) return null;
  return typeof data === "object" && Object.keys(data).length;
};

export const notEmptyArray = data => {
  if (!data) return null;
  return Array.isArray(data) && data.length;
};
