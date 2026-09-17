import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../lib/prisma';

const authGuard = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      // 1. Check token existence
      if (!token) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'You are not authorized!',
        });
      }

      // 2. Extract Bearer token
      const splitToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      // 3. Verify JWT
      const decoded = jwt.verify(
        splitToken,
        process.env.JWT_SECRET || 'secret_key'
      ) as JwtPayload;

      const { id, role } = decoded;

      // 4. Verify user in Database
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'This user no longer exists!',
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'This user is blocked!',
        });
      }

      // 5. Check Roles
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'You do not have permission to perform this action!',
        });
      }

      (req as any).user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid or expired token',
        error: (error as Error).message,
      });
    }
  };
};

export default authGuard;