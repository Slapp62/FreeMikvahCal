const { Location, Zmanim } = require('@hebcal/core');
const Profiles = require('../../../user-profile/models/profile.model');
const { getPeriodCalculationLocation } = require('../core/cycle-shared.service');

/**
 * Build calendar event payloads from normalized cycle records.
 *
 * This module contains presentation-layer assembly only (title/class/start/end),
 * keeping orchestration code in cycle.service focused on fetching and workflow.
 */
const buildCalendarEvents = async (userId, cycles) => {
  const cyclesAsc = [...cycles].sort((a, b) => new Date(a.niddahOnah.start) - new Date(b.niddahOnah.start));
  const nextCycleStartById = new Map();
  for (let i = 0; i < cyclesAsc.length; i++) {
    const nextCycle = cyclesAsc[i + 1];
    nextCycleStartById.set(String(cyclesAsc[i]._id), nextCycle?.niddahOnah?.start ? new Date(nextCycle.niddahOnah.start) : null);
  }

  const profile = await Profiles.findById(userId).select('location');
  const location = profile?.location;
  const events = [];

  cycles.forEach((cycle) => {
    if (cycle.niddahOnah && cycle.niddahOnah.start) {
      events.push({ id: `${cycle._id}-niddah`, title: '🩸 Period Start', start: cycle.niddahOnah.start, allDay: false, className: 'niddah-start', groupID: cycle._id, extendedProps: { onahEnd: cycle.niddahOnah.end } });
    }
    if (cycle.hefsekTaharaDate) {
      events.push({ id: `${cycle._id}-hefsek`, title: '✅ Hefsek Tahara', start: cycle.hefsekTaharaDate, className: 'hefsek-tahara', groupID: cycle._id });
    }
    if (cycle.periodVoidedInfo?.isVoided && cycle.periodVoidedInfo.voidedHefsekTaharaDate) {
      events.push({ id: `${cycle._id}-voided-hefsek`, title: '✅ Voided Hefsek', start: cycle.periodVoidedInfo.voidedHefsekTaharaDate, className: 'hefsek-tahara voided', groupID: cycle._id });
    }

    if (cycle.mikvahDate && location) {
      const calcLocation = getPeriodCalculationLocation(cycle, location);
      if (calcLocation?.lat != null && calcLocation?.lng != null && calcLocation?.timezone) {
        const loc = new Location(calcLocation.lat, calcLocation.lng, false, calcLocation.timezone);
        const sunset = new Zmanim(loc, cycle.mikvahDate, false).sunset();
        if (sunset) events.push({ id: `${cycle._id}-mikvah`, title: '🌙 Mikvah', start: sunset, allDay: false, className: 'mikvah', groupID: cycle._id });
      }
    }

    if (cycle.bedikot?.length) {
      const isVoided = cycle.periodVoidedInfo?.isVoided || false;
      const voidedByBedikaId = cycle.periodVoidedInfo?.voidedByBedikaId;
      cycle.bedikot.forEach((bedikah, index) => {
        const isUncleanBedikah = isVoided && bedikah._id && bedikah._id.equals(voidedByBedikaId);
        const makeEvent = (slot) => {
          const result = bedikah.results?.[slot] || 'clean';
          let title = `🔍 ${slot === 'morning' ? 'Morning' : 'Evening'} Bedikah (Day ${bedikah.dayNumber})`;
          let className = `bedikah bedikah-${result}`;
          if (isUncleanBedikah && result === 'not_clean') { title = '🩸 Unclean Bedikah (Voids Hefsek)'; className = 'bedikah-not_clean hefsek-voiding'; }
          else if (isVoided && !isUncleanBedikah) title = `🔍 Voided ${slot === 'morning' ? 'Morning' : 'Evening'} Bedikah (Day ${bedikah.dayNumber})`;
          events.push({ id: `${cycle._id}-bedikah-${index}-${slot}`, title, start: bedikah.date, end: bedikah.date, className, groupID: cycle._id });
        };
        if (bedikah.timeOfDay === 'morning' || bedikah.timeOfDay === 'both') makeEvent('morning');
        if (bedikah.timeOfDay === 'evening' || bedikah.timeOfDay === 'both') makeEvent('evening');
      });
    }

    if (cycle.vestOnot) {
      const vesetHachodeshEvents = Array.isArray(cycle.vestOnot.vesetHachodesh) ? cycle.vestOnot.vesetHachodesh : cycle.vestOnot.vesetHachodesh ? [cycle.vestOnot.vesetHachodesh] : [];
      vesetHachodeshEvents.forEach((veset, index) => { if (veset?.start) events.push({ id: `${cycle._id}-veset-${index}`, title: '📅 Veset HaChodesh', start: veset.start, allDay: false, className: 'vest-onah veset-hachodesh', groupID: cycle._id, extendedProps: { onahEnd: veset.end, hebrewDate: veset.hebrewDate } }); });

      const haflagahEvents = Array.isArray(cycle.vestOnot.haflagah) ? cycle.vestOnot.haflagah : cycle.vestOnot.haflagah ? [cycle.vestOnot.haflagah] : [];
      const nextCycleStart = nextCycleStartById.get(String(cycle._id));
      const activeHaflagahEvents = haflagahEvents.filter((h) => h?.start && (!nextCycleStart || new Date(h.start).getTime() < nextCycleStart.getTime()));
      const hasDual = activeHaflagahEvents.length > 1;
      activeHaflagahEvents.forEach((h, index) => events.push({ id: `${cycle._id}-haflagah-${index}`, title: hasDual ? (index === 0 ? '⏱️ Haflagah (new interval)' : '⏱️ Haflagah (previous interval)') : '⏱️ Haflagah', start: h.start, allDay: false, className: 'vest-onah haflagah', groupID: cycle._id, extendedProps: { onahEnd: h.end, hebrewDate: h.hebrewDate } }));

      if (cycle.vestOnot.onahBeinonit?.start) {
        events.push({ id: `${cycle._id}-beinonit`, title: '🔄 Onah Beinonit', start: cycle.vestOnot.onahBeinonit.start, allDay: false, className: 'vest-onah onah-beinonit', groupID: cycle._id, extendedProps: { onahEnd: cycle.vestOnot.onahBeinonit.end, hebrewDate: cycle.vestOnot.onahBeinonit.hebrewDate } });
      }
    }
  });

  return events;
};

module.exports = { buildCalendarEvents };
