import { ActionIcon, Badge, Group, Paper, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import { HDate } from '@hebcal/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { ICalendarEvent } from '../../Types_Interfaces';

type SidebarItem = {
  id: string;
  groupID: string;
  classNames: string[];
  title: string;
  start: Date;
  hebrewDate: string;
  gregorianDate: string;
  onahLabel: 'Day Onah' | 'Night Onah';
  startTime: string;
};

type CalendarSidebarProps = {
  events: ICalendarEvent[];
  isDesktop: boolean;
  expanded: boolean;
  selectedEventId: string | null;
  onToggleExpanded: () => void;
  onSelectEvent: (event: ICalendarEvent) => void;
};

const TARGET_CLASS_NAMES = new Set([
  'vest-onah',
  'niddah-start',
  'period-start',
  'veset-hachodesh',
  'haflagah',
  'onah-beinonit',
  'onah-beinonit-kreisi',
  'onah-beinonit-sofer',
  'kavuah',
  'kavuah-chodesh',
  'kavuah-haflagah',
  'ohr-zaruah'
]);

const parseClassNames = (className?: string | string[]): string[] => {
  if (!className) return [];
  if (Array.isArray(className)) return className;
  return className.split(' ').filter(Boolean);
};

const cleanEventTitle = (title: string): string => (
  title
    .replaceAll('🩸', '')
    .replaceAll('📅', '')
    .replaceAll('📏', '')
    .replaceAll('🔄', '')
    .replaceAll('⏱️', '')
    .replaceAll('📌', '')
    .trim()
);

const toSidebarItem = (event: ICalendarEvent): SidebarItem | null => {
  const classNames = parseClassNames(event.className);
  const isTarget = classNames.some((className) => TARGET_CLASS_NAMES.has(className));
  if (!isTarget) return null;

  const start = new Date(event.start);
  if (Number.isNaN(start.getTime())) return null;

  const onahEndValue = event.extendedProps?.onahEnd ?? event.end;
  const onahEnd = onahEndValue ? new Date(onahEndValue) : start;
  const isDayOnah = start.getFullYear() === onahEnd.getFullYear() &&
    start.getMonth() === onahEnd.getMonth() &&
    start.getDate() === onahEnd.getDate();

  const computedHebrew = new HDate(start);
  const hebrewDate = event.extendedProps?.hebrewDate || `${computedHebrew.getDate()} ${computedHebrew.getMonthName()} ${computedHebrew.getFullYear()}`;

  return {
    id: event.id,
    groupID: event.groupID || event.id.split('-')[0],
    classNames,
    title: cleanEventTitle(event.title),
    start,
    hebrewDate,
    gregorianDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    onahLabel: isDayOnah ? 'Day Onah' : 'Night Onah',
    startTime: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  };
};

export default function CalendarSidebar({
  events,
  isDesktop,
  expanded,
  selectedEventId,
  onToggleExpanded,
  onSelectEvent
}: CalendarSidebarProps) {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const sidebarItemsByPeriod = events
    .map((event) => ({ event, item: toSidebarItem(event) }))
    .filter((entry): entry is { event: ICalendarEvent; item: SidebarItem } => Boolean(entry.item))
    .sort((a, b) => a.item.start.getTime() - b.item.start.getTime())
    .reduce((acc, entry) => {
      if (!acc.has(entry.item.groupID)) {
        acc.set(entry.item.groupID, []);
      }
      acc.get(entry.item.groupID)!.push(entry);
      return acc;
    }, new Map<string, Array<{ event: ICalendarEvent; item: SidebarItem }>>());

  const sidebarGroups = Array.from(sidebarItemsByPeriod.entries())
    .map(([groupID, groupItems]) => {
      const sortedItems = [...groupItems].sort((a, b) => a.item.start.getTime() - b.item.start.getTime());
      const periodStartItem = sortedItems.find((entry) =>
        entry.item.classNames.includes('niddah-start') || entry.item.classNames.includes('period-start')
      ) || sortedItems[0];

      return {
        groupID,
        periodStartItem,
        items: sortedItems
      };
    })
    .sort((a, b) => a.periodStartItem.item.start.getTime() - b.periodStartItem.item.start.getTime());

  const totalItems = sidebarGroups.reduce((sum, group) => sum + group.items.length, 0);

  const sidebarWidth = isDesktop ? (expanded ? 340 : 72) : '100%';

  return (
    <Paper withBorder radius="md" p="sm" style={{ width: sidebarWidth, minWidth: isDesktop ? sidebarWidth : undefined }}>
      <Group justify={expanded || !isDesktop ? 'space-between' : 'center'} mb={expanded || !isDesktop ? 'xs' : 0}>
        {(expanded || !isDesktop) && (
          <Group gap="xs">
            <Text fw={600} size="sm">Period and Onah Events</Text>
            <Badge variant="light">{totalItems}</Badge>
          </Group>
        )}

        {isDesktop && (
          <ActionIcon variant="subtle" onClick={onToggleExpanded} aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}>
            {expanded ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
        )}
      </Group>

      {(!isDesktop || expanded) && (
        <ScrollArea h={600} offsetScrollbars>
          <Stack gap="xs">
            {sidebarGroups.length === 0 && (
              <Text size="sm" c="dimmed">No period or onah events yet.</Text>
            )}

            {sidebarGroups.map((group) => (
              <Paper key={group.groupID} withBorder radius="sm" p={6}>
                <Stack gap={6}>
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={600} size="xs">
                      Period: {group.periodStartItem.item.gregorianDate}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {group.periodStartItem.item.hebrewDate}
                    </Text>
                  </Group>

                  <Stack gap={4}>
                    {group.items.map(({ event, item }) => (
                      <UnstyledButton
                        key={item.id}
                        onClick={() => onSelectEvent(event)}
                        onMouseEnter={() => setHoveredEventId(item.id)}
                        onMouseLeave={() => setHoveredEventId((prev) => (prev === item.id ? null : prev))}
                        style={{
                          border: item.id === selectedEventId ? '1px solid var(--mantine-color-pink-6)' : '1px solid var(--mantine-color-gray-3)',
                          borderRadius: 6,
                          padding: '4px 6px',
                          background: item.id === selectedEventId
                            ? 'var(--mantine-color-pink-0)'
                            : (hoveredEventId === item.id ? 'var(--mantine-color-gray-0)' : 'transparent'),
                          textAlign: 'left'
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap" gap={6}>
                          <Text size="xs" fw={600} truncate style={{ flex: 1 }}>
                            {item.title}
                          </Text>
                          <Badge size="xs" variant="light">{item.onahLabel === 'Day Onah' ? 'Day' : 'Night'}</Badge>
                          <Text size="xs" c="dimmed">{item.startTime}</Text>
                        </Group>
                      </UnstyledButton>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Paper>
  );
}
