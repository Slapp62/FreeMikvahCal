import { Modal, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import PeriodStartForm from '../components/forms/PeriodStartForm';
import HefsekTaharaForm from '../components/forms/HefsekTaharaForm';
import BedikahForm from '../components/forms/BedikahForm';
import OtherEventForm from '../components/forms/OtherEventForm';

type ModalProps = {
    clicked: boolean;
    close: () => void;
    dateClicked: string;
};

function CalendarEventModal({clicked, close, dateClicked} : ModalProps) {
    const [closeOutside, setCloseOutside] = useState(false);

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
            title={`Add Event for ${new Date(dateClicked).toLocaleDateString()}`}
            closeOnClickOutside={closeOutside}
            centered
            size='md'
            radius="md"
        >
            <Tabs defaultValue="period">
                <Tabs.List mb={10}>
                    <Tabs.Tab value="period">
                        Period Start
                    </Tabs.Tab>
                    <Tabs.Tab value="hefsek">
                        Hefsek Tahara
                    </Tabs.Tab>
                    <Tabs.Tab value="bedikah">
                        Bedikah
                    </Tabs.Tab>
                    <Tabs.Tab value="other">
                        Other
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="period" pt="xs">
                    <PeriodStartForm
                        close={close}
                        dateClicked={dateClicked}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="hefsek" pt="xs">
                    <HefsekTaharaForm
                        close={close}
                        dateClicked={dateClicked}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="bedikah" pt="xs">
                    <BedikahForm
                        close={close}
                        dateClicked={dateClicked}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="other" pt="xs">
                    <OtherEventForm
                        close={close}
                        dateClicked={dateClicked}
                    />
                </Tabs.Panel>
            </Tabs>

        </Modal>
    </>
    );
}

export default CalendarEventModal;