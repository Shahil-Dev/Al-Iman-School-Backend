"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineController = void 0;
const routine_service_1 = require("./routine.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const createRoutineSlot = (0, catchAsync_1.default)(async (req, res) => {
    const result = await routine_service_1.RoutineService.createRoutineSlotInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Routine slot created successfully!",
        data: result,
    });
});
const getClassRoutine = (0, catchAsync_1.default)(async (req, res) => {
    const { classId, sectionId } = req.params;
    const result = await routine_service_1.RoutineService.getClassRoutineFromDB(classId, sectionId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Class routine retrieved successfully!",
        data: result,
    });
});
exports.RoutineController = {
    createRoutineSlot,
    getClassRoutine,
};
