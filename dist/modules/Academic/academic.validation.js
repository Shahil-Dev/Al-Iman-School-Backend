"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicValidation = void 0;
const zod_1 = require("zod");
const createAcademicYearValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        year: zod_1.z.number({ message: 'Year is required and must be a number!' }),
        isCurrent: zod_1.z.boolean().optional(),
    }),
});
const createAcademicClassValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Class name is required!' }),
        academicYearId: zod_1.z.string({ message: 'Academic Year ID is required!' }),
    }),
});
const createAcademicSectionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Section name is required!' }),
        classId: zod_1.z.string({ message: 'Class ID is required!' }),
    }),
});
exports.AcademicValidation = {
    createAcademicYearValidationSchema,
    createAcademicClassValidationSchema,
    createAcademicSectionValidationSchema,
};
