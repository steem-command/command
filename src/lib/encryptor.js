//http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/

"use strict";

const crypto = require("crypto");
const IV_LENGTH = 16; // For AES, this is always 16

// key must be 256 bytes (32 characters)

function keyer(key) {
  let dummy_text = "3tmDQBV%:a<_~fd9f4B^EU`F";
  let realLen = 32;
  let len = key.length;

  if (len < 8) throw new Error("Len must be atleast 8 charators long.");

  if (len === realLen) return key;

  let remLen = realLen - len;
  return dummy_text.substr(0, remLen) + key;
}

export const encrypt = function(text, key) {
  text = typeof text === "string" ? text : JSON.stringify(text);
  key = keyer(key);

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", new Buffer(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = function(text, key) {
  key = keyer(key);
  let textParts = text.split(":");
  let iv = new Buffer(textParts.shift(), "hex");
  let encryptedText = new Buffer(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", new Buffer(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
