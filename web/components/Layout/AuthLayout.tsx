import { AuthLoader } from '@/lib/auth';
import { useRouter } from 'next/router';
import { Spinner } from '../Elements/Spinner';

type Props = {
  children: JSX.Element;
};

const AuthLayout = ({ children }: Props) => {
  const router = useRouter();

  return (
    <AuthLoader
      renderLoading={() => {
        return <Spinner />;
      }}
      renderUnauthenticated={() => {
        router.replace('/');
        return <Spinner size="lg" variant="light" />;
      }}
    >
      {children}
    </AuthLoader>
  );
};

export default AuthLayout;
