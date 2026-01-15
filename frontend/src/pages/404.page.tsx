import { Stack, Title, Text, Button } from "@mantine/core";
import { IconMoodConfuzed } from "@tabler/icons-react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <Stack align="center" justify="center" >
            <Title>404 - Page Not Found</Title>
            <Text>The page you are looking for does not exist.</Text>
            <IconMoodConfuzed size={100} stroke={1.5}/>
            <Button component={Link} to="/">Back to Home</Button>
        </Stack>
    );
};

export default PageNotFound;