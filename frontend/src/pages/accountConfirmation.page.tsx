import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Button, Loader, Center } from '@mantine/core';
import axiosInstance from '../utils/axiosConfig';
import { useUserStore } from '../store/userStore';

type ApiStatus = 'loading' | 'success' | 'failed';
type ApiReason = 'no-token' | 'invalid-token' | 'server-error' | null;

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
  const [apiReason, setApiReason] = useState<ApiReason>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setApiStatus('failed');
        setApiReason('no-token');
        return;
      }

      try {
        // Use your instance! No need for full URL or /api prefix
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        useUserStore.getState().setUser(response.data.user);
        setApiStatus('success');
      } catch (error: any) {
        setApiStatus('failed');
        // Your interceptor already logged the error, 
        // you just need to set the local UI state here
        const reason = error.response?.data?.reason;
        setApiReason(reason || 'invalid-token');
      }
    };

    verifyEmail();
  }, [searchParams]);

  // Message Logic
  const getMessage = () => {
    if (apiStatus === 'success') return 'Your email has been verified successfully! You can close this window.';
    if (apiStatus === 'loading') return 'Verifying your email...';
    
    switch (apiReason) {
      case 'no-token': return 'No verification token provided.';
      case 'server-error': return 'Server connection failed. Please try again later.';
      default: return 'Invalid or expired verification link.';
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper p="xl" shadow="md" radius="md" withBorder>
        <Title ta="center" order={2} mb="md">
          {getMessage()}
        </Title>

        {apiStatus === 'loading' && (
          <Center mt="md">
            <Loader size="md" color="rose" />
          </Center>
        )}

        {apiStatus === 'success' && (
          <Button fullWidth mt="xl" color="rose" onClick={() => navigate('/calendar')}>
            Go to Calendar
          </Button>
        )}
        
        {apiStatus === 'failed' && (
          <Button fullWidth mt="xl" variant="outline" color="gray" onClick={() => navigate('/register')}>
            Back to Sign Up
          </Button>
        )}
      </Paper>
    </Container>
  );
}