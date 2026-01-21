import { Modal, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
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
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Delay enabling closeOnClickOutside to prevent accidental closes
    // when the modal is first opened (user's click to open might register as close)
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
        {dateClicked && (
            <Modal
                opened={clicked}
                onClose={close}
                title={`Add Event for ${new Date(dateClicked).toLocaleDateString()}`}
                closeOnClickOutside={closeOutside}
                centered
                size={isMobile ? 'md' : 'lg'}
                radius="md"
                fullScreen={isMobile}
            >
            <Tabs defaultValue="period" orientation="horizontal">
                <Tabs.List mb={10} grow={isMobile}>
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
                    />
                </Tabs.Panel>
            </Tabs>

        </Modal>
        )}
    </>
    );
}

export default CalendarEventModal;