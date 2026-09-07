"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createSubjectIntoDB = async (payload) => {
    const result = await prisma_1.default.subject.create({
        data: payload,
        include: {
            class: true,
            teacher: true,
        },
    });
    return result;
};
const getAllSubjectsFromDB = async () => {
    const result = await prisma_1.default.subject.findMany({
        include: {
            class: true,
            teacher: true,
        },
    });
    return result;
};
const getSubjectsByClassFromDB = async (classId) => {
    const result = await prisma_1.default.subject.findMany({
        where: {
            classId,
        },
        include: {
            teacher: true,
        },
    });
    return result;
};
const updateSubjectIntoDB = async (id, payload) => {
    const result = await prisma_1.default.subject.update({
        where: { id },
        data: payload,
        include: {
            class: true,
            teacher: true,
        },
    });
    return result;
};
exports.SubjectService = {
    createSubjectIntoDB,
    getAllSubjectsFromDB,
    getSubjectsByClassFromDB,
    updateSubjectIntoDB,
};
