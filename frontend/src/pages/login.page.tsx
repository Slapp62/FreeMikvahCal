import { useEffect, useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../validationRules/authSchemas';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { VerificationModal } from '../components/modals/VerificationModal';
import axiosInstance from '../utils/axiosConfig';
import classes from './login.module.css';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Handle OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      notifications.show({
        title: 'Authentication Error',
        message: message || 'An error occurred during sign in. Please try again.',
        color: 'red',
      });

      // Clear the error params from URL
      searchParams.delete('error');
      searchParams.delete('message');
      setSearchParams(searchParams);
    }

    // Handle session expired message
    const session = searchParams.get('session');
    if (session === 'expired') {
      notifications.show({
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.',
        color: 'yellow',
      });

      searchParams.delete('session');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    mode: 'onBlur',
    resolver: joiResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormValues) => {
    const result = await login(formData);

    // Check if login failed due to unverified email
    if (result && !result.success && result.error && result.error.toLowerCase().includes('not verified')) {
      setUnverifiedEmail(formData.email);

      // Auto-resend verification code
      try {
        await axiosInstance.post('/auth/resend-verification', { email: formData.email });
        notifications.show({
          title: 'Account Not Verified',
          message: 'We have sent a new verification code to your email.',
          color: 'yellow',
        });
        setShowVerifyModal(true);
      } catch (error) {
        notifications.show({
          title: 'Verification Required',
          message: 'Please verify your account before logging in.',
          color: 'yellow',
        });
        setShowVerifyModal(true);
      }
    }
  };

  const handleVerifySuccess = () => {
    setShowVerifyModal(false);
    notifications.show({
      title: 'Email Verified!',
      message: 'Now, let us finish setting up your account.',
      color: 'teal',
    });
    navigate('/complete-profile');
  };

  const handleResendCode = async () => {
    try {
      await axiosInstance.post('/auth/resend-verification', { email: unverifiedEmail });
      notifications.show({
        title: 'Code Resent',
        message: 'A new verification code has been sent to your email.',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to resend code. Please try again.',
        color: 'red',
      });
    }
  };  
    
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor component={Link} to="/register" size="sm">
          Create account
        </Anchor>
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <GoogleSignInButton />

          <Divider label="or continue with email" labelPosition="center" my="lg" />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            error={errors.password?.message}
            {...register('password')}
          />

          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor component="button" type="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <Button type="submit" fullWidth mt="xl" loading={isLoading}>
            Sign in
          </Button>
        </Paper>
      </form>

      <VerificationModal
        opened={showVerifyModal}
        email={unverifiedEmail}
        onVerifySuccess={handleVerifySuccess}
        onResend={handleResendCode}
      />
    </Container>
  );
}