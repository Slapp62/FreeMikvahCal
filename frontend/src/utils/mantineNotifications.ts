import { notifications } from "@mantine/notifications"

const Notification = ({title, message, color}: {title: string, message: string, color: string}) => {
    return notifications.show({
        title: title,
        message: message,
        color: color,
    })
}

export default Notification