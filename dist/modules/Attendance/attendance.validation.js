"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const createAttendanceValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: zod_1.z.string({ message: 'Date is required!' }),
        classId: zod_1.z.string({ message: 'Class ID is required!' }),
        sectionId: zod_1.z.string({ message: 'Section ID is required!' }),
        attendances: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.string({ message: 'Student ID is required!' }),
            status: zod_1.z.nativeEnum(client_1.AttendanceStatus, { message: 'Invalid attendance status!' }),
        })).min(1, 'At least one student attendance record is required!'),
    }),
});
exports.AttendanceValidation = {
    createAttendanceValidationSchema,
};
