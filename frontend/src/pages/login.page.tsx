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
import classes from './login.module.css';
import { notifications } from '@mantine/notifications';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { userAuthApi } from '../services/localApi';
import useZStore from '../Zstore.ts';

export function LoginPage() {
    const jumpTo = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useZStore((state) => state.setUser);

    type LoginValues = {
        email: string;
        password: string;
    }
    
    const {register, handleSubmit, formState: {errors}} = useForm<LoginValues>(
        {
            mode: 'onChange',
        }
    );
    
    const onSubmit = async (formData : LoginValues) => {
        setIsLoading(true);
        try {
            const response = await userAuthApi.login(formData);
            
            sessionStorage.setItem('token', response.token)
            setUser(response.user)

            setIsLoading(false);
            notifications.show({
                title: 'Success signing up',
                message: 'You have successfully logged in',
                color: 'green',
            })

            jumpTo('/calendar');
        } catch (error : any) {
            setIsLoading(false);
            console.error('Sign-in Error:', error);
            notifications.show({
                title: 'Error signing in',
                message: error.message,
                color: 'red',
            });
        }
    }  
    
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet? <Anchor>Create account</Anchor>
      </Text>
    
    <form onSubmit={handleSubmit(onSubmit)}>
        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        
        <TextInput
          label="Email"
          placeholder="you@mantine.dev"
          required
          error={errors.email?.message}
          {...register("email", {
                required: "Email is required",
                pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format"  
                }
            }
          )}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          type="password"
          error={errors.password?.message}
          {...register("password", {
                required: "Password is required",
                minLength: {
                    value: 8,
                    message: "Must be at least 8 characters"
                },
                pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message: "Must contain at least one letter and one number"
                }
            })}
        />

        <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor component="button" size="sm">
            Forgot password?
            </Anchor>
        </Group>

        <Button 
            type="submit" 
            fullWidth mt="xl" 
            radius="md"
            loading={isLoading}
        > Sign in </Button>
        
        </Paper>
    </form>
    </Container>
  );
}