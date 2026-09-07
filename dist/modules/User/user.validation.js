"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createTeacherValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().optional(),
        teacher: zod_1.z.object({
            email: zod_1.z
                .string({ message: "Email is required!" })
                .email("Invalid email format!"),
            employeeId: zod_1.z.string({ message: "Employee ID is required!" }),
            name: zod_1.z.string({ message: "Teacher name is required!" }),
            designation: zod_1.z.string({ message: "Designation is required!" }),
            phone: zod_1.z.string({ message: "Phone number is required!" }),
            photoUrl: zod_1.z.string().optional(),
        }),
    }),
});
const createStudentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().optional(),
        student: zod_1.z.object({
            email: zod_1.z.string().email("Invalid email format!").optional(),
            studentIdNo: zod_1.z.string({ message: "Student ID No is required!" }),
            firstName: zod_1.z.string({ message: "First name is required!" }),
            lastName: zod_1.z.string({ message: "Last name is required!" }),
            gender: zod_1.z.nativeEnum(client_1.Gender, { message: "Gender is required!" }),
            dob: zod_1.z.string({ message: "Date of birth is required!" }),
            phone: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            photoUrl: zod_1.z.string().optional(),
            classId: zod_1.z.string({ message: "Class ID is required!" }),
            sectionId: zod_1.z.string({ message: "Section ID is required!" }),
            rollNo: zod_1.z.number({ message: "Roll number must be a number!" }),
            parentId: zod_1.z.string().optional(),
        }),
    }),
});
const createParentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().optional(),
        parent: zod_1.z.object({
            email: zod_1.z.string().email("Invalid email format!").optional(),
            fatherName: zod_1.z.string({ message: "Father's name is required!" }),
            motherName: zod_1.z.string({ message: "Mother's name is required!" }),
            phone: zod_1.z.string({ message: "Phone number is required!" }),
            occupation: zod_1.z.string().optional(),
        }),
    }),
});
exports.UserValidation = {
    createTeacherValidationSchema,
    createStudentValidationSchema,
    createParentValidationSchema,
};
