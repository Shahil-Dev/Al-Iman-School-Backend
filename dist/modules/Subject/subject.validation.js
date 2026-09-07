"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectValidation = void 0;
const zod_1 = require("zod");
const createSubjectValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: "Subject name is required!" }),
        code: zod_1.z.string({ message: "Subject code is required!" }),
        fullMarks: zod_1.z.number().optional().default(100),
        hasMT: zod_1.z.boolean().optional().default(true),
        classId: zod_1.z.string({ message: "Class ID is required!" }),
        teacherId: zod_1.z.string().optional(),
    }),
});
const updateSubjectValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
        fullMarks: zod_1.z.number().optional(),
        hasMT: zod_1.z.boolean().optional(),
        classId: zod_1.z.string().optional(),
        teacherId: zod_1.z.string().optional(),
    }),
});
exports.SubjectValidation = {
    createSubjectValidationSchema,
    updateSubjectValidationSchema,
};
