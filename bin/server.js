#!/usr/bin/env node

/**
 * @type {any}
 */
require("dotenv").config();
const WebSocket = require("ws");
const http = require("http");
const wss = new WebSocket.Server({ noServer: true });
const setupWSConnection = require("./utils.js").setupWSConnection;
const isAuthenticated = require("../src/auth/isAuthenticated.js");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 1122;

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("SB Websocket Server Is Rocking");
});

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  // See https://github.com/websockets/ws#client-authentication
  /**
   * @param {any} ws
   */
  const handleAuth = async (ws) => {
    try {
      await isAuthenticated(request);
      // if no exception, then it is valid
      wss.emit("connection", ws, request);
    } catch (err) {
      console.error("unable to auth", err);
      ws.send("Unauthenticated");
    }
  };
  wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
