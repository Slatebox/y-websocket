const { subtle, getRandomValues } = require("crypto");

module.exports = async (plaintext, key) => {
  // create a random 96-bit initialization vector (IV)
  const iv = getRandomValues(new Uint8Array(12));

  // encode the text you want to encrypt
  const encodedPlaintext = new TextEncoder().encode(plaintext);

  console.log("key is", Buffer.from(key, "base64"));

  // prepare the secret key for encryption
  const secretKey = await subtle.importKey(
    "raw",
    Buffer.from(key, "base64"),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // encrypt the text with the secret key
  const ciphertext = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    secretKey,
    encodedPlaintext
  );

  // return the encrypted text "ciphertext" and the IV
  // encoded in base64
  return {
    cipherText: Buffer.from(ciphertext).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
};
