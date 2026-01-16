import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Autocomplete,
  Button,
  Checkbox,
  Container,
  Fieldset,
  Group,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { register as registerUser } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import locations from '../data/locations';

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  ethnicity: 'ashkenazi' | 'sephardi' | 'teimani' | 'other';
  location: string;
  dataProcessingConsent: boolean;
  preferences: {
    reminders: boolean;
  };
  special_onahs: {
    beinonit_30_31: boolean;
    onat_ohr_zarua: boolean;
  };
};

const RegisterPage = () => {
  const { register: registerAuth, isLoading } = useAuth();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      ethnicity: undefined,
      location: '',
      dataProcessingConsent: false,
      preferences: {
        reminders: false,
      },
      special_onahs: {
        beinonit_30_31: false,
        onat_ohr_zarua: false,
      },
    },
  });

  const onSubmit = async (formData: RegisterFormValues) => {
    const selectedLocation = locations.find((loc) => loc.value === formData.location);

    if (!selectedLocation) {
      notifications.show({
        title: 'Validation error',
        message: 'Please select a valid location',
        color: 'red',
      });
      return;
    }

    await registerAuth({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      location: {
        city: selectedLocation.value,
        geonameId: selectedLocation.geonameId,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        timezone: selectedLocation.timezone || 'UTC',
      },
      consents: {
        dataProcessing: {
          granted: formData.dataProcessingConsent,
        },
      },
    });
  };


  return (
    <Container size="lg" my={40}>
      <Title ta="center" order={1}>
        Create Your Account
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor component={Link} to="/login" size="sm">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="John"
                required
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters',
                  },
                })}
              />

              <TextInput
                label="Last Name"
                placeholder="Doe"
                required
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters',
                  },
                })}
              />
            </Group>

            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              error={errors.password?.message}
              description="Must contain uppercase, lowercase, number, and special character (@$!%*?&)"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password does not meet requirements',
                },
              })}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-type your password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                validate: (value) => value === watch('password') || 'Passwords do not match',
                required: 'Please confirm your password',
              })}
            />

            <Controller
              name="location"
              control={control}
              rules={{ required: 'Location is required' }}
              render={({ field }) => (
                <Autocomplete
                  label="City"
                  placeholder="Start typing to search..."
                  required
                  error={errors.location?.message}
                  data={locations.map((location) => ({
                    label: location.value,
                    value: location.value,
                  }))}
                  {...field}
                />
              )}
            />

            <Controller
              name="ethnicity"
              control={control}
              render={({ field }) => (
                <Select
                  label="Jewish Ethnicity (optional)"
                  placeholder="Select ethnicity"
                  clearable
                  data={[
                    { value: 'ashkenazi', label: 'Ashkenazi' },
                    { value: 'sephardi', label: 'Sephardi' },
                    { value: 'teimani', label: 'Teimani' },
                    { value: 'other', label: 'Other' },
                  ]}
                  {...field}
                />
              )}
            />

            <Checkbox
              label="I consent to data processing for the purpose of using this service (required)"
              error={errors.dataProcessingConsent?.message}
              {...register('dataProcessingConsent', {
                required: 'You must consent to data processing to use this service',
              })}
            />

            <Group grow align="flex-start">
              <Fieldset legend="Special Onahs">
                <Stack gap="xs">
                  <Checkbox label="Onat Ohr Zarua" {...register('special_onahs.onat_ohr_zarua')} />
                  <Checkbox label="Onah Beinonit on day 31" {...register('special_onahs.beinonit_30_31')} />
                </Stack>
              </Fieldset>

              <Fieldset legend="Preferences">
                <Stack gap="xs">
                  <Checkbox label="Email Reminders" {...register('preferences.reminders')} />
                </Stack>
              </Fieldset>
            </Group>

            <Button type="submit" fullWidth mt="lg" loading={isLoading}>
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterPage;