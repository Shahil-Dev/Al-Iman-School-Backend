import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import prisma from '../lib/prisma';


const authGuard = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      // 1.check if the token is present in the request headers
      if (!token) {
        throw new Error('You are not authorized!');
      }

      // 2.Remove the "Bearer " prefix from the token if it exists
      const splitToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      // 2.Verify the token
      const decoded = jwt.verify(
        splitToken,
        process.env.JWT_SECRET || 'secret_key'
      ) as JwtPayload;

      const { id, role } = decoded;

      // 3.Check if the user exists in the database and is not blocked
      const user = await prisma.user.findUnique({
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
      (req as any).user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authGuard;