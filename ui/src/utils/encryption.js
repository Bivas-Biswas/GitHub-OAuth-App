import libsodiumWrapper from "libsodium-wrappers";

export const utf8_to_b64 = (str) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

export const encryptSodium = async (value, key) => {
  await libsodiumWrapper.ready;
  const messageBytes = Buffer.from(value);
  const keyBytes = Buffer.from(key, "base64");

  // Encrypt using LibSodium.
  const encryptedBytes = libsodiumWrapper.crypto_box_seal(
    messageBytes,
    keyBytes
  );

  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString("base64");

  return encrypted;
};
