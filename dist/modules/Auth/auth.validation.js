"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            message: 'Email or User ID is required!',
        }),
        password: zod_1.z.string({
            message: 'Password is required!',
        }),
    }),
});
exports.AuthValidation = {
    loginValidationSchema,
};
