import { notifications } from "@mantine/notifications";

const NotificationError = (props: {title : string, message : string}) => {
    const {title, message} = props
    return (
        notifications.show({
            color: "red", 
            title: `${title}`, 
            message: `${message}`
        })
    );
}

export default NotificationError