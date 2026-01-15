import { notifications } from "@mantine/notifications";

const NotificationSuccess = (props: {title : string, message : string}) => {
    const {title, message} = props
    return (
        notifications.show({
            color: "green", 
            title: `${title}`, 
            message: `${message}`
        })
    );
}

export default NotificationSuccess