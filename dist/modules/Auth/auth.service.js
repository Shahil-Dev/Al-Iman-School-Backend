"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// import jwt, { Secret } from 'jsonwebtoken';
const jwtHelpers_1 = require("../../utils/jwtHelpers");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const loginUser = async (payload) => {
    const { email, password } = payload;
    // 1. Find the user by email, student ID, employee ID, or phone number
    const user = await prisma_1.default.user.findFirst({
        where: {
            OR: [
                { email: email },
                { studentProfile: { studentIdNo: email } },
                { teacherProfile: { employeeId: email } },
                { parentProfile: { phone: email } },
            ],
        },
        include: {
            studentProfile: true,
            teacherProfile: true,
            parentProfile: true,
        },
    });
    if (!user) {
        throw new Error("User does not exist!");
    }
    // 2.Check if the user is blocked
    if (user.isBlocked) {
        throw new Error("This user account has been blocked!");
    }
    // 3.Password match checking
    const isPasswordMatched = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password does not match!");
    }
    // 4.create Access Token
    const jwtPayload = {
        id: user.id,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.JwtHelpers.createToken(jwtPayload, process.env.JWT_SECRET || "secret_key", process.env.JWT_EXPIRES_IN || "1d");
    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};
exports.AuthService = {
    loginUser,
};
