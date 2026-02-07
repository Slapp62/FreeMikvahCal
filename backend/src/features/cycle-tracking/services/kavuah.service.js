const { DateTime } = require('luxon');
const { getHebrewDateForTimestamp } = require('../../../shared/utils/hebrew-datetime');

const getOnahTypeForPeriod = (period) => {
  if (!period?.niddahOnah?.start || !period?.niddahOnah?.end) return null;
  const startDate = new Date(period.niddahOnah.start).toDateString();
  const endDate = new Date(period.niddahOnah.end).toDateString();
  return startDate === endDate ? 'day' : 'night';
};

const buildHebrewDateFields = (timestamp, location) => {
  const result = getHebrewDateForTimestamp(timestamp, location);
  const hdate = result?.hebrewDate;
  if (!hdate) return null;
  return {
    day: hdate.getDate(),
    month: hdate.getMonth(),
    year: hdate.getFullYear(),
    monthName: hdate.getMonthName(),
    dateString: hdate.toString()
  };
};

const getLocalDateParts = (date, timezone) => {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return { year: dt.year, month: dt.month, day: dt.day };
};

const toUtcDateFromParts = ({ year, month, day }) => new Date(Date.UTC(year, month - 1, day));

const calculateInclusiveIntervalDays = (currentPeriod, previousPeriod) => {
  if (!currentPeriod?.niddahOnah?.start || !previousPeriod?.niddahOnah?.start) return null;
  const currentTz = currentPeriod.calculatedInTimezone;
  const previousTz = previousPeriod.calculatedInTimezone;
  if (!currentTz || !previousTz) return null;

  const currentParts = getLocalDateParts(new Date(currentPeriod.niddahOnah.start), currentTz);
  const previousParts = getLocalDateParts(new Date(previousPeriod.niddahOnah.start), previousTz);
  const currentDateUtc = toUtcDateFromParts(currentParts);
  const previousDateUtc = toUtcDateFromParts(previousParts);
  const diffDays = Math.round((currentDateUtc - previousDateUtc) / 86400000);
  if (diffDays < 0) return null;
  return diffDays + 1;
};

const resolveOnahType = (period) => period?.onahType || getOnahTypeForPeriod(period);

const checkKavuahChodesh = (periods) => {
  if (!Array.isArray(periods) || periods.length < 3) return false;
  const [current, prev1, prev2] = periods;
  if (!current?.hebrewDate?.day || !prev1?.hebrewDate?.day || !prev2?.hebrewDate?.day) return false;
  const currentOnah = resolveOnahType(current);
  const prev1Onah = resolveOnahType(prev1);
  const prev2Onah = resolveOnahType(prev2);
  if (!currentOnah || !prev1Onah || !prev2Onah) return false;

  const sameDay = current.hebrewDate.day === prev1.hebrewDate.day && current.hebrewDate.day === prev2.hebrewDate.day;
  const sameOnah = currentOnah === prev1Onah && currentOnah === prev2Onah;
  return sameDay && sameOnah;
};

const checkKavuahHaflagah = (periods) => {
  if (!Array.isArray(periods) || periods.length < 4) return { isKavuah: false, interval: null };
  const [current, prev1, prev2, prev3] = periods;
  const currentOnah = resolveOnahType(current);
  const prev1Onah = resolveOnahType(prev1);
  const prev2Onah = resolveOnahType(prev2);
  if (!currentOnah || !prev1Onah || !prev2Onah) return { isKavuah: false, interval: null };

  const sameOnah = currentOnah === prev1Onah && currentOnah === prev2Onah;
  if (!sameOnah) return { isKavuah: false, interval: null };

  const i1 = calculateInclusiveIntervalDays(current, prev1);
  const i2 = calculateInclusiveIntervalDays(prev1, prev2);
  const i3 = calculateInclusiveIntervalDays(prev2, prev3);
  if (!i1 || !i2 || !i3) return { isKavuah: false, interval: null };
  const sameInterval = i1 === i2 && i1 === i3;
  return { isKavuah: sameInterval, interval: sameInterval ? i1 : null };
};

const determineKavuahStatus = (periods) => {
  if (checkKavuahChodesh(periods)) {
    return { type: 'chodesh' };
  }
  const haflagahResult = checkKavuahHaflagah(periods);
  if (haflagahResult.isKavuah) {
    return { type: 'haflagah', interval: haflagahResult.interval };
  }
  return { type: null };
};

module.exports = {
  getOnahTypeForPeriod,
  buildHebrewDateFields,
  calculateInclusiveIntervalDays,
  checkKavuahChodesh,
  checkKavuahHaflagah,
  determineKavuahStatus
};
