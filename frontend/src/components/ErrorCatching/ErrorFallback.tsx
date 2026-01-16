import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback = ({ error, errorInfo, onReset }: ErrorFallbackProps) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack gap="md">
          <Title order={2} c="red">
            Something went wrong
          </Title>

          <Text>
            We apologize for the inconvenience. An error occurred while loading the page.
          </Text>

          <Button onClick={onReset} variant="filled">
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
          >
            Go to Home
          </Button>

          {isDevelopment && error && (
            <Stack gap="xs" mt="md">
              <Text fw={700} size="sm">
                Error Details (Development Only):
              </Text>
              <Paper bg="gray.1" p="sm" style={{ overflow: 'auto' }}>
                <Text size="xs" ff="monospace" c="red">
                  {error.toString()}
                </Text>
                {errorInfo && (
                  <Text size="xs" ff="monospace" mt="xs">
                    {errorInfo.componentStack}
                  </Text>
                )}
              </Paper>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ErrorFallback;
