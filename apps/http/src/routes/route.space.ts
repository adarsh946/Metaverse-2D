import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.post("/");

spaceRouter.delete("/:spaceId");

spaceRouter.get("/all");

spaceRouter.get("/:spaceId");
spaceRouter.post("/element");
spaceRouter.delete("/element");
