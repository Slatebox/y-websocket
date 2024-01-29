const { MongoClient } = require("mongodb");

let globalClient = null;

exports.closeMongoClient = () => {
  if (globalClient) {
    globalClient.close();
    globalClient = null;
    return true;
  }
  return false;
};

exports.getMongoClient = async () => {
  if (globalClient) {
    return globalClient;
  }
  const url = process.env.MONGO_URL || "";
  console.log("url is", url);
  const client = new MongoClient(url);
  let connectionAttempts = 0;
  async function ensureConnect() {
    try {
      await client.connect();
      if (!globalClient) {
        globalClient = client;
      }
    } catch (err) {
      console.error("Unable to connect to mongo, will try again in 100 ms", {
        err: err.message,
        url: url.split("@")[1],
        connectionAttempts,
      });
      connectionAttempts += 1;
      if (connectionAttempts < 3) {
        setTimeout(async () => {
          await ensureConnect();
        }, 100);
      } else {
        console.log("cannot connect to mongo, giving up.");
        throw err;
      }
    }
  }
  await ensureConnect();
  return client;
};
