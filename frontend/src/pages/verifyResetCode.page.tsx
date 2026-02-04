import { Button, Container, Paper, PinInput, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { joiResolver } from '@hookform/resolvers/joi';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { verifyResetCode } from '../services/authApi';
import { verifyResetCodeSchema } from '../validationRules/authSchemas';

type VerifyCodeValues = { code: string };

export default function VerifyResetCodePage() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('password-reset-email') || '';

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyCodeValues>({
    mode: 'onBlur',
    resolver: joiResolver(verifyResetCodeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async ({ code }: VerifyCodeValues) => {
    if (!email) {
      notifications.show({ title: 'Start again', message: 'Please request a new reset code.', color: 'red' });
      navigate('/forgot-password');
      return;
    }

    const result = await verifyResetCode({ email, code });
    sessionStorage.setItem('password-reset-token', result.resetToken);
    notifications.show({ title: 'Code verified', message: 'Set your new password.', color: 'green' });
    navigate('/reset-password');
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Verify code</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>Enter the 6-digit code sent to your email.</Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <PinInput length={6} oneTimeCode type="number" value={field.value} onChange={field.onChange} />
            )}
          />
          <Text c="red" size="sm" mt="sm">{errors.code?.message}</Text>
          <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>Verify code</Button>
        </Paper>
      </form>
    </Container>
  );
}
