import express from "express";
import client from "@repo/db/client";
import { router } from "./routes";

const app = express();

app.use("/api/v1", router);
app.use(express.json());

app.listen(process.env.PORT || 3000);
