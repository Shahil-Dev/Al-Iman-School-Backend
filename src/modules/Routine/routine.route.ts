import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { RoutineController } from "./routine.controller";

const router = express.Router();

router.post(
  "/create-slot",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS),
  RoutineController.createRoutineSlot,
);

router.get(
  "/:classId/:sectionId",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER, Role.STUDENT),
  RoutineController.getClassRoutine,
);

export const RoutineRoutes = router;
