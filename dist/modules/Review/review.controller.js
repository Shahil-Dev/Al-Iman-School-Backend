"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("./review.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const createReview = (0, catchAsync_1.default)(async (req, res) => {
    // req.user contains decoded JWT token payload
    const userId = req.user.id;
    const result = await review_service_1.ReviewService.createReviewIntoDB(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Review submitted successfully! Pending admin approval.",
        data: result,
    });
});
const getPublicReviews = (0, catchAsync_1.default)(async (req, res) => {
    const result = await review_service_1.ReviewService.getPublicReviewsFromDB();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Public reviews retrieved successfully!",
        data: result,
    });
});
const toggleReviewApproval = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;
    const result = await review_service_1.ReviewService.toggleReviewApprovalInDB(id, isApproved);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Review ${isApproved ? "approved" : "unapproved"} successfully!`,
        data: result,
    });
});
exports.ReviewController = {
    createReview,
    getPublicReviews,
    toggleReviewApproval,
};
