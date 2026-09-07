"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const document_controller_1 = require("./document.controller");
const router = express_1.default.Router();
router.get('/id_card/:studentId', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS, client_1.Role.STUDENT), document_controller_1.DocumentController.getStudentIdCard);
router.get('/testimonial/:studentId', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ACCOUNTS), document_controller_1.DocumentController.getTestimonial);
exports.DocumentRoutes = router;
