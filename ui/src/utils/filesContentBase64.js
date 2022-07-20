import { utf8_to_b64 } from "./index";

export const filesContentBase64 = (files) => {
  return files.map((file) => ({
    path: file.path,
    content: utf8_to_b64(file.content),
  }));
};
