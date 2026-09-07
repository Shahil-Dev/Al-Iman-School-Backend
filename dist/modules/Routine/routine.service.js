"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createRoutineSlotInDB = async (payload) => {
    const result = await prisma_1.default.classRoutine.create({
        data: payload,
        include: {
            class: true,
            section: true,
            subject: true,
        },
    });
    return result;
};
const getClassRoutineFromDB = async (classId, sectionId) => {
    const result = await prisma_1.default.classRoutine.findMany({
        where: {
            classId,
            sectionId,
        },
        include: {
            subject: true,
        },
        orderBy: { startTime: 'asc' },
    });
    return result;
};
exports.RoutineService = {
    createRoutineSlotInDB,
    getClassRoutineFromDB,
};
