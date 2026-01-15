import { Modal, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import PeriodEventForm from './periodEventForm.tsx';
import useZStore from '../Zstore.ts/index.ts';

type ModalProps = {
    clicked: boolean;
    close: () => void;
};

function CalendarEventModal({clicked, close} : ModalProps) {
    const [closeOutside, setCloseOutside] = useState(false);
    const dateClicked = useZStore((state) => state.dateClicked);

    useEffect(() => {
        if (clicked){
            const timer = setTimeout(() => {
                setCloseOutside(true);
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setCloseOutside(false)
        }
    }, [clicked])


    return (
    <>
        <Modal 
            opened={clicked} 
            onClose={close}
            title={`Entering an event for ${dateClicked}`}
            closeOnClickOutside={closeOutside}
            centered
            size='md'
            radius="md"
        >
            <Tabs defaultValue="period">
                <Tabs.List mb={10}>
                    <Tabs.Tab value="period" >
                    Period Event
                    </Tabs.Tab>
                    <Tabs.Tab value="bedikah" >
                    New Bedikah
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="period">
                    <PeriodEventForm 
                        close={close}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="bedikah">
                    Bedikah Form
                </Tabs.Panel>
            </Tabs>
            
        </Modal>
    </>
    );
}

export default CalendarEventModal;