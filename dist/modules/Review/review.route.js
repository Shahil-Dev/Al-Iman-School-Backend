"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const review_controller_1 = require("./review.controller");
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
// 1. Anyone (public) can see approved reviews
router.get('/public', review_controller_1.ReviewController.getPublicReviews);
// 2. Only PARENT can post a review
router.post('/', (0, authGuard_1.default)(client_1.Role.PARENT), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.createReviewValidationSchema), review_controller_1.ReviewController.createReview);
// 3. Only SUPER_ADMIN can approve/reject review
router.patch('/:id/approve', (0, authGuard_1.default)(client_1.Role.SUPER_ADMIN), (0, validateRequest_1.default)(review_validation_1.ReviewValidation.updateReviewStatusValidationSchema), review_controller_1.ReviewController.toggleReviewApproval);
exports.ReviewRoutes = router;
