import express from "express";
import { Role } from "@prisma/client";
import authGuard from "../../middlewares/authGuard";
import { ParentController } from "./parent.controller";

const router = express.Router();

// Public Route: Parent Self Registration
router.post("/register", ParentController.registerParent);

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

router.get(
  "/full-access/:studentId",
  authGuard(Role.PARENT),
  ParentController.getFullStudentAccess,
);

router.get("/", authGuard(Role.SUPER_ADMIN), ParentController.getAllParents);

router.get(
  "/:id",
  authGuard(Role.SUPER_ADMIN),
  ParentController.getSingleParent,
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

router.patch(
  "/:id",
  authGuard(Role.SUPER_ADMIN, Role.PARENT),
  ParentController.updateParentProfile,
);

export const ParentRoutes = router;