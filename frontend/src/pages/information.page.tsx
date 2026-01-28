import { FC } from 'react';
import {
  Box,
  Container,
  Paper,
  Stack,
  Text,
  Title,
  Accordion,
  ThemeIcon,
  Group,
  Badge,
  Divider,
  useComputedColorScheme,
  Anchor,
  List,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconBook2, IconInfoCircle } from '../utils/icons';

const InformationPage: FC = () => {
  const computedColorScheme = useComputedColorScheme('light');
  const pageBg = computedColorScheme === 'light' ? 'white' : 'rocketBlack.8';

  return (
    <Box bg={pageBg} style={{ paddingBottom: '40px', minHeight: '100vh' }}>
      <Container size="lg" py="xl">
        {/* Hero Section */}
        <Paper shadow="sm" p="xl" radius="md" my="xl">
          <Stack gap="md">
            <Group gap="md">
              <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                <IconBook2 size={32} />
              </ThemeIcon>
              <div>
                <Title order={1}>Halachic Information Guide</Title>
                <Text c="dimmed" size="lg">
                  Understanding the Jewish laws, customs, and concepts used in FreeMikvahCal
                </Text>
              </div>
            </Group>

            <Divider my="sm" />

            <Text>
              This guide provides user-friendly explanations of all halachic (Jewish law) concepts,
              terms, laws, customs, and stringencies that FreeMikvahCal is based upon. Each section
              includes simple definitions, practical examples, and traditional sources where
              applicable.
            </Text>

            <Text size="sm" c="dimmed" fs="italic">
              <strong>Important Disclaimer:</strong> This information is provided for educational
              purposes only. For actual halachic decisions and personal guidance, please consult with
              a qualified Orthodox rabbi who is knowledgeable in the laws of family purity (Taharas
              HaMishpacha).
            </Text>
          </Stack>
        </Paper>

        {/* Main Content - Accordion Sections */}
        <Paper shadow="sm" p="xl" radius="md" my="xl">
          <Accordion variant="separated" radius="md" defaultValue="fundamental-concepts">
            {/* FUNDAMENTAL CONCEPTS */}
            <Accordion.Item value="fundamental-concepts">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Fundamental Concepts
                  </Text>
                  <Badge variant="light" color="purple">
                    7 Terms
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Niddah */}
                  <div>
                    <Title order={4} c="purple">
                      Niddah (נִדָּה)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The state a woman enters when she experiences
                      menstruation. During this time, certain restrictions apply according to Jewish law.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> When a woman sees blood at the beginning of her monthly
                      cycle, she enters the state of niddah. She tracks the exact time (day or night) when
                      this occurred.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Leviticus 15:19-24, Shulchan Aruch Yoreh De'ah 183-200
                    </Text>
                  </div>

                  <Divider />

                  {/* Hefsek Tahara */}
                  <div>
                    <Title order={4} c="purple">
                      Hefsek Tahara (הֶפְסֵק טָהֳרָה)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The "interruption of purity" - a special examination
                      performed when the menstrual flow has stopped to verify cleanliness. This marks the
                      transition from the niddah state to the beginning of the seven clean days.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> Sarah started her period on Monday night. By Saturday
                      afternoon (day 5), her flow has completely stopped. Before sunset on Saturday, she
                      performs a hefsek tahara examination. If it's clean, Saturday becomes her hefsek
                      tahara day, and she begins counting the seven clean days starting Sunday.
                    </Text>
                    <Text mt="xs">
                      <strong>Minimum Days:</strong> Most communities require at least 5 days from the
                      start of niddah before performing hefsek tahara, though this can range from 4-10 days
                      depending on custom. FreeMikvahCal allows you to set this preference.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 196:1-11, Mishnah Berurah
                    </Text>
                  </div>

                  <Divider />

                  {/* Shiva Nekiyim */}
                  <div>
                    <Title order={4} c="purple">
                      Shiva Nekiyim (שִׁבְעָה נְקִיִּים)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The "seven clean days" - a period of seven complete days
                      that a woman must count after her hefsek tahara, during which she must remain free of
                      any blood.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> If a woman performed her hefsek tahara on Saturday before
                      sunset, she begins counting her shiva nekiyim from Sunday (Day 1) through the
                      following Shabbos (Day 7). During these seven days, she performs examinations
                      (bedikot) to verify cleanliness.
                    </Text>
                    <Text mt="xs">
                      <strong>Important Note:</strong> If any blood is found during the shiva nekiyim, the
                      count must restart from the beginning after a new hefsek tahara.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Leviticus 15:28, Shulchan Aruch Yoreh De'ah 196:1
                    </Text>
                  </div>

                  <Divider />

                  {/* Bedikah */}
                  <div>
                    <Title order={4} c="purple">
                      Bedikah/Bedikot (בְּדִיקָה/בְּדִיקוֹת)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> Internal examinations performed during the shiva nekiyim
                      to verify that no blood is present. The plural is "bedikot."
                    </Text>
                    <Text mt="xs">
                      <strong>Requirement:</strong> A minimum of two bedikot are required during the shiva
                      nekiyim - one on the first day (morning or evening) and one on the seventh day
                      (morning or evening). Many women perform additional bedikot throughout the week.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>Results:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>Clean:</strong> No staining detected - the day counts toward the seven
                        </List.Item>
                        <List.Item>
                          <strong>Questionable:</strong> Uncertain result - should be shown to a rabbi
                        </List.Item>
                        <List.Item>
                          <strong>Not Clean:</strong> Blood detected - the count must restart from the
                          beginning
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> Rachel is on Day 4 of her shiva nekiyim. She performs a
                      bedikah in the morning and finds it completely clean. She records this in the app as
                      "Day 4 - Morning - Clean."
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 196:1-4
                    </Text>
                  </div>

                  <Divider />

                  {/* Mikvah */}
                  <div>
                    <Title order={4} c="purple">
                      Mikvah (מִקְוֶה)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> A ritual bath used for purification. After successfully
                      completing the seven clean days, a woman immerses in the mikvah to complete the
                      purification process.
                    </Text>
                    <Text mt="xs">
                      <strong>Timing:</strong> The mikvah visit occurs on the night after the seventh clean
                      day is completed. For example, if Day 7 ends on Thursday at sunset, the woman goes to
                      the mikvah on Thursday night.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> Leah completed her hefsek tahara on Sunday. She counts
                      Monday (Day 1) through Sunday (Day 7). On Sunday night, after the stars come out, she
                      goes to the mikvah.
                    </Text>
                    <Text mt="xs">
                      <strong>Special Considerations:</strong> FreeMikvahCal will alert you if your
                      calculated mikvah date falls on Friday night (Shabbos) or a Jewish holiday, as mikvah
                      availability may be affected.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Leviticus 15:28, Shulchan Aruch Yoreh De'ah 197-200
                    </Text>
                  </div>

                  <Divider />

                  {/* Onah */}
                  <div>
                    <Title order={4} c="purple">
                      Onah (עוֹנָה)
                    </Title>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>Definition:</strong> A halachic time period. Each 24-hour day is divided into
                        two onot (plural):
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>Day Onah (Onah Yom):</strong> From sunrise to sunset
                        </List.Item>
                        <List.Item>
                          <strong>Night Onah (Onah Laylah):</strong> From sunset to the next sunrise
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> If a woman's period starts at 2:00 PM on Tuesday (during
                      daylight), she experienced niddah during the "day onah" of Tuesday. If her period
                      started at 9:00 PM Tuesday night (after sunset), it was during the "night onah" that
                      spans Tuesday night into Wednesday morning.
                    </Text>
                    <Text mt="xs">
                      <strong>Importance:</strong> The specific onah when niddah begins is crucial for
                      calculating vest onot (anticipated future period times), as explained below.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 184:2
                    </Text>
                  </div>

                  <Divider />

                  {/* Zmanim */}
                  <div>
                    <Title order={4} c="purple">
                      Zmanim (זְמַנִּים)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The halachic times of day, particularly sunrise and
                      sunset, which define the boundaries between day and night onot.
                    </Text>
                    <Text mt="xs">
                      <strong>Why Location Matters:</strong> Sunrise and sunset times vary based on your
                      geographic location. This is why FreeMikvahCal asks for your timezone and location -
                      to calculate the exact times for your area.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> In Jerusalem in January, sunrise might be at 6:30 AM and
                      sunset at 5:00 PM. In New York on the same day, sunrise might be at 7:15 AM and
                      sunset at 4:45 PM. These differences affect when the day and night onot begin and
                      end.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Calculated using astronomical data and the Hebcal library
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* VEST ONOT (ANTICIPATED PERIOD TIMES) */}
            <Accordion.Item value="vest-onot">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Vest Onot - Anticipated Period Times
                  </Text>
                  <Badge variant="light" color="purple">
                    5 Terms
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Introduction */}
                  <div>
                    <Text>
                      <strong>What are Vest Onot?</strong> These are times when a woman anticipates her
                      next period might arrive, based on patterns from previous cycles. During these times,
                      certain precautions are observed according to Jewish law.
                    </Text>
                    <Text mt="xs">
                      FreeMikvahCal automatically calculates three types of vest onot based on your cycle
                      history:
                    </Text>
                  </div>

                  <Divider />

                  {/* Veset HaChodesh */}
                  <div>
                    <Title order={4} c="purple">
                      Veset HaChodesh (וֶסֶת הַחֹדֶשׁ)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The "monthly veset" - the same Hebrew (lunar) calendar
                      date when the previous period began.
                    </Text>
                    <Text mt="xs">
                      <strong>How It's Calculated:</strong> If your last period began on the 15th day of
                      the Hebrew month of Nisan, your veset hachodesh for the next month would be the 15th
                      of Iyar (the following Hebrew month).
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> Miriam's period started on 18 Tevet (January 10, 2026 on
                      the regular calendar). Her veset hachodesh will be 18 Shevat (approximately February
                      8, 2026).
                    </Text>
                    <Text mt="xs">
                      <strong>Time (Onah):</strong> If the previous period began during a day onah, the
                      veset hachodesh is observed during the day onah. If it began during a night onah, the
                      veset is observed during the night onah.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 189:3
                    </Text>
                  </div>

                  <Divider />

                  {/* Haflagah */}
                  <div>
                    <Title order={4} c="purple">
                      Haflagah / Haflagah Veset (הַפְלָגָה)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The "interval veset" - the same number of days between
                      cycles as the previous interval.
                    </Text>
                    <Text mt="xs">
                      <strong>How It's Calculated:</strong> Count the number of days from the start of the
                      previous period to the start of the current period. This number is the "haflagah."
                      The next veset is anticipated that same number of days from the current period's
                      start.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> Rivka's last period started on January 1st. Her current
                      period started on January 29th - a gap of 28 days. Her haflagah veset will be 28 days
                      after January 29th, which is February 26th.
                    </Text>
                    <Text mt="xs">
                      <strong>Time (Onah):</strong> The haflagah veset is observed during the same onah as
                      the original period.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 189:4-13
                    </Text>
                  </div>

                  <Divider />

                  {/* Onah Beinonit */}
                  <div>
                    <Title order={4} c="purple">
                      Onah Beinonit (עוֹנָה בֵּינוֹנִית)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The "average onah" - a fixed 30-day calculation where day
                      29 (or the night leading into day 30, depending on the original onah) is observed.
                    </Text>
                    <Text mt="xs">
                      <strong>How It's Calculated:</strong> Regardless of actual cycle length, every woman
                      observes day 29-30 from the start of her period as a vest onot.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> Chana's period started on the day onah of March 1st. Her
                      onah beinonit will be on the day onah of March 29th (29 days later). If her period
                      started during the night onah, she would observe the night onah leading into day 30.
                    </Text>
                    <Text mt="xs">
                      <strong>Why "Beinonit" (Average)?</strong> This represents the "average" cycle length
                      that was common historically. The 29-30 day period is observed by all women,
                      regardless of their individual cycle patterns.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 189:14
                    </Text>
                  </div>

                  <Divider />

                  {/* Cycle Length */}
                  <div>
                    <Title order={4} c="purple">
                      Cycle Length (אֹרֶךְ הַמַּחְזוֹר)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The total number of days from the start of one period to
                      the immersion in the mikvah for that cycle.
                    </Text>
                    <Text mt="xs">
                      <strong>How It's Calculated:</strong> Period start + minimum niddah days (typically 5)
                      + 7 clean days = approximately 12-13 days minimum, though it can be longer if the
                      flow continues beyond the minimum.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> If a period starts on Day 1, hefsek tahara is on Day 5, the
                      seven clean days are Days 6-12, and mikvah is on night 12/13.
                    </Text>
                    <Text mt="xs">
                      FreeMikvahCal tracks this automatically to help you understand your cycle patterns.
                    </Text>
                  </div>

                  <Divider />

                  {/* Important Note */}
                  <div>
                    <Text fw={600}>Important Note About Vest Onot:</Text>
                    <Text mt="xs">
                      FreeMikvahCal automatically calculates and displays all your vest onot on your
                      calendar. These appear as special markers so you know when to observe these times.
                      The app considers your specific onah (day or night) when calculating each veset.
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* HALACHIC STRINGENCIES (CHUMRAS) */}
            <Accordion.Item value="stringencies">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Halachic Stringencies (Chumras)
                  </Text>
                  <Badge variant="light" color="purple">
                    4 Optional Practices
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Introduction */}
                  <div>
                    <Text>
                      <strong>What are Chumras?</strong> These are optional stringencies (extra-strict
                      observances) that some communities or individuals adopt beyond the basic halachic
                      requirements. FreeMikvahCal allows you to enable or disable these in your settings.
                    </Text>
                    <Text mt="xs" fs="italic" c="dimmed">
                      Note: Whether to observe these stringencies should be discussed with your rabbi or
                      teacher.
                    </Text>
                  </div>

                  <Divider />

                  {/* Ohr Zaruah */}
                  <div>
                    <Title order={4} c="purple">
                      Ohr Zaruah - Preceding Onah (אור זרוע)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> A stringency to also observe the onah immediately
                      preceding each vest onot.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>How It Works:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          If your veset is during a <strong>day onah</strong>, you also observe the{' '}
                          <strong>night onah</strong> before it
                        </List.Item>
                        <List.Item>
                          If your veset is during a <strong>night onah</strong>, you also observe the{' '}
                          <strong>day onah</strong> of the same calendar day (which comes before the night)
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> Sarah's veset hachodesh is during the day onah of February
                      15th (sunrise to sunset). With the Ohr Zaruah stringency enabled, she would also
                      observe the night onah from February 14th sunset to February 15th sunrise.
                    </Text>
                    <Text mt="xs">
                      <strong>When Enabled:</strong> FreeMikvahCal adds these preceding onot to your
                      calendar for all three vest types (veset hachodesh, haflagah, and onah beinonit).
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Ohr Zaruah (13th century halachic authority), cited in Shach
                      Yoreh De'ah 184:7
                    </Text>
                  </div>

                  <Divider />

                  {/* Kreisi Upleisi */}
                  <div>
                    <Title order={4} c="purple">
                      Kreisi Upleisi - Opposite Onah (כְּרֵתִי וּפְלֵתִי)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> A stringency to observe the opposite onah on the same
                      Hebrew calendar day as the onah beinonit.
                    </Text>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>How It Works:</strong> This applies specifically to the onah beinonit (30-day
                        veset):
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          If your onah beinonit is the <strong>day onah</strong> of day 30, you also
                          observe the <strong>night onah</strong> of the same Hebrew day (the night leading
                          into day 30)
                        </List.Item>
                        <List.Item>
                          If your onah beinonit is the <strong>night onah</strong> leading into day 30, you
                          also observe the <strong>day onah</strong> of day 30
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> If your period began during the day onah, your onah
                      beinonit is day 29 (the day onah). With Kreisi Upleisi enabled, you would also
                      observe the night onah of the same Hebrew day (the night leading into day 29).
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Kreisi Upleisi (responsa by Rabbi Yonasan Eybeschutz, 18th
                      century), cited in Pitchei Teshuva Yoreh De'ah 184:8
                    </Text>
                  </div>

                  <Divider />

                  {/* Chasam Sofer */}
                  <div>
                    <Title order={4} c="purple">
                      Chasam Sofer - Day 31 (חתם סופר)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> A stringency to observe day 30 (with matching onah) in
                      addition to the standard onah beinonit on day 29.
                    </Text>
                    <Text mt="xs">
                      <strong>How It Works:</strong> While the basic onah beinonit is observed on day 29,
                      this stringency adds an additional observation on day 30 in the same onah type as the
                      original period.
                    </Text>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>Example:</strong> If Rachel's period started during the day onah on March
                        1st:
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>Standard onah beinonit: day onah of March 29th (day 29)</List.Item>
                        <List.Item>
                          With Chasam Sofer: Also observes the day onah of March 30th (day 30)
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Why "Day 31"?</strong> This is sometimes called "Beinonit 31" because when
                      counting inclusively from day 1, day 30 represents the 31st onah period.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Chasam Sofer (Rabbi Moshe Sofer, 19th century) on Yoreh
                      De'ah 189
                    </Text>
                  </div>

                  <Divider />

                  {/* Minimum Niddah Days */}
                  <div>
                    <Title order={4} c="purple">
                      Minimum Niddah Days (מספר ימים מינימלי)
                    </Title>
                    <Text mt="xs">
                      <strong>Definition:</strong> The minimum number of days a woman must wait from the
                      start of her period before she can perform the hefsek tahara examination.
                    </Text>
                    <Text mt="xs">
                      <strong>Standard Practice:</strong> The most common custom is 5 complete days,
                      meaning the hefsek tahara is performed on day 5 or later.
                    </Text>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>Range of Customs:</strong> FreeMikvahCal allows you to set this between 4-10
                        days, depending on your community's custom or your rabbi's guidance.
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>4 days:</strong> The absolute halachic minimum (rare)
                        </List.Item>
                        <List.Item>
                          <strong>5 days:</strong> The most widespread custom (Ashkenazi and many Sephardi
                          communities)
                        </List.Item>
                        <List.Item>
                          <strong>7+ days:</strong> Some stringent customs or special medical situations
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> If Devorah's period started Monday night and she follows
                      the 5-day minimum, she cannot perform hefsek tahara before Saturday. If she follows a
                      7-day minimum, she must wait until Monday.
                    </Text>
                    <Text mt="xs" size="sm" c="dimmed">
                      <strong>Source:</strong> Shulchan Aruch Yoreh De'ah 196:11, based on Talmud Niddah
                      66a
                    </Text>
                  </div>

                  <Divider />

                  {/* How to Set */}
                  <div>
                    <Text fw={600}>How to Configure Stringencies:</Text>
                    <Text mt="xs">
                      All of these stringencies can be enabled or disabled in your User Settings. When you
                      change a setting, FreeMikvahCal can recalculate your existing cycles to reflect the
                      new preferences.
                    </Text>
                    <Text mt="xs" c="dimmed" size="sm" fs="italic">
                      Important: Consult with your rabbi or teacher before enabling or disabling these
                      stringencies.
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* HEBREW CALENDAR & LOCATION */}
            <Accordion.Item value="hebrew-calendar">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Hebrew Calendar & Location
                  </Text>
                  <Badge variant="light" color="purple">
                    3 Concepts
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Hebrew Calendar */}
                  <div>
                    <Title order={4} c="purple">
                      Hebrew Calendar Integration
                    </Title>
                    <Text mt="xs">
                      <strong>What It Is:</strong> The Hebrew calendar is a lunar calendar (based on the
                      moon's cycles) used in Judaism. Each month begins with the new moon, and months are
                      approximately 29-30 days long.
                    </Text>
                    <Text mt="xs">
                      <strong>Why It Matters:</strong> The veset hachodesh (monthly veset) is calculated
                      using the Hebrew date, not the regular (Gregorian) calendar date. This means your
                      veset will occur on the same Hebrew date each month, even though this corresponds to
                      different Gregorian dates.
                    </Text>
                    <Text mt="xs">
                      <strong>Example:</strong> If your period began on 15 Nisan (which might be April 3rd
                      in 2026), your next veset hachodesh will be 15 Iyar (approximately May 3rd).
                      FreeMikvahCal handles all these conversions automatically.
                    </Text>
                    <Text mt="xs">
                      <strong>Hebrew Months:</strong> Nissan, Iyar, Sivan, Tammuz, Av, Elul, Tishrei,
                      Cheshvan, Kislev, Tevet, Shevat, Adar (Adar I and Adar II in leap years)
                    </Text>
                  </div>

                  <Divider />

                  {/* Jewish Holidays */}
                  <div>
                    <Title order={4} c="purple">
                      Jewish Holidays
                    </Title>
                    <Text mt="xs">
                      <strong>Why We Track Them:</strong> FreeMikvahCal alerts you if your calculated
                      mikvah date falls on a Friday night (Shabbos) or a Jewish holiday, as this may affect
                      mikvah availability.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>Holidays Tracked:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>Shabbos (every Friday night/Saturday)</List.Item>
                        <List.Item>Rosh Hashanah</List.Item>
                        <List.Item>Yom Kippur</List.Item>
                        <List.Item>Sukkot</List.Item>
                        <List.Item>Shemini Atzeret / Simchat Torah</List.Item>
                        <List.Item>Pesach (Passover)</List.Item>
                        <List.Item>Shavuot</List.Item>
                        <List.Item>And other major holidays</List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Note:</strong> Many mikvahs remain open on these nights with modified hours.
                      The app simply alerts you so you can verify availability in advance.
                    </Text>
                  </div>

                  <Divider />

                  {/* Location & Timezone */}
                  <div>
                    <Title order={4} c="purple">
                      Location & Timezone-Aware Calculations
                    </Title>
                    <Text mt="xs">
                      <strong>Why Location Matters:</strong> Because onot (day and night periods) are
                      defined by sunrise and sunset, and these times vary based on where you are in the
                      world, FreeMikvahCal needs to know your location to calculate accurately.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>What We Track:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>Timezone:</strong> Ensures all dates and times are shown in your local
                          time
                        </List.Item>
                        <List.Item>
                          <strong>Geographic coordinates:</strong> Used to calculate precise sunrise and
                          sunset times for your location
                        </List.Item>
                        <List.Item>
                          <strong>Daylight Saving Time:</strong> Automatically adjusted throughout the year
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> A woman in New York has different sunrise/sunset times than
                      a woman in Los Angeles or Jerusalem. If all three women's periods started at "2:00 PM
                      local time," the app needs to know each location to correctly determine which onah
                      that represents.
                    </Text>
                    <Text mt="xs">
                      <strong>Privacy:</strong> Your location data is stored securely and used only for
                      these halachic calculations. It is never shared with third parties.
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* CYCLE TRACKING FEATURES */}
            <Accordion.Item value="tracking-features">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Cycle Tracking Features
                  </Text>
                  <Badge variant="light" color="purple">
                    5 Features
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Cycle Status */}
                  <div>
                    <Title order={4} c="purple">
                      Cycle Status Progression
                    </Title>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>How Cycles Progress:</strong> Each cycle moves through specific stages:
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>Niddah:</strong> From period start until hefsek tahara
                        </List.Item>
                        <List.Item>
                          <strong>Shiva Nekiyim:</strong> From hefsek tahara through the seven clean days
                        </List.Item>
                        <List.Item>
                          <strong>Completed:</strong> After mikvah immersion
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      FreeMikvahCal tracks your current status and guides you through each stage.
                    </Text>
                  </div>

                  <Divider />

                  {/* Period Voiding */}
                  <div>
                    <Title order={4} c="purple">
                      Period Voiding
                    </Title>
                    <Text mt="xs">
                      <strong>What It Is:</strong> If a bedikah during the shiva nekiyim shows blood (not
                      clean), the entire seven-day count must restart. This is called "voiding" the period.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>How It Works:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          When you record a "not clean" bedikah result, FreeMikvahCal marks the cycle as
                          voided
                        </List.Item>
                        <List.Item>
                          The app saves the original dates for your records but updates the cycle to
                          restart the count
                        </List.Item>
                        <List.Item>
                          A new hefsek tahara must be performed (after the flow stops again)
                        </List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Example:</strong> Sarah was on Day 5 of her shiva nekiyim when she found
                      blood during a bedikah. Her count is voided, and she must wait for the flow to stop,
                      perform a new hefsek tahara, and begin counting seven clean days again.
                    </Text>
                  </div>

                  <Divider />

                  {/* Reminders */}
                  <div>
                    <Title order={4} c="purple">
                      Email Reminders
                    </Title>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>What's Available:</strong> FreeMikvahCal can send you optional email
                        reminders for:
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>When you can perform hefsek tahara (after minimum niddah days)</List.Item>
                        <List.Item>During shiva nekiyim (to remind you to do bedikot)</List.Item>
                        <List.Item>Before mikvah night</List.Item>
                        <List.Item>Before vest onot days</List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      <strong>Privacy:</strong> Reminders can be configured in your settings. All emails
                      are private and use discreet language.
                    </Text>
                  </div>

                  <Divider />

                  {/* Community Traditions */}
                  <div>
                    <Title order={4} c="purple">
                      Halachic Custom (Minhagim)
                    </Title>
                    <Text mt="xs">
                      <strong>What It Is:</strong> Different Jewish communities (Ashkenazi, Sephardi,
                      Chabad, etc.) may have varying customs regarding tahara laws.
                    </Text>
                    <Text mt="xs">
                      <strong>How We Use It:</strong> You can specify your halachic custom/community background
                      in your profile. This helps FreeMikvahCal provide more tailored guidance and defaults
                      that match your community's customs.
                    </Text>
                    <Box mt="xs">
                      <Text component="span"><strong>Options:</strong></Text>
                      <List withPadding mt="xs">
                        <List.Item>Ashkenazi (European heritage)</List.Item>
                        <List.Item>Sephardi (Spanish/Mediterranean heritage)</List.Item>
                        <List.Item>Chabad (Chabad-Lubavitch custom)</List.Item>
                        <List.Item>Manual Setting (Custom preferences)</List.Item>
                      </List>
                    </Box>
                  </div>

                  <Divider />

                  {/* Calendar Integration */}
                  <div>
                    <Title order={4} c="purple">
                      Calendar Visualization
                    </Title>
                    <Box mt="xs">
                      <Text component="span">
                        <strong>What You See:</strong> FreeMikvahCal displays all your important dates on an
                        easy-to-read calendar:
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>Period start dates (niddah onah)</List.Item>
                        <List.Item>Hefsek tahara date</List.Item>
                        <List.Item>Each day of shiva nekiyim (1-7)</List.Item>
                        <List.Item>Mikvah night</List.Item>
                        <List.Item>All vest onot (with color coding)</List.Item>
                        <List.Item>Jewish holidays</List.Item>
                      </List>
                    </Box>
                    <Text mt="xs">
                      Everything is color-coded and clearly labeled so you can see your cycle status at a
                      glance.
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* ADDITIONAL RESOURCES */}
            <Accordion.Item value="resources">
              <Accordion.Control icon={<IconInfoCircle size={20} />}>
                <Group gap="xs">
                  <Text fw={600} size="lg">
                    Additional Resources & Sources
                  </Text>
                  <Badge variant="light" color="purple">
                    Learn More
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xl">
                  {/* Primary Sources */}
                  <div>
                    <Title order={4} c="purple">
                      Primary Halachic Sources
                    </Title>
                    <Box mt="xs">
                      <List withPadding>
                        <List.Item>
                          <strong>Torah:</strong> Leviticus (Vayikra) chapters 12, 15, 18, and 20
                        </List.Item>
                        <List.Item>
                          <strong>Talmud:</strong> Tractate Niddah
                        </List.Item>
                        <List.Item>
                          <strong>Shulchan Aruch:</strong> Yoreh De'ah, sections 183-200 (laws of family
                          purity)
                        </List.Item>
                        <List.Item>
                          <strong>Commentaries:</strong> Shach, Taz, Aruch HaShulchan, Mishnah Berurah
                        </List.Item>
                      </List>
                    </Box>
                  </div>

                  <Divider />

                  {/* Modern Resources */}
                  <div>
                    <Title order={4} c="purple">
                      Recommended Educational Resources
                    </Title>
                    <Box mt="xs">
                      <List withPadding>
                        <List.Item>
                          <strong>Taharat HaMishpacha classes:</strong> Many communities offer classes for
                          women on these laws
                        </List.Item>
                        <List.Item>
                          <strong>Nishmat (Yoetzet Halacha program):</strong>{' '}
                          <Anchor href="https://www.yoatzot.org" target="_blank">
                            yoatzot.org
                          </Anchor>{' '}
                          - Women trained to answer halachic questions
                        </List.Item>
                        <List.Item>
                          <strong>Kallah teacher:</strong> Before marriage, women typically study these laws
                          with a designated teacher
                        </List.Item>
                        <List.Item>
                          <strong>Your local rabbi:</strong> For personalized halachic guidance
                        </List.Item>
                      </List>
                    </Box>
                  </div>

                  <Divider />

                  {/* Technical Resources */}
                  <div>
                    <Title order={4} c="purple">
                      Technical Implementation
                    </Title>
                    <Box mt="xs">
                      <Text component="span">
                        FreeMikvahCal uses the following technical resources to ensure accuracy:
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>
                          <strong>Hebcal:</strong> Open-source library for Hebrew calendar calculations and
                          zmanim (halachic times)
                        </List.Item>
                        <List.Item>
                          <strong>Astronomical algorithms:</strong> Precise sunrise/sunset calculations based
                          on geographic coordinates
                        </List.Item>
                        <List.Item>
                          <strong>IANA Timezone Database:</strong> Accurate timezone and daylight saving time
                          handling
                        </List.Item>
                      </List>
                    </Box>
                  </div>

                  <Divider />

                  {/* Disclaimer */}
                  <div>
                    <Title order={4} c="purple">
                      Important Disclaimer
                    </Title>
                    <Text mt="xs" c="dimmed">
                      While FreeMikvahCal is designed to help you track and calculate dates according to
                      established halachic principles, it is not a substitute for consultation with a
                      qualified rabbi. Every woman's situation is unique, and questions frequently arise
                      that require personal guidance.
                    </Text>
                    <Box mt="xs">
                      <Text component="span" c="dimmed">
                        <strong>When to consult a rabbi:</strong>
                      </Text>
                      <List withPadding mt="xs">
                        <List.Item>Before beginning to observe these laws</List.Item>
                        <List.Item>When choosing which stringencies to observe</List.Item>
                        <List.Item>If you see any questionable staining during bedikot</List.Item>
                        <List.Item>If you have medical conditions affecting your cycle</List.Item>
                        <List.Item>Whenever you have doubts or questions about proper practice</List.Item>
                      </List>
                    </Box>
                    <Text mt="xs" c="dimmed">
                      FreeMikvahCal is a tool to assist you in keeping track of dates and calculations,
                      but it cannot replace the wisdom and guidance of a knowledgeable rabbi or yoetzet
                      halacha.
                    </Text>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Paper>

        {/* Footer CTA */}
        <Paper shadow="sm" p="xl" radius="md" my="xl" bg="light-dark(var(--mantine-color-pink-0), var(--mantine-color-dark-7))">
          <Stack gap="md" align="center">
            <Text size="lg" fw={600} ta="center">
              Questions or Need Clarification?
            </Text>
            <Text ta="center" c="dimmed">
              If you have questions about how to use FreeMikvahCal or need further explanation of any
              concept, please don't hesitate to reach out.
            </Text>
            <Group gap="md">
              <Anchor component={Link} to="/about#contact">
                <Text size="sm" c="purple" fw={600}>
                  Contact Us
                </Text>
              </Anchor>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default InformationPage;
