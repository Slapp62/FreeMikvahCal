import { useState } from 'react';
import {
  Paper,
  Tabs,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../validationRules/authSchemas';
import { GoogleSignInButton } from './GoogleSignInButton';
import { VerificationModal } from '../modals/VerificationModal';

type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = {
  email: string;
  password: string;
};

export function HeroAuthCard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('login');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const { login, register: registerAuth, isLoading } = useAuth();

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    mode: 'onBlur',
    resolver: joiResolver(loginSchema),
  });

  // Register form
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<RegisterFormValues>({
    mode: 'onBlur',
  });

  const onLoginSubmit = async (formData: LoginFormValues) => {
    await login(formData);
  };

  const onSignupSubmit = async (formData: RegisterFormValues) => {
    const result = await registerAuth({
      email: formData.email,
      password: formData.password,
      halachicCustom: 'manual',
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
      setTempEmail(formData.email);
      setShowVerifyModal(true);
    }
  };

  const handleVerifySuccess = () => {
    setShowVerifyModal(false);
    notifications.show({
      title: 'Email Verified!',
      message: "Now, let's finish setting up your account.",
      color: 'teal',
    });
    navigate('/complete-profile');
  };

  return (
    <Paper
      shadow="md"
      p="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        minWidth: 320,
        maxWidth: 380,
      }}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="login">Login</Tabs.Tab>
          <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="md">
          <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <Stack gap="md">
              <GoogleSignInButton />

              <Divider label="or" labelPosition="center" size="xs" />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                size="md"
                error={loginErrors.email?.message}
                {...loginRegister('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                error={loginErrors.password?.message}
                {...loginRegister('password')}
              />

              <Button type="submit" size="md" fullWidth mt="xs" loading={isLoading}>
                Sign In
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="signup" pt="md">
          <form onSubmit={handleSignupSubmit(onSignupSubmit)}>
            <Stack gap="md">
              <GoogleSignInButton />

              <Divider label="or" labelPosition="center" size="xs" />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                size="md"
                error={signupErrors.email?.message}
                {...signupRegister('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
                })}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                error={signupErrors.password?.message}
                {...signupRegister('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />

              <Button type="submit" fullWidth mt="xs" size="md" loading={isLoading}>
                Get Started
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>

      <VerificationModal
        opened={showVerifyModal}
        email={tempEmail}
        onVerifySuccess={handleVerifySuccess}
        onResend={() => {
          notifications.show({ message: 'New code sent!', color: 'blue' });
        }}
      />
    </Paper>
  );
}
