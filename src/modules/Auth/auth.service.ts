import bcrypt from "bcrypt";
import { JwtHelpers } from "../../utils/jwtHelpers";
import { TLoginUser } from "./auth.interface";
import prisma from "../../lib/prisma";

const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  // 1. Find user by Email, Student Code, Student ID, Phone, Teacher Phone/EmployeeID, or Parent Phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { studentProfile: { studentCode: email } },
        { studentProfile: { studentIdNo: email } },
        { studentProfile: { phone: email } },
        { teacherProfile: { employeeId: email } },
        { teacherProfile: { phone: email } }, // 👈 Added Teacher Phone Number Search
        { parentProfile: { phone: email } },
      ],
    },
    include: {
      studentProfile: true,
      teacherProfile: {
        include: {
          classTeacherOf: true, // Includes class teacher assignment data if exists
        },
      },
      parentProfile: true,
    },
  });

  if (!user) {
    throw new Error("User does not exist!");
  }

  // 2. Check if the user is blocked
  if (user.isBlocked) {
    throw new Error("This user account has been blocked!");
  }

  // 3. Check if the user account is approved (Pending Teacher / Student Guard)
  if (!user.isApproved) {
    throw new Error(
      "Your account is pending Admin Approval! Please wait for confirmation.",
    );
  }

  // 4. Password / PIN match checking
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password does not match!");
  }

  // 5. Create Access Token
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = JwtHelpers.createToken(
    jwtPayload,
    process.env.JWT_SECRET || "secret_key",
    process.env.JWT_EXPIRES_IN || "1d",
  );

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
      parentProfile: user.parentProfile,
    },
  };
};

// Get Logged In User Profile (/auth/me)
const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isApproved: true,
      isBlocked: true,
      createdAt: true,
      studentProfile: {
        include: {
          class: true,
        },
      },
      teacherProfile: {
        include: {
          classTeacherOf: true, // 👈 Includes assigned class in /auth/me profile
        },
      },
      parentProfile: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User profile not found!");
  }

  return user;
};

// Change User Password
const changePasswordInDB = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string },
) => {
  const { oldPassword, newPassword } = payload;

  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User does not exist!");
  }

  // 2. Verify current password
  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) {
    throw new Error("Old password does not match!");
  }

  // 3. Hash new password & update
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const AuthService = {
  loginUser,
  getMyProfileFromDB,
  changePasswordInDB,
};