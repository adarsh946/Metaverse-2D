import { Router } from "express";
import { userMiddleware } from "../middlewares/user";
import { updateMetadataSchema } from "../types";
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
userRouter.get("/metadata/bulk", userMiddleware, async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as String;
  const userIds = userIdString.slice(1, userIdString.length - 2).split(",");

  const metadata = await client.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });

  res.json({
    avatars: metadata.map((m) => ({
      avatarId: m.avatar?.imageURL,
      userId: m.id,
    })),
  });
});
