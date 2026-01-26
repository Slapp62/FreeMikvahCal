import { useState, useEffect } from 'react';
import { ActionIcon, Paper, Text, Button, Group } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import './KofiDonationPopup.css';

export function KofiDonationPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the popup in this session
    const dismissed = sessionStorage.getItem('kofi-popup-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('kofi-popup-dismissed', 'true');
  };

  const handleDonate = () => {
    window.open('https://ko-fi.com/simchalapp', '_blank', 'noopener,noreferrer');
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <Paper
      className="kofi-donation-popup"
      shadow="lg"
      p="md"
      radius="md"
      withBorder
    >
      <ActionIcon
        className="kofi-close-button"
        onClick={handleClose}
        variant="subtle"
        color="gray"
        size="sm"
        aria-label="Close donation popup"
      >
        <IconX size={16} />
      </ActionIcon>

      <Group gap="xs" mb="sm" align="center">
        <svg
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"
            fill="#794bc4"
          />
        </svg>
        <Text size="sm" fw={600} c="#794bc4">
          Support FreeMikvahCal
        </Text>
      </Group>

      <Text size="xs" mb="md" className='cta-text'>
        This site is free to use, but not free to maintain. Help support the work we do!
      </Text>

      <Button
        fullWidth
        size="xs"
        style={{ backgroundColor: '#794bc4' }}
        onClick={handleDonate}
      >
        Donate on Ko-fi
      </Button>
    </Paper>
  );
}
