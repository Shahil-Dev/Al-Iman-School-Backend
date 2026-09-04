import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { ParentController } from "./parent.controller";

const router = express.Router();

router.get(
  "/my-children",
  authGuard(Role.PARENT),
  ParentController.getMyChildren,
);

router.get(
  "/child-overview/:studentId",
  authGuard(Role.PARENT),
  ParentController.getChildOverview,
);

export const ParentRoutes = router;
