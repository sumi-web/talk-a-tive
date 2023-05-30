import axios from '@/lib/axios';

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  image: File;
};

export const registerWithEmailAndPassword = async (data: RegisterCredentials): Promise<any> => {
  console.log('data came', data);

  try {
    const ok = await axios.post('/auth/register', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('data after', ok);

    return ok;
  } catch (err) {
    console.log('err', err);
  }
};
