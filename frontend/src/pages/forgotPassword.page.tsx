import { Button, Container, Paper, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { joiResolver } from '@hookform/resolvers/joi';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authApi';
import { forgotPasswordSchema } from '../validationRules/authSchemas';

type ForgotPasswordValues = { email: string };

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    mode: 'onBlur',
    resolver: joiResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    await forgotPassword(values);
    sessionStorage.setItem('password-reset-email', values.email);
    notifications.show({
      title: 'Code sent',
      message: 'If that account exists, a reset code has been sent.',
      color: 'blue',
    });
    navigate('/verify-reset-code');
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Forgot password</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>Enter your email to get a 6-digit reset code.</Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Email" required error={errors.email?.message} {...register('email')} />
          <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>Send code</Button>
        </Paper>
      </form>
    </Container>
  );
}
