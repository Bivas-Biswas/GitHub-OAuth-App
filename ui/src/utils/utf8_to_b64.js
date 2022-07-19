export const utf8_to_b64 = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};
