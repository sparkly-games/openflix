import express from "express";
import { createRequestHandler } from "@react-router/express";

const app = express();

// 1. Serve static assets from the client build
app.use(express.static("build/client"));

// 2. Use a named parameter ":splat*" which Express 5 requires for wildcards
app.all(
  "/:splat*", 
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OpenFlix is live at http://localhost:${port}`);
});