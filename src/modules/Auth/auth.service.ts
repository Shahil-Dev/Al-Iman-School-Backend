import bcrypt from "bcrypt";
import { JwtHelpers } from "../../utils/jwtHelpers";
import { TLoginUser, TStudentLogin } from "./auth.interface";
import prisma from "../../lib/prisma";

// 1. General User Login (Admin, Teacher, Parent, Accounts)
const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { teacherProfile: { employeeId: email } },
        { teacherProfile: { phone: email } },
        { parentProfile: { phone: email } },
      ],
    },
    include: {
      studentProfile: true,
      teacherProfile: {
        include: {
          classTeacherOf: true,
        },
      },
      parentProfile: true,
    },
  });

  if (!user) {
    throw new Error("User does not exist!");
  }

  if (user.isBlocked) {
    throw new Error("This user account has been blocked!");
  }

  if (!user.isApproved) {
    throw new Error(
      "Your account is pending Admin Approval! Please wait for confirmation.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password does not match!");
  }

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

// 2. Student Direct Login (Only Student Code or Student ID, NO PIN)
const studentLogin = async (payload: TStudentLogin) => {
  const { studentCode } = payload;

  // Search by studentCode OR studentIdNo
  const student = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        { studentCode: studentCode },
        { studentIdNo: studentCode },
      ],
    },
    include: {
      class: true,
      section: true,
      user: true,
    },
  });

  if (!student) {
    throw new Error("Student account not found with provided Code or ID!");
  }

  // Create JWT Token for Student
  const jwtPayload = {
    id: student.userId || student.id,
    studentProfileId: student.id,
    studentCode: student.studentCode,
    role: "STUDENT",
  };

  const accessToken = JwtHelpers.createToken(
    jwtPayload,
    process.env.JWT_SECRET || "secret_key",
    process.env.JWT_EXPIRES_IN || "1d",
  );

  return {
    accessToken,
    user: {
      id: student.userId || student.id,
      role: "STUDENT",
      studentProfile: student,
    },
  };
};

// 3. Get Logged In User Profile (/auth/me)
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
          section: true,
        },
      },
      teacherProfile: {
        include: {
          classTeacherOf: true,
        },
      },
      parentProfile: {
        include: {
          students: true,
        },
      },
    },
  });

  if (user) {
    return user;
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: userId },
    include: {
      class: true,
      section: true,
      parent: true,
    },
  });

  if (studentProfile) {
    return {
      id: studentProfile.id,
      role: "STUDENT",
      studentProfile,
    };
  }

  throw new Error("User profile not found!");
};

// 4. Change Password Functionality (For Users)
const changePasswordInDB = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string },
) => {
  const { oldPassword, newPassword } = payload;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User does not exist!");
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) {
    throw new Error("Old password does not match!");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: { id: true, email: true, role: true, updatedAt: true },
  });
};

export const AuthService = {
  loginUser,
  studentLogin,
  getMyProfileFromDB,
  changePasswordInDB,
};