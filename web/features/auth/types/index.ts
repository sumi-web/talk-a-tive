export type AuthUser = {
  _id: string;
  email: string;
  firstName: string;
  image: string;
  role: 'ADMIN' | 'USER';
};

export type UserResponse = {
  jwt: string;
  user: AuthUser;
};
