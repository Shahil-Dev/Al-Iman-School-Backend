"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const authGuard = (...requiredRoles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            // 1.check if the token is present in the request headers
            if (!token) {
                throw new Error('You are not authorized!');
            }
            // 2.Remove the "Bearer " prefix from the token if it exists
            const splitToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
            // 2.Verify the token
            const decoded = jsonwebtoken_1.default.verify(splitToken, process.env.JWT_SECRET || 'secret_key');
            const { id, role } = decoded;
            // 3.Check if the user exists in the database and is not blocked
            const user = await prisma_1.default.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new Error('This user no longer exists!');
            }
            if (user.isBlocked) {
                throw new Error('This user is blocked!');
            }
            // 4. Check role-based access permissions
            if (requiredRoles.length && !requiredRoles.includes(role)) {
                throw new Error('You do not have permission to perform this action!');
            }
            // 5. Attach the decoded user data to the request object
            req.user = decoded;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = authGuard;
