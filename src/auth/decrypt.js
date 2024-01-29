const crypto = require("crypto");

module.exports = async (ciphertext, iv, key) => {
  // prepare the secret key
  const secretKey = await crypto.subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // decrypt the encrypted text "ciphertext" with the secret key and IV
  const cleartext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(iv, "base64"),
    },
    secretKey,
    Buffer.from(ciphertext, "base64")
  );

  // decode the text and return it
  return new TextDecoder().decode(cleartext);
};
