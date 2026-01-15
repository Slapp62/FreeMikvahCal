import { Controller, useForm,  } from "react-hook-form";
import { Autocomplete, Button, Checkbox, Fieldset, Group, Paper, PasswordInput, Select, Stack, TextInput, Title } from "@mantine/core";
import '@mantine/notifications/styles.css';
import { notifications } from "@mantine/notifications";
import { userAuthApi } from "../services/localApi.ts";
import locations from "../data/locations.ts";

type RegisterValues = {
        email: string;
        password: string;
        confirmPassword: string;
        ethnicity: 'ashkenazi' | 'sephardi' | 'teimani' | 'other';
        location: string;
        preferences: {
            reminders: boolean,
        };
        special_onahs: {
            beinonit_30_31: boolean,
            onat_ohr_zarua: boolean
        };
    }

const RegisterPage = () => {

    const {register, control, handleSubmit, reset, watch, formState: {errors}} = useForm<RegisterValues>(
        {
            mode: 'onChange',
            defaultValues: {
                email: '',
                password: '',
                confirmPassword: '',
                ethnicity: undefined,
                location: '',
                preferences: {
                    reminders: false,
                },
                special_onahs: {
                    beinonit_30_31: false,
                    onat_ohr_zarua: false
                },
            }
        }
    );

    const onSubmit = async (formData : RegisterValues) => {
        console.log('form data:', formData);
<<<<<<< HEAD
        
        // 1: submit email and password and receive user and session data
        const { data ,error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });
        
        // 2: if there is an error signing up, show notification
        if (error) {
            console.error('Sign-up Error:', error);
=======

        const location = locations.find((loc) => loc.value === formData.location);

        try {
            const response = await userAuthApi.register({
                email: formData.email,
                password: formData.password,
                ethnicity: formData.ethnicity,
                location: {
                    city: location?.value,
                    geonameId: location?.geonameId,
                    lat: location?.lat,
                    lng: location?.lng,
                    timezone: location?.timezone
                },
                special_onahs: {
                    onat_ohrZarua: formData.special_onahs.onat_ohr_zarua,
                    beinonit_on31: formData.special_onahs.beinonit_30_31
                },
                preferences: {
                    email_reminders: formData.preferences.reminders
                },
            });

            if (response) {
                console.log('Registeration success:', response)
                notifications.show({
                    title: 'Sign up successful!',
                    message: 'Please check your email to confirm your registration.',
                    color: 'green',
                });
                reset();
            } 
        } catch (error : any) {
            console.error('Error registering user:', error);
>>>>>>> master
            notifications.show({
                title: 'Error signing up',
                message: error.message,
                color: 'red',
            });
        }
    }


  return (
    <Paper mx='auto' my='xl' shadow="xs" p="lg" radius="md" withBorder w='40%'>
        <Stack w='95%' mx='auto'>
        <Title order={1} ta="center">Register</Title>
        
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack w='100%' mx='auto' gap={20}>
            <TextInput
            label="Email"
            placeholder="email@gmail.com"
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

            <PasswordInput
                label="Confirm Password"
                placeholder="Re-type your password"
                required
                type="password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", 
                    {
                        validate: (value) => value === watch('password') || "Passwords do not match",
                        required: "Confirmation is required",
                    })}
            />

            <Controller
                name = "ethnicity"
                control = {control}
                render={({ field }) => (
                    <Select
                        label="Jewish Ethnicity"
                        placeholder="Pick one"
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

            <Controller
                name = "location"
                control = {control}
                render={({ field }) => (
                    <Autocomplete
                        label="City"
                        placeholder="Pick one"
                        data={locations.map((location) => ({
                            label: location.value,
                            value: location.value 
                            })
                        )}
                        {...field}
                    /> 
                )}
            />

            <Group justify="space-between" align="flex-start">
                <Fieldset legend="Special Onahs" w='45%'>
                    <Stack>
                        <Checkbox label="Onat Ohr Zarua" {...register("special_onahs.onat_ohr_zarua")}/>
                        <Checkbox label="Onah Beinonit on day 31" {...register("special_onahs.beinonit_30_31")}/>
                    </Stack>
                </Fieldset>

                <Fieldset legend="Preferences" w='45%'>
                    <Stack>
                        <Checkbox label="Email Reminders" {...register("preferences.reminders")}/>
                    </Stack>
                </Fieldset>
            </Group>

            <Button type="submit">Register</Button>
            </Stack>
        </form>
        
        </Stack>
    </Paper>
  );
};

export default RegisterPage;