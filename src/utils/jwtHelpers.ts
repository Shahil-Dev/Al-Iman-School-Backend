import jwt, { Secret } from 'jsonwebtoken';

const createToken = (
  jwtPayload: { id: string; role: string },
  secret: Secret,
  expireIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expireIn as any,
  });
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret);
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};