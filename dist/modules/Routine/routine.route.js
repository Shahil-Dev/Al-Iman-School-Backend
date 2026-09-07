"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const routine_controller_1 = require("./routine.controller");
const router = express_1.default.Router();
router.post("/create-slot", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER), routine_controller_1.RoutineController.createRoutineSlot);
router.get("/:classId/:sectionId", (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.TEACHER, client_1.Role.STUDENT), routine_controller_1.RoutineController.getClassRoutine);
exports.RoutineRoutes = router;
