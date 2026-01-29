import { useState, useEffect } from 'react';
import { Alert, Container } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import './AnnouncementBanner.css';

interface AnnouncementBannerProps {
  message: string;
  storageKey?: string;
}

export function AnnouncementBanner({
  message,
  storageKey = 'announcement-banner-dismissed'
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this announcement
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="announcement-banner-wrapper">
      <Container size="100%" className="announcement-banner-container">
        <Alert
          variant="light"
          icon={<IconInfoCircle />}
          classNames={{ root: 'announcement-banner-alert' }}
          withCloseButton
          closeButtonLabel="Dismiss announcement"
          onClose={handleClose}
        >
          {message}
        </Alert>
      </Container>
    </div>
  );
}
