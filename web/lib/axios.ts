import { useNotificationStore } from '@/stores/notification';
import { Constant } from '@/utils/constant';
import storage from '@/utils/storage';
import Axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';

function authRequestInterceptor(config: AxiosRequestConfig) {
  const token = storage.getToken();
  // config.headers = ({ ...config.headers } as AxiosHeaders) ?? {};

  if (token && config.headers) {
    // @ts-ignore
    config.headers.authorization = `Bearer ${token}`;
  }
  // @ts-ignore
  config.headers.Accept = 'application/json';
  return config;
}

const axios = Axios.create({
  baseURL: Constant.isProd ? '' : 'http://localhost:5001/api/v1',
});

axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    return Promise.reject(error);
  },
);

export default axios;
