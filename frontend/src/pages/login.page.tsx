import { useEffect } from 'react';
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
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../validationRules/authSchemas';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import classes from './login.module.css';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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
    await login(formData);
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
    </Container>
  );
}