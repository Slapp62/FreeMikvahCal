import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { RootState } from '@/store/store';

const Error404 = () => {
  const nav = useNavigate();
  const user = useSelector((state: RootState) => state.userSlice.user);

  const goHome = () => {
    nav('/');
  };

  return (
    <EmptyState
      title="404: Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Return to Homepage',
        onClick: goHome,
        showOnlyWhenLoggedOut: true,
      }}
      isLoggedIn={user !== null}
    />
  );
};

export default Error404;
