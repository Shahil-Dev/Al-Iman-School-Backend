import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

// 1. General Login
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully!",
    data: result,
  });
});

// 2. Student Direct Login (Added Missing Controller)
const studentLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.studentLogin(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Student logged in successfully!",
    data: result,
  });
});

// 3. Get My Profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AuthService.getMyProfileFromDB(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile retrieved successfully!",
    data: result,
  });
});

// 4. Change Password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AuthService.changePasswordInDB(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
    data: result,
  });
});

export const AuthController = {
  loginUser,
  studentLogin,
  getMyProfile,
  changePassword,
};