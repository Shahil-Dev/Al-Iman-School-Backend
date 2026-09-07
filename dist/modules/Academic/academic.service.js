"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
// import prisma from '../../../lib/prisma';
const prisma_1 = __importDefault(require("../../lib/prisma"));
// --- Academic Year Services ---
const createAcademicYear = async (payload) => {
    const result = await prisma_1.default.academicYear.create({
        data: payload,
    });
    return result;
};
const getAllAcademicYears = async () => {
    const result = await prisma_1.default.academicYear.findMany({
        orderBy: { year: 'desc' },
    });
    return result;
};
// --- Academic Class Services ---
const createAcademicClass = async (payload) => {
    const result = await prisma_1.default.class.create({
        data: {
            name: payload.name,
            code: payload.code,
            academicYearId: payload.academicYearId,
        },
    });
    return result;
};
const getAllAcademicClasses = async () => {
    const result = await prisma_1.default.class.findMany({
        include: { sections: true },
        orderBy: { createdAt: 'asc' },
    });
    return result;
};
// --- Academic Section Services ---
const createAcademicSection = async (payload) => {
    const result = await prisma_1.default.section.create({
        data: payload,
    });
    return result;
};
exports.AcademicService = {
    createAcademicYear,
    getAllAcademicYears,
    createAcademicClass,
    getAllAcademicClasses,
    createAcademicSection,
};
