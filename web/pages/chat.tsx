import AuthLayout from '@/components/Layout/AuthLayout';
import { AuthLoader, useLogin, useUser } from '@/lib/auth';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';

const chat = () => {
  const user = useUser();

  const router = useRouter();

  return (
    <Box>
      <AuthLayout>
        <div>chat screen</div>
      </AuthLayout>
    </Box>
  );
};

export default chat;
