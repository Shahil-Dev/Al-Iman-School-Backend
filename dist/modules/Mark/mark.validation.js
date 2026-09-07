"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkValidation = void 0;
const zod_1 = require("zod");
const saveMarkValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        examId: zod_1.z.string({ message: 'Exam ID is required!' }),
        studentId: zod_1.z.string({ message: 'Student ID is required!' }),
        subjectId: zod_1.z.string({ message: 'Subject ID is required!' }),
        mtMarks: zod_1.z.number().min(0).optional().default(0),
        terminal: zod_1.z.number().min(0, { message: 'Terminal marks must be at least 0' }),
    }),
});
exports.MarkValidation = {
    saveMarkValidationSchema,
};
