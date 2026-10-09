import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { RoutineController } from "./routine.controller";

const router = express.Router();

// 1. Create Routine Slot
router.post(
  "/create-slot",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  RoutineController.createRoutineSlot
);

// 2. Fetch Class Routine Slot
router.get(
  "/:classId/:sectionId",
  authGuard(
    Role.SUPER_ADMIN,
    Role.ACCOUNTS,
    Role.TEACHER,
    Role.STUDENT,
    Role.PARENT
  ),
  RoutineController.getClassRoutine
);

// 3. Update Routine Slot Route (Fixed path collision)
router.patch(
  "/slot/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  RoutineController.updateRoutineSlot
);

// 4. Delete Routine Slot Route (Fixed path collision)
router.delete(
  "/slot/:id",
  authGuard(Role.SUPER_ADMIN, Role.ACCOUNTS, Role.TEACHER),
  RoutineController.deleteRoutineSlot
);

export const RoutineRoutes = router;