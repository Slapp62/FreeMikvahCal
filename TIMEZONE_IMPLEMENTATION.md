# Timezone and Hebrew Calendar Implementation

## Overview

This document describes the timezone-aware implementation for the FreeMikvahCal application. Proper timezone handling is **CRITICAL** for accurate Hebrew calendar calculations, as halachic days begin at sunset, not midnight.

## The Problem

### Issue 1: Server vs User Timezone
- User in Israel logs period at 10 PM local time on January 15
- Server in UTC might record it as January 16 at 8 PM
- **Wrong day recorded!**

### Issue 2: Hebrew Day Boundaries
- Hebrew days start at sunset (shkiah), not midnight
- January 15 at 8 PM might be:
  - 16 Tevet if sunset was 6 PM (already next Hebrew day)
  - 15 Tevet if sunset was 9 PM (still same Hebrew day)

## Solution Architecture

### Core Principles

1. **Store in UTC, Display in Local**
   - MongoDB stores all dates as UTC timestamps
   - Convert to user's timezone for calculations/display
   - Never trust client timezone offsets

2. **User Location is Critical**
   - Store IANA timezone name (e.g., "Asia/Jerusalem")
   - Use timezone for ALL date calculations
   - Get sunset times based on lat/lon

3. **Hebrew Day Boundaries**
   - Use @hebcal/core Zmanim for sunset times
   - Consider sunset when determining Hebrew dates
   - Track onah (day/night) for each event

## Implementation Details

### 1. Database Schema Changes

#### Users Model
```javascript
location: {
  city: String,
  geonameId: Number,
  lat: Number,
  lng: Number,
  timezone: {
    type: String,
    required: true,
    default: 'UTC'  // IANA timezone name
  }
}
```

**Important:**
- Always use IANA timezone names ("Asia/Jerusalem", not "+02:00")
- Handles DST automatically
- Required for all date calculations

#### Cycles Model
```javascript
// Dates (stored as UTC)
niddahStartDate: { type: Date, required: true },

// Onah tracking
niddahStartOnah: {
  type: String,
  enum: ['day', 'night'],
  required: true
},

// Timezone info
calculatedInTimezone: {
  type: String,
  required: true
},

niddahStartSunset: {
  type: Date
},

// Vest Onot with full timezone info
vestOnot: {
  yomHachodesh: {
    date: Date,
    onah: String,
    hebrewDate: String,
    sunset: Date,
    sunrise: Date
  },
  // ... similar for other vest onot
}
```

### 2. Utility Functions

File: `utils/hebrewDateTime.js`

#### Key Functions

**getHebrewDateForTimestamp(timestamp, location)**
- Determines Hebrew date considering sunset
- Returns onah (day/night)
- Uses Hebcal's sunset-aware function

**createDateInTimezone(dateString, timeString, timezone)**
- Creates UTC Date from user's local time
- Uses Luxon for proper timezone handling

**getVestInfo(date, location, matchingOnah)**
- Calculates vest onah information
- Includes sunset/sunrise times
- Returns Hebrew date and onah

### 3. Updated Cycles Pre-Save Hook

```javascript
cycleSchema.pre('save', async function(next) {
  // Get user's timezone
  const user = await Users.findById(this.userId).select('location');
  const location = {
    lat: user.location.lat,
    lng: user.location.lng,
    timezone: user.location.timezone
  };

  // Calculate Hebrew date with sunset awareness
  const hebrewInfo = getHebrewDateForTimestamp(
    this.niddahStartDate,
    location
  );

  // Store timezone metadata
  this.calculatedInTimezone = location.timezone;
  this.niddahStartSunset = hebrewInfo.sunset;
  this.niddahStartOnah = hebrewInfo.onah;

  // Calculate vest onot with timezone
  await this.calculateVestOnot(previousCycles, location);
});
```

### 4. Updated Vest Onot Calculation

```javascript
cycleSchema.methods.calculateVestOnot = async function(previousCycles, location) {
  const matchingOnah = this.niddahStartOnah;

  // Each vest onah gets full timezone info
  const ohrDate = new Date(this.niddahStartDate);
  ohrDate.setDate(ohrDate.getDate() + 30);
  this.vestOnot.ohrHachodesh = getVestInfo(ohrDate, location, matchingOnah);

  // ... similar for other vest onot
};
```

## API Usage

### Creating a Cycle

```javascript
// Backend Controller
const createCycle = async (req, res, next) => {
  const { dateString, timeString } = req.body;
  // dateString: "2025-01-15"
  // timeString: "22:30"

  const user = await Users.findById(req.user._id).select('location');
  const timezone = user.location.timezone;

  // Convert user's local time to UTC
  const { DateTime } = require('luxon');
  const localDateTime = DateTime.fromISO(
    `${dateString}T${timeString}`,
    { zone: timezone }
  );
  const utcDate = localDateTime.toJSDate();

  // Create cycle (pre-save hook handles timezone calculations)
  const cycle = new Cycles({
    userId: req.user._id,
    niddahStartDate: utcDate,
    status: 'niddah'
  });

  await cycle.save();
};
```

### Retrieving Cycles

```javascript
// Backend Controller
const getUserCycles = async (req, res, next) => {
  const cycles = await Cycles.find({ userId: req.user._id });
  const user = await Users.findById(req.user._id).select('location');

  // Format dates for user's timezone
  const formatted = cycles.map(cycle => {
    const normalized = normalizeCycle(cycle);

    // Add local time strings
    normalized.niddahStartDate_local = cycle.niddahStartDate
      .toLocaleString('en-US', { timeZone: user.location.timezone });

    return normalized;
  });

  res.json(formatted);
};
```

## Frontend Integration

### Detect User Timezone

```typescript
// Get user's IANA timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Returns: "Asia/Jerusalem", "America/New_York", etc.

// Send to backend on registration
await axios.post('/api/users/location', {
  timezone: userTimezone,
  // ... other location data
});
```

### Display Dates

```typescript
const displayDate = (utcDateString: string, timezone: string) => {
  const date = new Date(utcDateString);
  return date.toLocaleDateString('he-IL', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

## Migration

For existing data without timezone information, run:

```bash
node scripts/migrateTimezones.js
```

This script:
1. Sets default timezone for users (defaults to Asia/Jerusalem)
2. Backfills timezone fields in existing cycles
3. Recalculates Hebrew dates with sunset awareness

**Important:** Update `DEFAULT_TIMEZONE` in the script based on your user base.

## Testing

### Test Scenarios

1. **Before Sunset**
   - User in Jerusalem logs at 4 PM
   - Sunset is 5:30 PM
   - Should be recorded as "day" onah
   - Hebrew date: same as Gregorian date

2. **After Sunset**
   - User in Jerusalem logs at 10 PM
   - Sunset was 5:30 PM
   - Should be recorded as "night" onah
   - Hebrew date: NEXT day from Gregorian date

3. **DST Boundaries**
   - Test around DST changes (late March, late October in Israel)
   - Sunset times should automatically adjust

4. **Multiple Timezones**
   - Test with users in different timezones
   - Verify each calculation uses correct timezone

### Running Tests

```bash
# Test timezone utilities
npm test -- hebrewDateTime.test.js

# Test cycle calculations
npm test -- cycles.test.js
```

## Common Pitfalls

### ❌ DON'T: Store dates as strings
```javascript
niddahStartDate: "2025-01-15T22:00:00+02:00" // BAD
```

### ✅ DO: Store as Date objects (UTC)
```javascript
niddahStartDate: new Date("2025-01-15T20:00:00Z") // GOOD
calculatedInTimezone: "Asia/Jerusalem"
```

### ❌ DON'T: Use UTC offsets
```javascript
timezone: "+02:00" // BAD - breaks with DST
```

### ✅ DO: Use IANA timezone names
```javascript
timezone: "Asia/Jerusalem" // GOOD - handles DST
```

### ❌ DON'T: Forget sunset boundary
```javascript
const hebrewDate = new HDate(gregorianDate); // BAD
```

### ✅ DO: Use sunset-aware function
```javascript
const hebrewDate = Zmanim.makeSunsetAwareHDate(location, timestamp); // GOOD
```

## Dependencies

```json
{
  "@hebcal/core": "^5.8.0",  // Hebrew calendar & zmanim
  "luxon": "^3.x.x"           // Timezone handling
}
```

## File Locations

- **Utils**: `backend/utils/hebrewDateTime.js`
- **Users Model**: `backend/models/Users.js`
- **Cycles Model**: `backend/models/Cycles.js`
- **Migration**: `backend/scripts/migrateTimezones.js`

## Checklist

- [x] Install luxon package
- [x] Create hebrewDateTime utilities
- [x] Update Users model with timezone
- [x] Update Cycles model with timezone fields
- [x] Update pre-save hook
- [x] Update calculateVestOnot method
- [x] Create migration script
- [x] Document implementation

## Next Steps

1. **Implement Controllers**
   - Use `createDateInTimezone` for user input
   - Use `formatDateInTimezone` for responses

2. **Frontend Integration**
   - Detect and send user timezone
   - Display dates in local time

3. **Testing**
   - Write comprehensive tests for timezone edge cases
   - Test DST boundaries
   - Test multiple timezones

4. **Documentation**
   - API documentation for timezone handling
   - User guide for timezone selection

## Support

For questions about timezone implementation:
1. Check logs in `backend/logs/`
2. Verify timezone is set in user profile
3. Test with migration script first
4. Check Hebcal documentation for zmanim

## References

- [Hebcal Core Documentation](https://github.com/hebcal/hebcal-es6)
- [Luxon Documentation](https://moment.github.io/luxon/)
- [IANA Timezone Database](https://www.iana.org/time-zones)
- [Hebrew Calendar Basics](https://www.hebcal.com/home/195/jewish-calendar)
