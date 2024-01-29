const { createHmac } = require("crypto");

module.exports = (publicKey, secretKey, ts) => {
  const timestamp = ts || new Date().toISOString();
  const hashVal = `${publicKey}:${timestamp}`;
  const hash = createHmac("sha256", secretKey).update(hashVal).digest("base64");
  const authToken = ts
    ? hash
    : Buffer.from(`${publicKey}:${hash}`).toString("base64");
  return { authToken, timestamp };
};
