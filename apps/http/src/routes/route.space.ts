import { Router } from "express";
import { userMiddleware } from "../middlewares/user";
import {
  addElementSchema,
  createSpaceSchema,
  deleteElementSchema,
} from "../types";
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

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    select: {
      creatorId: true,
    },
  });

  if (space?.creatorId !== req.userId) {
    res.status(400).json({
      messege: "Unauthorised",
    });
  }

  await client.space.delete({
    where: {
      id: req.params.spaceId,
    },
  });
  res.json({
    messege: "space deleted",
  });
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId,
    },
  });
  res.json({
    spaces: spaces.map((s) => ({
      name: s.name,
      id: s.id,
      thumbnail: s.thumbnail,
      dimensions: `${s.width}* ${s.height}`,
    })),
  });
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    include: {
      spaceElements: {
        include: {
          elements: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({
      messege: "space not found",
    });
    return;
  }
  res.json({
    dimensions: `${space.width}* ${space.height}`,
    spaceElements: space.spaceElements.map((e) => ({
      id: e.id,
      element: {
        id: e.elements.id,
        width: e.elements.width,
        height: e.elements.height,
        static: e.elements.static,
        imageUrl: e.elements.imageURL,
      },
      x: e.x,
      y: e.y,
    })),
  });
});
spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = addElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "validation Failed",
    });
    return;
  }

  const space = await client.space.findUnique({
    where: {
      id: req.body.spaceId,
      creatorId: req.userId!,
    },
    select: {
      width: true,
      height: true,
    },
  });

  if (
    req.body.x < 0 ||
    req.body.y < 0 ||
    req.body.x > space?.width! ||
    req.body.y > space?.height!
  ) {
    res.status(400).json({
      messege: "point is outside of the boundary",
    });
  }
  if (!space) {
    res.status(403).json({
      messege: "space not found",
    });
  }

  await client.spaceElements.create({
    data: {
      spaceId: req.body.spaceId,
      elementId: req.body.elementId,
      x: req.body,
      y: req.body,
    },
  });
  res.json({
    messege: "Elements added",
  });
});
spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedData = deleteElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "Validation Failed",
    });
    return;
  }
  const spaceElement = await client.spaceElements.findFirst({
    where: {
      id: parsedData.data.id,
    },
    include: {
      spaces: true,
    },
  });
  console.log(spaceElement?.spaces);

  if (
    !spaceElement?.spaces.creatorId ||
    spaceElement.spaces.creatorId !== req.userId
  ) {
    res.status(400).json({
      messege: "Unauthorised User",
    });
    return;
  }

  await client.spaceElements.delete({
    where: {
      id: parsedData.data.id,
    },
  });
  res.json({
    messege: "element deleted",
  });
});
