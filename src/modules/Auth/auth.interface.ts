export type TLoginUser = {
  email: string;
  password: string;
};

export type TStudentLogin = {
  studentCode: string; 
};

export type TLoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email?: string | null;
    role: string;
    studentProfile?: any;
    teacherProfile?: any;
    parentProfile?: any;
  };
};