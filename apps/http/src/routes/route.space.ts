import { Router } from "express";
import { userMiddleware } from "../middlewares/user";
import { createSpaceSchema } from "../types";
import client from "@repo/db/client";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = createSpaceSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      messege: "validation Failed",
    });
    return;
  }
  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimension.split("")[0]),
        height: parseInt(parsedData.data.dimension.split("x")[1]),
        creatorId: req.userId as string,
      },
    });
    res.json({ spaceId: space.id });
  }

  const map = await client.map.findUnique({
    where: {
      id: parsedData.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });

  if (!map) {
    res.status(400).json({
      messege: "map not found",
    });
    return;
  }

  let space = await client.$transaction(async () => {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId!,
      },
    });
    await client.spaceElements.createMany({
      data: map.mapElements.map((e) => ({
        spaceId: space.id,
        elementId: e.elementId,
        x: e.x!,
        y: e.y!,
      })),
    });
    return space;
  });
  res.json({ spaceId: space.id });
});

spaceRouter.delete("/:spaceId");

spaceRouter.get("/all");

spaceRouter.get("/:spaceId");
spaceRouter.post("/element");
spaceRouter.delete("/element");
