import { Modal, PinInput, Stack, Text, Button, Group, Alert } from '@mantine/core';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { User } from '../../store/userStore';

interface VerificationModalProps {
  opened: boolean;
  email: string;
  onVerifySuccess: (user: User) => void;
  onResend: () => void;
}

export function VerificationModal({ opened, email, onVerifySuccess, onResend }: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (val: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/auth/verify-code', { 
        email, 
        code: val 
      });
      onVerifySuccess(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={() => {}} withCloseButton={false} centered title="Verify Your Account">
      <Stack align="center" gap="md">
        <Text size="sm" ta="center">
          We sent a 6-digit code to <b>{email}</b>. Please enter it below.
        </Text>

        <PinInput 
          length={6} 
          type="number" 
          value={code} 
          onChange={setCode}
          onComplete={handleVerify}
          disabled={loading}
          oneTimeCode // Helps mobile keyboards suggest the code
        />

        {error && <Alert color="red" variant="light">{error}</Alert>}

        <Group justify="center">
          <Button variant="transparent" size="xs" onClick={onResend}>
            Didn't get the code? Resend
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}