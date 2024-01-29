const url = require("url");
const createHmacAuthToken = require("./createHmacAuthToken");
const { getMongoClient, closeMongoClient } = require("./getMongoClient");
const decrypt = require("./decrypt");
const encrypt = require("./encrypt");

module.exports = async (request) => {
  // extract token
  const params = url.parse(request.url, true);
  const decodedBase64Bearer = Buffer.from(params.query.bearer, "base64")
    ?.toString()
    ?.split(":");
  if (decodedBase64Bearer.length !== 2) {
    throw new Error(
      `Bearer token is not correctly base64 encoded. Decoded, the value should be publicKey:hash`
    );
  }
  const publicKey = decodedBase64Bearer?.[0];
  const sentHash = decodedBase64Bearer?.[1];
  const timestamp = params.query.timestamp;

  if (!timestamp) {
    throw new Error(
      `You must always included a current timestamp in the request`
    );
  }

  // only do internal key for slatebox org
  const internalKeys = JSON.parse(process.env.API_KEYS);
  let org = internalKeys.find(
    (i) => i.publicKey === publicKey && i.name === "slatebox"
  );
  let orgs = null;
  let client = null;

  if (!org) {
    client = await getMongoClient();
    if (!client) {
      throw new Error(`Unable to connect to mongo`);
    }
    const db = client.db("slatebox");
    orgs = db.collection("organizations");
    org = await orgs.findOne({ publicKey });
  }

  if (!org) {
    throw new Error(`No org available with public key ${publicKey}`);
  }

  const secretKey = client
    ? await decrypt(
        org.secretKey.cipherText,
        org.secretKey.iv,
        process.env.API_GEN_KEY
      )
    : org.secretKey;

  const recreateToken = createHmacAuthToken(publicKey, secretKey, timestamp);
  const isAuthenticated = sentHash === recreateToken.authToken;

  if (isAuthenticated) {
    console.log("is authenticated!", org?.name);
    if (client) {
      // reencrypt the secretKey to gen a new cipher
      const enc = await encrypt(secretKey, process.env.API_GEN_KEY);
      // save off new cipher
      await orgs.updateOne({ _id: org._id }, { $set: { secretKey: enc } });
      // closeMongoClient();
    }

    return true;
  }

  throw new Error(`Not authenticated`);
};
