"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
router.get("/analytics", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), admin_controller_1.AdminController.getDashboardAnalytics);
router.get("/due-report", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), admin_controller_1.AdminController.getStudentDueReport);
router.patch("/reset-password", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), admin_controller_1.AdminController.resetUserPassword);
exports.AdminRoutes = router;
