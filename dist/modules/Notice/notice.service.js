"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoticeService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const createNoticeInDB = async (payload) => {
    const result = await prisma_1.default.notice.create({
        data: payload,
    });
    return result;
};
const getAllNoticesFromDB = async (targetGroup) => {
    const whereCondition = targetGroup ? { targetGroup } : {};
    const result = await prisma_1.default.notice.findMany({
        where: whereCondition,
        orderBy: { publishedAt: 'desc' },
    });
    return result;
};
const deleteNoticeFromDB = async (id) => {
    const result = await prisma_1.default.notice.delete({
        where: { id },
    });
    return result;
};
exports.NoticeService = {
    createNoticeInDB,
    getAllNoticesFromDB,
    deleteNoticeFromDB,
};
