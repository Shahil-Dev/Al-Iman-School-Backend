"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
// 1. Create Teacher Profile
const createTeacherIntoDB = async (payload) => {
    const password = await bcrypt_1.default.hash(payload.password || "123456", Number(config_1.default.bcrypt_salt_rounds));
    const result = await prisma_1.default.$transaction(async (transactionClient) => {
        // 1. Create Base User
        const newUser = await transactionClient.user.create({
            data: {
                email: payload.teacher.email,
                password,
                role: client_1.Role.TEACHER,
            },
        });
        // 2. Create Teacher Profile
        const newTeacherProfile = await transactionClient.teacherProfile.create({
            data: {
                userId: newUser.id,
                employeeId: payload.teacher.employeeId,
                name: payload.teacher.name,
                designation: payload.teacher.designation,
                phone: payload.teacher.phone,
                photoUrl: payload.teacher.photoUrl,
            },
        });
        return newTeacherProfile;
    });
    return result;
};
// 2. Create Student Profile
const createStudentIntoDB = async (payload) => {
    const password = await bcrypt_1.default.hash(payload.password || "123456", Number(config_1.default.bcrypt_salt_rounds));
    const result = await prisma_1.default.$transaction(async (transactionClient) => {
        // 1. Create Base User
        const userEmail = payload.student.email || `${payload.student.studentIdNo}@school.com`;
        const newUser = await transactionClient.user.create({
            data: {
                email: userEmail,
                password,
                role: client_1.Role.STUDENT,
            },
        });
        // 2. Create Student Profile
        const newStudentProfile = await transactionClient.studentProfile.create({
            data: {
                userId: newUser.id,
                studentIdNo: payload.student.studentIdNo,
                firstName: payload.student.firstName,
                lastName: payload.student.lastName,
                gender: payload.student.gender,
                dob: new Date(payload.student.dob),
                phone: payload.student.phone,
                address: payload.student.address,
                photoUrl: payload.student.photoUrl,
                classId: payload.student.classId,
                sectionId: payload.student.sectionId,
                rollNo: payload.student.rollNo,
                parentId: payload.student.parentId,
            },
        });
        return newStudentProfile;
    });
    return result;
};
// 3. Create Parent Profile
const createParentIntoDB = async (payload) => {
    const password = await bcrypt_1.default.hash(payload.password || "123456", Number(config_1.default.bcrypt_salt_rounds));
    const result = await prisma_1.default.$transaction(async (transactionClient) => {
        // 1. Create Base User
        const userEmail = payload.parent.email || `parent_${payload.parent.phone}@school.com`;
        const newUser = await transactionClient.user.create({
            data: {
                email: userEmail,
                password,
                role: client_1.Role.PARENT,
            },
        });
        // 2. Create Parent Profile
        const newParentProfile = await transactionClient.parentProfile.create({
            data: {
                userId: newUser.id,
                fatherName: payload.parent.fatherName,
                motherName: payload.parent.motherName,
                phone: payload.parent.phone,
                occupation: payload.parent.occupation,
            },
        });
        return newParentProfile;
    });
    return result;
};
exports.UserService = {
    createTeacherIntoDB,
    createStudentIntoDB,
    createParentIntoDB,
};
