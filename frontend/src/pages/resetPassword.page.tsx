import { Button, Container, Paper, PasswordInput, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { joiResolver } from '@hookform/resolvers/joi';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authApi';
import { resetPasswordSchema } from '../validationRules/authSchemas';

type ResetPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const resetToken = sessionStorage.getItem('password-reset-token') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    mode: 'onBlur',
    resolver: joiResolver(resetPasswordSchema),
  });

  const onSubmit = async ({ newPassword }: ResetPasswordValues) => {
    if (!resetToken) {
      notifications.show({ title: 'Start again', message: 'Please verify your reset code first.', color: 'red' });
      navigate('/forgot-password');
      return;
    }

    await resetPassword(resetToken, newPassword);
    sessionStorage.removeItem('password-reset-token');
    sessionStorage.removeItem('password-reset-email');
    notifications.show({ title: 'Password reset', message: 'You can now sign in with your new password.', color: 'green' });
    navigate('/login');
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Set new password</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>Choose a strong password for your account.</Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <PasswordInput label="New password" required error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordInput label="Confirm password" mt="md" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>Reset password</Button>
          <Text size="sm" mt="md">Remembered it? <Link to="/login">Back to login</Link></Text>
        </Paper>
      </form>
    </Container>
  );
}
