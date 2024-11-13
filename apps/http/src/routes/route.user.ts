import { Router } from "express";
import { userMiddleware } from "../middlewares/user";
import { updateElementSchema, updateMetadataSchema } from "../types";
import client from "@repo/db/client";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = updateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({
      messege: "validation failed",
    });
    return;
  }

  await client.user.update({
    where: {
      id: req.userId,
    },
    data: {
      avatarId: parsedData.data.avatarId,
    },
  });
  res.json({
    messege: "metadata updated",
  });
});
userRouter.get("/metadata/bulk");
