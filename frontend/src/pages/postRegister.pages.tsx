import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Button, Center, Alert } from '@mantine/core';
import { IconMailCheck, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import axiosInstance from '../utils/axiosConfig'; // Use your existing axiosInstance

export default function PostRegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from navigation state (passed from Register page) or fallback
  const email = location.state?.email || 'your email';
  
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setResendStatus('idle');
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      setResendStatus('success');
    } catch (error: any) {
      setResendStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} my={60}>
      <Paper p="xl" shadow="md" radius="md" withBorder>
        <Center mb="md">
          <IconMailCheck size={50} color="#e11d48" stroke={1.5} />
        </Center>
        
        <Title ta="center" order={2} mb="sm">
          Check your email
        </Title>
        
        <Text c="dimmed" fz="sm" ta="center" mb="xl">
          We've sent a verification link to <b>{email}</b>. 
          Please click the link to activate your account.
        </Text>

        {resendStatus === 'success' && (
          <Alert icon={<IconCheck size="1rem" />} title="Sent!" color="teal" mb="md">
            A new verification link has been sent to your inbox.
          </Alert>
        )}

        {resendStatus === 'error' && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mb="md">
            {errorMessage}
          </Alert>
        )}

        <Button 
          variant="filled" 
          fullWidth 
          color="rose" // Match your theme color
          onClick={() => navigate('/login')}
          mb="md"
        >
          Return to Login
        </Button>

        <Text ta="center" fz="xs" c="dimmed">
          Didn't receive the email?{' '}
          <Button 
            variant="transparent" 
            p={0} 
            fz="xs" 
            onClick={handleResend}
            loading={loading}
          >
            Click here to resend
          </Button>
        </Text>
      </Paper>
    </Container>
  );
}