import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';
import { VerificationModal } from '../components/modals/VerificationModal';
import { IRegister } from '../Types_Interfaces';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAuth, isLoading } = useAuth();
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<IRegister>({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: IRegister) => {
    // We send only the basics to start the PIN flow
    const result = await registerAuth({
      email: data.email,
      password: data.password,
      firstName: 'John',
      lastName: 'Doe',
      ethnicity: 'other',
      location: {
        city: 'New York',
        timezone: 'UTC',
        geonameId: 0,
        lat: 0,
        lng: 0,
      },
      consents: {
        dataProcessing: {
          granted: true,
        },
      },
      halachicPreferences: {
        ohrZaruah: false,
        kreisiUpleisi: false,
        chasamSofer: false,
      },
    });

    if (result.success) {
      setTempEmail(data.email);
      setShowVerifyModal(true);
    }
  };

  const handleVerifySuccess = () => {
    setShowVerifyModal(false);
    notifications.show({
      title: 'Email Verified!',
      message: 'Now, let’s finish setting up your account.',
      color: 'teal',
    });
    // Redirect to the full settings form
    navigate('/complete-profile');
  };

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder shadow="md">
        <Title order={1} ta="center" mb="sm">Create Your Account</Title>
        <Text ta="center" c="dimmed" mb="xl" size="sm">
          Enter your email and a strong password to get started.
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/, message: 'Invalid email' }
              })}
              error={errors.email?.message}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' }
              })}
              error={errors.password?.message}
              description="8+ characters with a mix of letters and numbers"
            />

            <Button type="submit" fullWidth size="md" loading={isLoading} mt="md">
              Get Started
            </Button>
          </Stack>
        </form>

        <Text ta="center" size="sm" mt="xl">
          Already have an account?{' '}
          <Anchor component="button" onClick={() => navigate('/login')} fw={500}>
            Log in
          </Anchor>
        </Text>
      </Paper>

      <VerificationModal 
        opened={showVerifyModal}
        email={tempEmail}
        onVerifySuccess={handleVerifySuccess}
        onResend={() => {
           // Your existing resend logic
           notifications.show({ message: 'New code sent!' });
        }}
      />
    </Container>
  );
}