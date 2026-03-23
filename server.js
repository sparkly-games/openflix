import express from "express";
import { createRequestHandler } from "@react-router/express";

const app = express();

// Serve static assets from the client build
app.use(express.static("build/client"));

// The "all" route needs a slightly different syntax in Express 5
app.all(
  "(.*)", // Changed from "*" to "(.*)" to satisfy the new path-to-regexp rules
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OpenFlix is live at http://localhost:${port}`);
});