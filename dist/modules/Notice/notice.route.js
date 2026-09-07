"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const notice_controller_1 = require("./notice.controller");
const router = express_1.default.Router();
router.post('/', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), notice_controller_1.NoticeController.createNotice);
router.get('/', notice_controller_1.NoticeController.getAllNotices);
router.delete('/:id', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), notice_controller_1.NoticeController.deleteNotice);
exports.NoticeRoutes = router;
