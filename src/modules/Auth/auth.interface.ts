export type TLoginUser = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};