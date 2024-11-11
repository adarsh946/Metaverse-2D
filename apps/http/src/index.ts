import express from "express";
const app = express();
import client from "@repo/db/client";

app.use("/api/v1");

app.listen(process.env.PORT || 3000);
