import { Stack, Title, Text, Button, Grid, ActionIcon, Group } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <>
        
        <Stack my={40} align='center' justify='center' w='100%' >
            <Title c='purple' order={1}>The Free Mikvah Calendar</Title>
            <Title c='purple' order={2}>Making family purity easy for everyone</Title>
            <Text c='purple' fw={500}>Sign up now and start your own calendar</Text>
            <Button component={Link} to='/register' size="lg">Sign Up</Button>
        </Stack>
        
        <Grid w='80%' mx='auto' justify="space-around" mt={20}>
                <Grid.Col bg='primary' span={4} style={{borderRadius: '10px'}}>
                    <Stack p={10} h={200} align="center" justify="center">
                        <Text c='white' fw={500} ta="center">                        
                            Automatically calculate all your halachic times. Email reminders. Always free.
                        </Text>
                    </Stack>
                </Grid.Col>
                
                <Grid.Col span={7} bg='primary' style={{borderRadius: '10px'}}>
                    <Stack p={10} h={200} align="center" justify="center">
                        <Text c='white' fw={500} ta="center">                        
                            Customize your calendar according to your own minhagim.
                        </Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col mt={30} bg='primary' span={7} style={{borderRadius: '10px'}}>
                    <Stack p={10} h={200} align="center" justify="center">
                        <Text c='white' fw={500}>
                            Share with your friends and family.
                        </Text>
                        <Group>
                            <ActionIcon size={35} bg='purple' variant="outline" color='white' >
                                <IconBrandWhatsapp size={30} />
                            </ActionIcon>
                            <ActionIcon size={35} bg='purple' variant="outline" color='white'>
                                <IconBrandTwitter size={30}/>
                            </ActionIcon  >
                            <ActionIcon size={35} bg='purple' variant="outline" color='white'>
                                <IconBrandInstagram size={30}/>
                            </ActionIcon>
                            <ActionIcon size={35} bg='purple' variant="outline" color='white'>
                                <IconBrandFacebook size={30}/>
                            </ActionIcon>
                        </Group>
                    </Stack>
                </Grid.Col>
                <Grid.Col mt={30} bg='primary' span={4} style={{borderRadius: '10px'}}>
                    <Stack p={10} h={200} align="center" justify="center">
                        <Text c='white' fw={500} ta="center">
                            The support team is here to help. Contact us if you have any questions.
                        </Text>
                        <Button component={Link} to='/support' size="md">Support</Button>
                    </Stack>
                </Grid.Col>
                
            </Grid>
        
        </>
    );
};

export default HomePage