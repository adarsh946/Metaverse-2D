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
      height: true
    },
  });

if (!map ){
    res.status(400).json(){
        messege: "map not found"
    }
}

let space = client.$transaction( async ()=> {
    const space = client.space.create({
        data:{
            name: parsedData.data.name,
            width: map.width,
            height: map.height,
            creatorId: req.userId !
        }
    })
})

});

spaceRouter.delete("/:spaceId");

spaceRouter.get("/all");

spaceRouter.get("/:spaceId");
spaceRouter.post("/element");
spaceRouter.delete("/element");
