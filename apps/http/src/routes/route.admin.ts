import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin";
import {
  createAvatarSchema,
  createElementSchema,
  createMapSchema,
  updateElementSchema,
} from "../types";
import client from "@repo/db/client";

export const adminRouter = Router();
adminRouter.use(adminMiddleware);

adminRouter.post("/element", async (req, res) => {
  const parsedData = createElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "Validation Failed",
    });
    return;
  }

  await client.element.create({
    data: {
      imageURL: parsedData.data.imageUrl,
      width: parsedData.data.width,
      height: parsedData.data.height,
      static: parsedData.data.static,
    },
  });
  res.json({
    messege: "element Created",
  });
});
adminRouter.put("/element/:elementId", async (req, res) => {
  const parsedData = updateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "validation Failed",
    });
    return;
  }

  await client.element.update({
    where: {
      id: req.params.elementId,
    },
    data: {
      imageURL: parsedData.data.imageUrl,
    },
  });
  res.json({
    messege: "element updated",
  });
});
adminRouter.post("/avatar", async (req, res) => {
  const parsedData = createAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "Validation Failed",
    });
    return;
  }
  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageURL: parsedData.data.imageUrl,
    },
  });
  res.json({
    id: avatar.id,
  });
});
adminRouter.post("/map", async (req, res) => {
  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "Validation Failed",
    });
    return;
  }
  const map = await client.map.create({
    data: {
      thumbnail: parsedData.data.thumbnail,
      name: parsedData.data.name,
      width: parseInt(parsedData.data.dimension.split("x")[0]),
      height: parseInt(parsedData.data.dimension.split("x")[1]),
      mapElements: {
        create: parsedData.data.defaultElements.map((e) => ({
          elementId: e.elementId,
          x: e.x,
          y: e.y,
        })),
      },
    },
  });
  res.json({
    id: map.id,
  });
});
