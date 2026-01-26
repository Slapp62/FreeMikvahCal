import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Button } from '@mantine/core';
import axios from 'axios';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying...');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link');
      return;
    }

    axios
      .get(`https://freemikvahcal.com/api/auth/verify-email/${token}`)
      .then(() => {
        setMessage('Your email has been verified successfully!');
      })
      .catch(() => {
        setMessage('Verification failed or link has expired.');
      });
  }, [token]);

  return (
    <Container size={420} my={40}>
      <Paper p="xl" shadow="md" radius="md" withBorder>
        <Title ta="center" order={2} mb="md">
          {message}
        </Title>

        {message === 'Your email has been verified successfully!' && (
          <Button fullWidth mt="xl" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        )}
      </Paper>
    </Container>
  );
}
