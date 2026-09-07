"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const parent_controller_1 = require("./parent.controller");
const router = express_1.default.Router();
router.get("/my-children", (0, authGuard_1.default)(client_1.Role.PARENT), parent_controller_1.ParentController.getMyChildren);
router.get("/child-overview/:studentId", (0, authGuard_1.default)(client_1.Role.PARENT), parent_controller_1.ParentController.getChildOverview);
router.patch("/assign-student", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), parent_controller_1.ParentController.assignStudent);
router.patch("/remove-student/:studentId", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), parent_controller_1.ParentController.removeStudent);
router.get("/full-access/:studentId", (0, authGuard_1.default)(client_1.Role.PARENT), parent_controller_1.ParentController.getFullStudentAccess);
exports.ParentRoutes = router;
