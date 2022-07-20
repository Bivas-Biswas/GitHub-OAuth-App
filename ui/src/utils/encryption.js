import libsodiumWrapper from "libsodium-wrappers";

export const encryption = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

export const encryptSodium = (value, key) => {
  const encryptedBytes = libsodiumWrapper.crypto_generichash(64, value, key);
  return Buffer.from(encryptedBytes).toString("base64");
};
