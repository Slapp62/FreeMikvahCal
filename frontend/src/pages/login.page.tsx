import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { notifications } from '@mantine/notifications';
import { login } from '../services/authApi';
import { useUserStore } from '../store/userStore';
import { loginSchema } from '../validationRules/authSchemas';
import classes from './login.module.css';

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    mode: 'onBlur',
    resolver: joiResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await login(formData);

      setUser(response.user);

      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully logged in',
        color: 'green',
      });

      navigate('/calendar');
    } catch (error: any) {
      console.error('Login error:', error);
      notifications.show({
        title: 'Login failed',
        message: error.response?.data?.message || error.message || 'Please check your credentials and try again',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
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