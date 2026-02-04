import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Anchor,
  Autocomplete,
  Button,
  Checkbox,
  Container,
  Divider,
  Fieldset,
  Group,
  Paper,
  Radio,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';
import { searchLocations, Location } from '../services/locationApi';
import { useHalachicPresets } from '../hooks/useHalachicPresets';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  halachicCustom: 'ashkenazi_EY' | 'ashkenazi_CL' | 'sephardi_ROY' | 'sephard_RME' | 'manual';
  location: string;
  dataProcessingConsent: boolean;
  preferences: {
    reminders: boolean;
  };
  halachicPreferences: {
    ohrZaruah: boolean;
    beinonit_24hr: boolean;
    beinonit_31: boolean;
    vesetHachodesh30thSkip29: boolean;
    haflagahDualMode: 'latest_only' | 'keep_both';
    minimumNiddahDays: number;
  };
};

const CompleteProfile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { completeProfile, isLoading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterFormValues>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      halachicCustom: undefined,
      location: '',
      dataProcessingConsent: false,
      preferences: {
        reminders: false,
      },
      halachicPreferences: {
        ohrZaruah: false,
        beinonit_24hr: false,
        beinonit_31: false,
        vesetHachodesh30thSkip29: false,
        haflagahDualMode: 'latest_only',
        minimumNiddahDays: 5,
      },
    },
  });

  // Auto-apply halachic presets when custom changes
  const halachicCustom = watch('halachicCustom');
  useHalachicPresets(halachicCustom, setValue);

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
      halachicCustom: formData.halachicCustom,
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
        beinonit_24hr: formData.halachicPreferences.beinonit_24hr,
        beinonit_31: formData.halachicPreferences.beinonit_31,
        vesetHachodesh30thSkip29: formData.halachicPreferences.vesetHachodesh30thSkip29,
        haflagahDualMode: formData.halachicPreferences.haflagahDualMode,
        minimumNiddahDays: formData.halachicPreferences.minimumNiddahDays,
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
            
            <Fieldset legend="Halachic Custom">
            <Controller
                    name="halachicCustom"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group
                        description="Select based on your custom"
                        required
                        {...field}
                        value={String(field.value)}
                        onChange={(value) => field.onChange(value)}
                      >
                        <Stack mt="xs">
                          <Text fw={600} size="sm">Ashkenazi</Text>
                          <Stack gap={6} ml={12}>
                            <Radio value="ashkenazi_EY" label="Eretz Yisrael" />
                            <Radio value="ashkenazi_CL" label="Chutz La'aretz" />
                          </Stack>
                          <Text fw={600} size="sm" mt={4}>Sephardi</Text>
                          <Stack gap={6} ml={12}>
                            <Radio value="sephardi_ROY" label="Rav Ovadiah Yosef" />
                            <Radio value="sephard_RME" label="Rav Mordechai Eliyahu" />
                          </Stack>
                          <Radio value="manual" label="Manual Setting" />
                        </Stack>
                      </Radio.Group>
                    )}
                  />
            </Fieldset>

            <Fieldset legend="Minimum Before Hefsek Tahara">
            <Controller
                    name="halachicPreferences.minimumNiddahDays"
                    control={control}
                    render={({ field }) => (
                      <Radio.Group
                        description="Select based on your custom"
                        
                        {...field}
                        value={String(field.value)}
                        onChange={(value) => field.onChange(Number(value))}
                      >
                        <Stack mt="xs">
                          <Radio value="4" label="4 days (Sephardi custom)" />
                          <Radio value="5" label="5 days (Ashkenazi custom)" />
                        </Stack>
                      </Radio.Group>
                    )}
                  />
            </Fieldset>

            <Group grow={!isMobile} wrap={isMobile ? 'wrap' : 'nowrap'} align="flex-start">
              <Fieldset legend="Halachic Preferences">
                
                <Stack gap="lg">
                  
                  <Checkbox label="Onat Ohr Zarua" description='Additional 12 hours separation preceding primary onah.'  {...register('halachicPreferences.ohrZaruah')} />

                  <Checkbox label="Beinonit 31" description='Additional Onah Beinonit on day 31.' {...register('halachicPreferences.beinonit_31')} />
                  
                  <Checkbox label="Full Day Beinonit" description='Onah Beinonit on day 30 of 24 hours' {...register('halachicPreferences.beinonit_24hr')} />

                  <Controller
                    name="halachicPreferences.haflagahDualMode"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label="Dual Haflagah (when new interval is shorter)"
                        description="Keep both upcoming haflagah events instead of only the new shorter one."
                        checked={field.value === 'keep_both'}
                        onChange={(event) => field.onChange(event.currentTarget.checked ? 'keep_both' : 'latest_only')}
                      />
                    )}
                  />
                </Stack>
              </Fieldset>

              <Fieldset legend="Preferences">
                <Stack gap="xs">
                  <Checkbox label="Email Reminders" {...register('preferences.reminders')} />
                </Stack>
              </Fieldset>
            </Group>

            <Divider my="md" />

            <Paper
              withBorder
              p="lg"
              radius="md"
              style={{
                borderColor: 'var(--mantine-color-blue-6)',
                borderWidth: '2px',
                backgroundColor: 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6))'
              }}
            >
              <Stack gap="sm">
                <Text size="sm" fw={600} c="blue.7">
                  Data Processing Consent
                </Text>

                <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                  By creating an account, you acknowledge that FreeMikvahCal will collect and process
                  your personal information (including email address, location data, and cycle information)
                  for the purpose of providing calendar calculations and reminders. Your data will be
                  stored securely and will not be shared with third parties except as required by law.
                </Text>

                <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
                  You may request deletion of your data at any time by contacting us. For more information,
                  please review our Privacy Policy.
                </Text>

                <Checkbox
                  mt="xs"
                  label={
                    <Text size="sm" fw={500}>
                      I consent to the collection and processing of my personal data as described above (Required)
                    </Text>
                  }
                  error={errors.dataProcessingConsent?.message}
                  {...register('dataProcessingConsent', {
                    required: 'You must consent to data processing to use this service',
                  })}
                />
              </Stack>
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
