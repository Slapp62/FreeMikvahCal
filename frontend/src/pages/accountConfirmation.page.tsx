import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Button } from '@mantine/core';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status'); // 'success' or 'failed'
  const reason = searchParams.get('reason'); // 'no-token' or 'invalid-token'
  const navigate = useNavigate();

  let message;
  if (status === 'success') {
    message = 'Your email has been verified successfully!';
  } else if (status === 'failed') {
    if (reason === 'no-token') {
      message = 'No verification token provided.';
    } else if (reason === 'invalid-token') {
      message = 'Invalid or expired verification link.';
    }
  } else {
    message = 'Verifying...';
  }

  return (
    <Container size={420} my={40}>
      <Paper p="xl" shadow="md" radius="md" withBorder>
        <Title ta="center" order={2} mb="md">
          {message}
        </Title>

        {status === 'success' && (
          <Button fullWidth mt="xl" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        )}
      </Paper>
    </Container>
  );
}
