import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Anchor,
  Autocomplete,
  Button,
  Checkbox,
  Container,
  Fieldset,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';
import { searchLocations, Location } from '../services/locationApi';
import { User, useUserStore } from '../store/userStore';

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
  halachicPreferences: {
    ohrZaruah: boolean;
    kreisiUpleisi: boolean;
    chasamSofer: boolean;
  };
};

const CompleteProfile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { completeProfile, isLoading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const { register, control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
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
      halachicPreferences: {
        ohrZaruah: false,
        kreisiUpleisi: false,
        chasamSofer: false,
      },
    },
  });

  // Load initial locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await searchLocations();
        setLocations(response.locations);
        setLocationOptions(response.locations.map((loc: Location) => loc.value));
      } catch (error) {
        console.error('Error loading locations:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load locations',
          color: 'red',
        });
      }
    };
    loadLocations();
  }, []);

  const onSubmit = async (formData: RegisterFormValues) => {
    const selectedLocation = locations.find((loc: Location) => loc.value === formData.location);

    if (!selectedLocation) {
      notifications.show({
        title: 'Validation error',
        message: 'Please select a valid location',
        color: 'red',
      });
      return;
    }

    await completeProfile({
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
      halachicPreferences: {
        ohrZaruah: formData.halachicPreferences.ohrZaruah,
        kreisiUpleisi: formData.halachicPreferences.kreisiUpleisi,
        chasamSofer: formData.halachicPreferences.chasamSofer,
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
            <Group grow={!isMobile} wrap={isMobile ? 'wrap' : 'nowrap'}>
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
                  data={locationOptions}
                  {...field}
                />
              )}
            />

            <Controller
              name="ethnicity"
              control={control}
              render={({ field }) => (
                <Select
                  label="Halachic Custom"
                  description="This will be used to set the default halachic custom for your account. You can change this later in your settings."
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

            <Group grow={!isMobile} wrap={isMobile ? 'wrap' : 'nowrap'} align="flex-start">
              <Fieldset legend="Halachic Preferences">
                <Stack gap="xs">
                  <Checkbox label="Onat Ohr Zarua" description='Additional 12 hours separation preceding primary onah.'  {...register('halachicPreferences.ohrZaruah')} />

                  <Checkbox label="Beinonit 31" description='Additional Onah Beinonit on day 31.' {...register('halachicPreferences.chasamSofer')} />
                  
                  <Checkbox label="Onat Kreisi U'Pleisi" description='Onah Beinonit on day 30 of 24 hours' {...register('halachicPreferences.kreisiUpleisi')} />
                </Stack>
              </Fieldset>

              <Fieldset legend="Preferences">
                <Stack gap="xs">
                  <Checkbox label="Email Reminders" {...register('preferences.reminders')} />
                </Stack>
              </Fieldset>
            </Group>

            <Paper withBorder shadow="md" p="md" radius="md" my="md" bg="red.1"> 
              <Checkbox
                label="I consent to data processing for the purpose of using this service (required)"
                error={errors.dataProcessingConsent?.message}
                {...register('dataProcessingConsent', {
                  required: 'You must consent to data processing to use this service',
                })}
              />
            </Paper>

            <Button type="submit" fullWidth mt="lg" loading={isLoading}>
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;