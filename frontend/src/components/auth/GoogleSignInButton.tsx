import { Button } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';

interface GoogleSignInButtonProps {
  text?: string;
  fullWidth?: boolean;
}

export function GoogleSignInButton({
  text = 'Continue with Google',
  fullWidth = true
}: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    // Get the API base URL from environment
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <Button
      fullWidth={fullWidth}
      variant="default"
      leftSection={<IconBrandGoogle size={18} />}
      onClick={handleGoogleSignIn}
    >
      {text}
    </Button>
  );
}
