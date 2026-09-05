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

router.patch(
  "/assign-student",
  authGuard(Role.SUPER_ADMIN),
  ParentController.assignStudent,
);

router.patch(
  "/remove-student/:studentId",
  authGuard(Role.SUPER_ADMIN),
  ParentController.removeStudent,
);
router.get(
  "/full-access/:studentId",
  authGuard(Role.PARENT),
  ParentController.getFullStudentAccess,
);
export const ParentRoutes = router;
