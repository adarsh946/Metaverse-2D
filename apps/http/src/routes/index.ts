import { Router } from "express";
import { userRouter } from "./route.user";
import { adminRouter } from "./route.admin";
import { spaceRouter } from "./route.space";
import client from "@repo/db/client";
import { signupSchema } from "../types";
import { hash, compare } from "../scrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  const request = req.body;
  const parsedData = signupSchema.safeParse(request);
  if (!parsedData.success) {
    res.status(400).json({
      messege: "Invalid Input Error",
    });
    return;
  }
  res.status(200).json({
    messege: "Signup",
  });

  const hashedPassword = await hash(parsedData.data.password);

  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });

    res.status(200).json({
      userId: user.id,
    });
  } catch (error) {
    res.status(400).json({
      message: "user already exists",
    });
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = signupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({ messege: "Validation Error" });
    return;
  }
  res.status(200).json({
    messege: "signIn",
  });

  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({
        messege: "user not found",
      });
      return;
    }

    const isValidPassword = await compare(
      parsedData.data.password,
      user?.password
    );

    if (!isValidPassword) {
      res.status(403).json({
        messege: "password is incorrect!",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_PASSWORD
    );

    res.status(200).json({
      token,
    });
  } catch (error) {
    res.status(403).json({
      messege: "unable to signIn",
    });
  }
});

router.get("/elements", async (req, res) => {
  const elements = await client.element.findMany();
  res.json({
    elements: elements.map((e) => ({
      id: e.id,
      imageUrl: e.imageURL,
      width: e.width,
      height: e.height,
      static: e.static,
    })),
  });
});

router.get("/avatars", async (req, res) => {
  const avatars = await client.avatar.findMany();
  res.json({
    avatars: avatars.map((e) => ({
      id: e.id,
      imageUrl: e.imageURL,
      name: e.name,
    })),
  });
});

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
