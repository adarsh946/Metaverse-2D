import { Router } from "express";
import { userRouter } from "./route.user";
import { adminRouter } from "./route.admin";
import { spaceRouter } from "./route.space";

export const router = Router();

router.post("/signup");

router.post("/signin");

router.get("/elements");

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);
