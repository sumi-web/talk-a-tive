import { configureAuth } from 'react-query-auth';

// import { Spinner } from '@/components/Elements';
import {
  loginWithEmailAndPassword,
  getUser,
  registerWithEmailAndPassword,
  UserResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '@/features/auth';
import storage from '@/utils/storage';

async function handleUserResponse(data: UserResponse) {
  const { jwt, user } = data;
  storage.setToken(jwt);
  return user;
}

async function userFn() {
  if (storage.getToken()) {
    const data = await getUser();
    return data;
  }
  return null;
}

async function loginFn(data: LoginCredentials) {
  const response = await loginWithEmailAndPassword(data);
  const user = await handleUserResponse(response);
  return user;
}

async function registerFn(data: RegisterCredentials) {
  console.log('incoming data', data);

  const response = await registerWithEmailAndPassword(data);
  const user = await handleUserResponse(response);
  return user;
}

async function logoutFn() {
  storage.clearToken();
  window.location.assign(window.location.origin as unknown as string);
}

const authConfig = {
  userFn,
  loginFn,
  registerFn,
  logoutFn,
  // LoaderComponent() {
  //   return (
  //     <div className="w-screen h-screen flex justify-center items-center">
  //       <Spinner size="xl" />
  //     </div>
  //   );
  // },
};

export const { AuthLoader, useUser, useLogin, useRegister } = configureAuth<AuthUser | null, unknown, LoginCredentials, RegisterCredentials>(
  authConfig,
);
